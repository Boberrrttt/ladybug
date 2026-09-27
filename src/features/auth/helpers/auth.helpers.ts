import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return email.includes("@") && email.includes(".");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) {
    return false;
  }
  const expected = Buffer.from(hashHex, "hex");
  const derived = (await scryptAsync(password, Buffer.from(saltHex, "hex"), 64)) as Buffer;
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
