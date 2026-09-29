import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getHostFromSessionToken } from "@/features/auth/services/auth.service";
import { SESSION_COOKIE } from "@/server/session-token";

function contentSecurityPolicy(nonce: string) {
  const imageKitOrigin = (() => {
    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;
    if (!endpoint) {
      return "";
    }
    try {
      return ` ${new URL(endpoint).origin}`;
    } catch {
      return "";
    }
  })();
  const scriptEval = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";
  const connectSrc =
    process.env.NODE_ENV === "production" ? "connect-src 'self'" : "connect-src 'self' ws: wss:";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${scriptEval}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://ik.imagekit.io https://*.imagekit.io${imageKitOrigin}`,
    `media-src 'self' blob: https://ik.imagekit.io https://*.imagekit.io${imageKitOrigin}`,
    "font-src 'self'",
    connectSrc,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  const csp = contentSecurityPolicy(nonce);

  let response: NextResponse;
  if (request.nextUrl.pathname.startsWith("/events")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !(await getHostFromSessionToken(token))) {
      response = NextResponse.redirect(new URL("/login", request.url));
      response.headers.set("Content-Security-Policy", csp);
      return response;
    }
  }

  response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|pins/).*)"],
};
