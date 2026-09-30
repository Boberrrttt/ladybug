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
