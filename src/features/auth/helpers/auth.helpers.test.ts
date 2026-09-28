import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, isValidEmail, isValidPassword, normalizeEmail, verifyPassword } from "./auth.helpers.ts";

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  Host@Event.COM "), "host@event.com");
});

test("isValidEmail requires a local part, at-sign, and a dotted host", () => {
  assert.equal(isValidEmail("host@event.com"), true);
  assert.equal(isValidEmail("no-at"), false);
  assert.equal(isValidEmail("foo@bar"), false);
  assert.equal(isValidEmail(`${"x".repeat(250)}@e.co`), false);
});

test("isValidPassword enforces 8–128 characters", () => {
  assert.equal(isValidPassword("short"), false);
  assert.equal(isValidPassword("correct-horse"), true);
  assert.equal(isValidPassword("x".repeat(128)), true);
  assert.equal(isValidPassword("x".repeat(129)), false);
});

test("hashPassword then verifyPassword matches", async () => {
  const stored = await hashPassword("correct-horse");
  assert.equal(await verifyPassword("correct-horse", stored), true);
  assert.equal(await verifyPassword("wrong-horse", stored), false);
});
