export function clientIpFromHeaders(forwardedFor: string | null, realIp: string | null) {
  const forwarded = forwardedFor?.split(",").pop()?.trim();
  if (forwarded) {
    return forwarded;
  }
  return realIp?.trim() || "unknown";
}
