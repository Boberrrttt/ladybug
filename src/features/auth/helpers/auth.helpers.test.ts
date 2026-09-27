import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, normalizeEmail, verifyPassword } from "./auth.helpers.ts";

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  Host@Event.COM "), "host@event.com");
});

test("hashPassword then verifyPassword matches", async () => {
  const stored = await hashPassword("correct-horse");
  assert.equal(await verifyPassword("correct-horse", stored), true);
  assert.equal(await verifyPassword("wrong-horse", stored), false);
});
