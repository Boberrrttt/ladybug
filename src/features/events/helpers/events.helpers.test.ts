import assert from "node:assert/strict";
import { test } from "node:test";
import { createGuestSlug, isGuestSlug, publicEventError } from "./events.helpers.ts";

test("isGuestSlug accepts stored and generated slugs", () => {
  assert.equal(isGuestSlug("saturday-garden"), true);
  assert.equal(isGuestSlug(createGuestSlug()), true);
});

test("publicEventError hides unknown failures", () => {
  assert.equal(publicEventError(new Error("Event not found"), "Could not create event"), "Event not found");
  assert.equal(publicEventError(new Error("connect ECONNREFUSED"), "Could not create event"), "Could not create event");
  assert.equal(publicEventError("nope", "Could not save look"), "Could not save look");
});

test("isGuestSlug rejects empty, long, and unsafe values", () => {
  assert.equal(isGuestSlug(""), false);
  assert.equal(isGuestSlug("saturday garden"), false);
  assert.equal(isGuestSlug("foo/bar"), false);
  assert.equal(isGuestSlug("$gt"), false);
  assert.equal(isGuestSlug("x".repeat(81)), false);
  assert.equal(isGuestSlug(null), false);
});
