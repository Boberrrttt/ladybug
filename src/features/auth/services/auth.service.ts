import "server-only";

import { ObjectId, type WithId } from "mongodb";
import { ensureIndexes, getCollection } from "@/server/db";
import { readSession } from "@/server/session";
import { verifySessionToken, type SessionPayload } from "@/server/session-token";
import type { User } from "@/shared/types";
import {
  hashPassword,
  isValidEmail,
  isValidPassword,
  MAX_PASSWORD_LENGTH,
  normalizeEmail,
  verifyPassword,
} from "../helpers/auth.helpers";

type UserDoc = {
  email: string;
  passwordHash: string;
  createdAt: Date;
  tokenVersion?: number;
};

function users() {
  return getCollection<UserDoc>("users");
}

function serializeUser(doc: WithId<UserDoc>): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    createdAt: doc.createdAt.toISOString(),
    tokenVersion: doc.tokenVersion ?? 0,
  };
}

export async function signUp(email: string, password: string) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized) || !isValidPassword(password)) {
    throw new Error("Use a valid email and a password of 12–128 characters");
  }
  await ensureIndexes();
  const existing = await users().findOne({ email: normalized });
  if (existing) {
    throw new Error("Could not create account");
  }
  const createdAt = new Date();
  const result = await users().insertOne({
    email: normalized,
    passwordHash: await hashPassword(password),
    createdAt,
    tokenVersion: 0,
  });
  return serializeUser({
    _id: result.insertedId,
    email: normalized,
    passwordHash: "",
    createdAt,
    tokenVersion: 0,
  });
}

export async function logIn(email: string, password: string) {
  if (password.length < 1 || password.length > MAX_PASSWORD_LENGTH) {
    throw new Error("Invalid email or password");
  }
  const normalized = normalizeEmail(email);
  await ensureIndexes();
  const doc = await users().findOne({ email: normalized });
  if (!doc || !(await verifyPassword(password, doc.passwordHash))) {
    throw new Error("Invalid email or password");
  }
  return serializeUser(doc);
}

export async function getHostFromSessionToken(token: string) {
  return hostFromSession(await verifySessionToken(token));
}

export async function getHost() {
  return hostFromSession(await readSession());
}

async function hostFromSession(session: SessionPayload | null) {
  if (!session || !ObjectId.isValid(session.userId)) {
    return null;
  }
  if (!process.env.MONGODB_URI) {
    return null;
  }
  await ensureIndexes();
  const doc = await users().findOne({ _id: new ObjectId(session.userId) });
  if (!doc || (doc.tokenVersion ?? 0) !== session.tokenVersion) {
    return null;
  }
  return serializeUser(doc);
}

export async function incrementTokenVersion(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return;
  }
  await users().updateOne({ _id: new ObjectId(userId) }, { $inc: { tokenVersion: 1 } });
}
