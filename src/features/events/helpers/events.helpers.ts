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

const PUBLIC_EVENT_ERRORS = new Set([
  "Too many requests. Try again later.",
  "Event name must be 1–80 characters",
  "Invalid preset",
  "Color must be #RRGGBB",
  "Event not found",
  "Invalid host",
]);

export function publicEventError(caughtError: unknown, fallback: string) {
  const message = caughtError instanceof Error ? caughtError.message : "";
  // NEXT-ERROR-001: driver and network errors stay on the server.
  return PUBLIC_EVENT_ERRORS.has(message) ? message : fallback;
}

export function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
