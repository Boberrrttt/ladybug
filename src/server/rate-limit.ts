import { MongoServerError } from "mongodb";
import { ensureIndexes, getCollection } from "@/server/db";
import { clientIpFromHeaders } from "@/shared/helpers/request.helpers";
import { assertRateLimit } from "./helpers/rate-limit.helpers";

export { assertRateLimit } from "./helpers/rate-limit.helpers";

type RateLimitDoc = {
  _id: string;
  count: number;
  resetAt: Date;
};

function isDuplicateKey(caughtError: unknown) {
  return caughtError instanceof MongoServerError && caughtError.code === 11000;
}

async function assertSharedRateLimit(key: string, limit: number, windowMs: number) {
  if (!process.env.MONGODB_URI) {
    assertRateLimit(key, limit, windowMs);
    return;
  }
  await ensureIndexes();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMs);
  const collection = getCollection<RateLimitDoc>("rateLimits");

  const incremented = await collection.findOneAndUpdate(
    { _id: key, count: { $lt: limit }, resetAt: { $gt: now } },
    { $inc: { count: 1 } },
    { returnDocument: "after" },
  );
  if (incremented) {
    return;
  }

  const reset = await collection.findOneAndUpdate(
    { _id: key, resetAt: { $lte: now } },
    { $set: { count: 1, resetAt: windowEnd } },
    { returnDocument: "after" },
  );
  if (reset) {
    return;
  }

  try {
    await collection.insertOne({ _id: key, count: 1, resetAt: windowEnd });
    return;
  } catch (caughtError) {
    if (!isDuplicateKey(caughtError)) {
      throw caughtError;
    }
  }

  const retry = await collection.findOneAndUpdate(
    { _id: key, count: { $lt: limit }, resetAt: { $gt: now } },
    { $inc: { count: 1 } },
    { returnDocument: "after" },
  );
  if (!retry) {
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

export async function assertHostMutationRateLimit(hostId: string) {
  await assertSharedRateLimit(`mutate:host:${hostId}`, 60, 60 * 1000);
}

export async function assertEventCreateRateLimit(hostId: string) {
  await assertSharedRateLimit(`event-create:${hostId}`, 10, 15 * 60 * 1000);
}
