import { randomBytes } from "node:crypto";

const GUEST_SLUG = /^[A-Za-z0-9_-]{1,80}$/;

export function createGuestSlug() {
  return randomBytes(16).toString("base64url");
}

export function isGuestSlug(value: unknown): value is string {
  return typeof value === "string" && GUEST_SLUG.test(value);
}

export function normalizeEventName(name: string) {
  return name.trim();
}

export function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
