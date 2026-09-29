export function clientIpFromHeaders(forwardedFor: string | null, realIp: string | null) {
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
