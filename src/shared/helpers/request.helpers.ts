export function shouldTrustProxy(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.TRUST_PROXY === "false") {
    return false;
  }
  return env.TRUST_PROXY === "true" || env.VERCEL === "1";
}

export function clientIpFromHeaders(
  forwardedFor: string | null,
  realIp: string | null,
  trustProxy = shouldTrustProxy(),
): string | null {
  if (!trustProxy) {
    return null;
  }
  const platformIp = realIp?.trim();
  if (platformIp) {
    return platformIp;
  }
  const forwarded = forwardedFor?.split(",")[0]?.trim();
  if (forwarded) {
    return forwarded;
  }
  return null;
}

export function contentLengthMissing(header: string | null) {
  if (!header) {
    return true;
  }
  const length = Number(header);
  return !Number.isFinite(length) || length < 0;
}

export function contentLengthExceeds(header: string | null, maxBytes: number) {
  if (contentLengthMissing(header) || !header) {
    return false;
  }
  return Number(header) > maxBytes;
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
