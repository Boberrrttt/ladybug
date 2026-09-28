import { ensureIndexes, getCollection } from "@/server/db";
import { clientIpFromHeaders } from "@/shared/helpers/request.helpers";
import { assertRateLimit } from "./helpers/rate-limit.helpers";

export { assertRateLimit } from "./helpers/rate-limit.helpers";

type RateLimitDoc = {
  _id: string;
  count: number;
  resetAt: Date;
};

async function assertSharedRateLimit(key: string, limit: number, windowMs: number) {
  if (!process.env.MONGODB_URI) {
    assertRateLimit(key, limit, windowMs);
    return;
  }
  await ensureIndexes();
  const now = Date.now();
  const collection = getCollection<RateLimitDoc>("rateLimits");
  const existing = await collection.findOne({ _id: key });
  if (!existing || now >= existing.resetAt.getTime()) {
    await collection.updateOne(
      { _id: key },
      { $set: { count: 1, resetAt: new Date(now + windowMs) } },
      { upsert: true },
    );
    return;
  }
  const updated = await collection.findOneAndUpdate(
    { _id: key, count: { $lt: limit }, resetAt: { $gt: new Date(now) } },
    { $inc: { count: 1 } },
    { returnDocument: "after" },
  );
  if (!updated) {
    throw new Error("Too many requests. Try again later.");
  }
}

async function clientIp() {
  const { headers } = await import("next/headers");
  const headerStore = await headers();
  return clientIpFromHeaders(headerStore.get("x-forwarded-for"), headerStore.get("x-real-ip"));
}

export async function assertAuthRateLimit(kind: "login" | "signup") {
  const ip = await clientIp();
  await assertSharedRateLimit(`${kind}:${ip}`, kind === "signup" ? 5 : 10, 15 * 60 * 1000);
}

export async function assertGuestUploadRateLimit(guestSlug: string) {
  const ip = await clientIp();
  await assertSharedRateLimit(`upload:guest:${guestSlug}:${ip}`, 30, 60 * 1000);
}

export async function assertHostUploadRateLimit(hostId: string) {
  await assertSharedRateLimit(`upload:host:${hostId}`, 60, 60 * 1000);
}
