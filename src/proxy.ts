import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getHostFromSessionToken } from "@/features/auth/services/auth.service";
import { MAX_PHOTO_BYTES } from "@/features/photos/helpers/photos.helpers";
import { assertEarlyActionRateLimit } from "@/server/rate-limit";
import { SESSION_COOKIE } from "@/server/session-token";
import {
  clientIpFromHeaders,
  contentLengthExceeds,
  contentLengthMissing,
  resolveLoginUrl,
} from "@/shared/helpers/request.helpers";

const BASE_SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

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

function applySecurityHeaders(response: NextResponse, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "private, no-store");
  for (const [key, value] of Object.entries(BASE_SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
}

function redirectToLogin() {
  const loginUrl = resolveLoginUrl();
  if (!loginUrl) {
    return new NextResponse(null, { status: 307, headers: { Location: "/login" } });
  }
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  const csp = contentSecurityPolicy(nonce);

  let response: NextResponse;
  if (request.method === "POST") {
    const contentLength = request.headers.get("content-length");
    if (contentLengthMissing(contentLength)) {
      response = new NextResponse("Length required", { status: 411 });
      applySecurityHeaders(response, csp);
      return response;
    }
    if (contentLengthExceeds(contentLength, MAX_PHOTO_BYTES)) {
      response = new NextResponse("Payload too large", { status: 413 });
      applySecurityHeaders(response, csp);
      return response;
    }
  }

  if (request.method === "POST" && request.headers.has("next-action")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const host = token ? await getHostFromSessionToken(token) : null;
    const ip = clientIpFromHeaders(
      request.headers.get("x-forwarded-for"),
      request.headers.get("x-real-ip"),
    );
    try {
      await assertEarlyActionRateLimit(ip, host ? 60 : 20);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "";
      if (!message.startsWith("Too many")) {
        throw caughtError;
      }
      response = new NextResponse(message, { status: 429 });
      applySecurityHeaders(response, csp);
      return response;
    }
  }

  if (request.nextUrl.pathname.startsWith("/events")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !(await getHostFromSessionToken(token))) {
      response = redirectToLogin();
      applySecurityHeaders(response, csp);
      return response;
    }
  }

  response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  applySecurityHeaders(response, csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|pins/).*)"],
};
