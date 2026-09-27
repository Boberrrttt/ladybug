"use server";

import { ObjectId, type WithId } from "mongodb";
import { redirect } from "next/navigation";
import { ensureIndexes, getCollection } from "@/server/db";
import { clearSession, createSession, readSession } from "@/server/session";
import type { User } from "@/shared/types";
import {
  hashPassword,
  isValidEmail,
  normalizeEmail,
  verifyPassword,
} from "../helpers/auth.helpers";

type UserDoc = {
  email: string;
  passwordHash: string;
  createdAt: Date;
};

function users() {
  return getCollection<UserDoc>("users");
}

function serializeUser(doc: WithId<UserDoc>): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function signUp(email: string, password: string) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized) || password.length < 8) {
    throw new Error("Use a valid email and a password of at least 8 characters");
  }
  await ensureIndexes();
  const existing = await users().findOne({ email: normalized });
  if (existing) {
    throw new Error("Email already in use");
  }
  const createdAt = new Date();
  const result = await users().insertOne({
    email: normalized,
    passwordHash: await hashPassword(password),
    createdAt,
  });
  return serializeUser({
    _id: result.insertedId,
    email: normalized,
    passwordHash: "",
    createdAt,
  });
}

export async function logIn(email: string, password: string) {
  const normalized = normalizeEmail(email);
  await ensureIndexes();
  const doc = await users().findOne({ email: normalized });
  if (!doc || !(await verifyPassword(password, doc.passwordHash))) {
    throw new Error("Invalid email or password");
  }
  return serializeUser(doc);
}

export async function getHost() {
  const session = await readSession();
  if (!session || !ObjectId.isValid(session.userId)) {
    return null;
  }
  if (!process.env.MONGODB_URI) {
    return null;
  }
  await ensureIndexes();
  const doc = await users().findOne({ _id: new ObjectId(session.userId) });
  return doc ? serializeUser(doc) : null;
}

export async function signUpAction(_previous: { error: string } | null, formData: FormData) {
  try {
    const user = await signUp(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
    await createSession(user.id);
  } catch (caughtError) {
    return { error: caughtError instanceof Error ? caughtError.message : "Sign up failed" };
  }
  redirect("/events");
}

export async function logInAction(_previous: { error: string } | null, formData: FormData) {
  try {
    const user = await logIn(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
    await createSession(user.id);
  } catch (caughtError) {
    return { error: caughtError instanceof Error ? caughtError.message : "Log in failed" };
  }
  redirect("/events");
}

export async function logOutAction() {
  await clearSession();
  redirect("/");
}
