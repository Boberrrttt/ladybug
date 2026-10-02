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

const DRIVE_HOSTS = new Set(["drive.google.com", "docs.google.com"]);

export function normalizeDriveUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Drive link must be a Google Drive URL");
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    !DRIVE_HOSTS.has(parsed.hostname)
  ) {
    throw new Error("Drive link must be a Google Drive URL");
  }
  return parsed.toString();
}

export function readDriveUrl(raw: string | null | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    return normalizeDriveUrl(raw) ?? undefined;
  } catch {
    return undefined;
  }
}

const PUBLIC_EVENT_ERRORS = new Set([
  "Too many requests. Try again later.",
  "Event name must be 1–80 characters",
  "Invalid preset",
  "Color must be #RRGGBB",
  "Event not found",
  "Invalid host",
  "Drive link must be a Google Drive URL",
]);

export function publicEventError(caughtError: unknown, fallback: string) {
  const message = caughtError instanceof Error ? caughtError.message : "";
  return PUBLIC_EVENT_ERRORS.has(message) ? message : fallback;
}

export function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
