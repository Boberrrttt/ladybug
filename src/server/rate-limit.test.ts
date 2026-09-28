import assert from "node:assert/strict";
import { test } from "node:test";
import { assertRateLimit } from "./helpers/rate-limit.helpers.ts";

test("assertRateLimit blocks after the limit", () => {
  const key = "test-block";
  assertRateLimit(key, 2, 60_000, 1000);
  assertRateLimit(key, 2, 60_000, 1000);
  assert.throws(() => assertRateLimit(key, 2, 60_000, 1000), /Too many requests/);
});

test("assertRateLimit resets after the window", () => {
  const key = "test-reset";
  assertRateLimit(key, 1, 100, 1000);
  assert.throws(() => assertRateLimit(key, 1, 100, 1000), /Too many requests/);
  assertRateLimit(key, 1, 100, 1100);
});
