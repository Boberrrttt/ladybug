import { jwtVerify, SignJWT } from "jose";
import { UserRole } from "./enums";

export const SESSION_COOKIE = "ladybug_session";

export type SessionPayload = {
  userId: string;
  role: UserRole;
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(value);
}

export async function signSessionToken(userId: string) {
  return new SignJWT({ userId, role: UserRole.HOST })
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
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}
