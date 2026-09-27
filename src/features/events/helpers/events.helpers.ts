import { randomBytes } from "node:crypto";

export function createGuestSlug() {
  return randomBytes(16).toString("base64url");
}

export function normalizeEventName(name: string) {
  return name.trim();
}
