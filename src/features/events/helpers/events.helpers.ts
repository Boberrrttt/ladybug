import { randomBytes } from "node:crypto";

const GUEST_SLUG = /^[A-Za-z0-9_-]{22}$/;

export function createGuestSlug() {
  return randomBytes(16).toString("base64url");
}

export function isGuestSlug(value: unknown): value is string {
  return typeof value === "string" && GUEST_SLUG.test(value);
}

export function normalizeEventName(name: string) {
  return name.trim();
}
