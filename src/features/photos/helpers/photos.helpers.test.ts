import assert from "node:assert/strict";
import { test } from "node:test";
import { isImageKitUrl } from "./photos.helpers.ts";

test("isImageKitUrl accepts ImageKit hosts", () => {
  assert.equal(isImageKitUrl("https://ik.imagekit.io/demo/photo.jpg"), true);
  assert.equal(isImageKitUrl("http://ik.imagekit.io/demo/photo.jpg"), false);
  assert.equal(isImageKitUrl("https://evil.example/photo.jpg"), false);
  assert.equal(
    isImageKitUrl("https://cdn.example.com/photo.jpg", "https://cdn.example.com"),
    true,
  );
});
