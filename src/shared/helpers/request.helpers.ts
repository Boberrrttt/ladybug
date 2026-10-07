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

type AppOriginEnv = {
  APP_ORIGIN?: string;
  NODE_ENV?: string;
  VERCEL_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
};

export function resolveAppOrigin(
  env: AppOriginEnv = {
    APP_ORIGIN: process.env.APP_ORIGIN,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  },
) {
  const configured = env.APP_ORIGIN?.trim().replace(/\/$/, "");
  if (configured) {
    return configured;
  }
  if (env.NODE_ENV !== "production") {
    return "http://localhost:3004";
  }
  const host = (env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL)?.trim().replace(/\/$/, "");
  if (!host) {
    return "";
  }
  return `https://${host.replace(/^https?:\/\//, "")}`;
}

export function resolveLoginUrl(env?: AppOriginEnv) {
  const origin = resolveAppOrigin(env);
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
