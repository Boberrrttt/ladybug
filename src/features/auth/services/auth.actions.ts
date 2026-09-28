"use server";

import { redirect } from "next/navigation";
import { assertAuthRateLimit } from "@/server/rate-limit";
import { clearSession, createSession } from "@/server/session";
import { getHost, incrementTokenVersion, logIn, signUp } from "./auth.service";

export async function signUpAction(_previous: { error: string } | null, formData: FormData) {
  try {
    await assertAuthRateLimit("signup");
    const user = await signUp(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
    await createSession(user.id, user.tokenVersion);
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : "Could not create account";
    if (message.startsWith("Use a valid email") || message.startsWith("Too many")) {
      return { error: message };
    }
    return { error: "Could not create account" };
  }
  redirect("/events");
}

export async function logInAction(_previous: { error: string } | null, formData: FormData) {
  try {
    await assertAuthRateLimit("login");
    const user = await logIn(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
    await createSession(user.id, user.tokenVersion);
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : "Log in failed";
    if (message.startsWith("Too many")) {
      return { error: message };
    }
    return { error: "Invalid email or password" };
  }
  redirect("/events");
}

export async function logOutAction() {
  const host = await getHost();
  if (host) {
    await incrementTokenVersion(host.id);
  }
  await clearSession();
  redirect("/");
}
