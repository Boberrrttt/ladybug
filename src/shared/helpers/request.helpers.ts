export function shouldTrustProxy(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.TRUST_PROXY === "false") {
    return false;
  }
  // NEXT-PROXY-001: spoofed X-Forwarded-For skips login limits unless a proxy overwrites it.
  return env.TRUST_PROXY === "true" || env.VERCEL === "1";
}

export function clientIpFromHeaders(
  forwardedFor: string | null,
  realIp: string | null,
  trustProxy = shouldTrustProxy(),
) {
  if (!trustProxy) {
    return "unknown";
  }
  const platformIp = realIp?.trim();
  if (platformIp) {
    return platformIp;
  }
  const forwarded = forwardedFor?.split(",")[0]?.trim();
  if (forwarded) {
    return forwarded;
  }
  return "unknown";
}

export function contentLengthExceeds(header: string | null, maxBytes: number) {
  if (!header) {
    return false;
  }
  const length = Number(header);
  return Number.isFinite(length) && length > maxBytes;
}

export function resolveLoginUrl(env: { APP_ORIGIN?: string; NODE_ENV?: string } = process.env) {
  const configured = env.APP_ORIGIN?.trim().replace(/\/$/, "");
  const origin = configured || (env.NODE_ENV !== "production" ? "http://localhost:3004" : "");
  if (!origin) {
    return null;
  }
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return new URL("/login", parsed.origin);
  } catch {
    return null;
  }
}
