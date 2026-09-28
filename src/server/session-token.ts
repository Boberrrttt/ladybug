import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { UserRole } from "@/shared/enums";

export const SESSION_COOKIE = "ladybug_session";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  tokenVersion: number;
};

export const MIN_SESSION_SECRET_LENGTH = 32;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < MIN_SESSION_SECRET_LENGTH) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(value);
}

export async function signSessionToken(userId: string, tokenVersion = 0) {
  return new SignJWT({ userId, role: UserRole.HOST, tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.userId !== "string") {
      return null;
    }
    return {
      userId: payload.userId,
      role: UserRole.HOST,
      tokenVersion: typeof payload.tokenVersion === "number" ? payload.tokenVersion : 0,
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}
