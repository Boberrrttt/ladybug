import assert from "node:assert/strict";
import { test } from "node:test";
import { hasAllowedImageMagic, isAllowedImageFile, isImageKitUrl } from "./photos.helpers.ts";

test("isAllowedImageFile rejects svg and oversized files", () => {
  assert.equal(isAllowedImageFile(new File([new Uint8Array([1])], "ok.jpg", { type: "image/jpeg" })), true);
  assert.equal(isAllowedImageFile(new File([new Uint8Array([1])], "no.svg", { type: "image/svg+xml" })), false);
});

test("hasAllowedImageMagic accepts jpeg png gif webp", async () => {
  const jpeg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], "a.jpg", { type: "image/jpeg" });
  const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00])], "a.png", { type: "image/png" });
  const gif = new File([new Uint8Array([0x47, 0x49, 0x46, 0x38])], "a.gif", { type: "image/gif" });
  const webpBytes = new Uint8Array(12);
  webpBytes.set([0x52, 0x49, 0x46, 0x46], 0);
  webpBytes.set([0x57, 0x45, 0x42, 0x50], 8);
  const webp = new File([webpBytes], "a.webp", { type: "image/webp" });
  const spoof = new File([new Uint8Array([0x00, 0x00, 0x00, 0x00])], "a.jpg", { type: "image/jpeg" });
  assert.equal(await hasAllowedImageMagic(jpeg), true);
  assert.equal(await hasAllowedImageMagic(png), true);
  assert.equal(await hasAllowedImageMagic(gif), true);
  assert.equal(await hasAllowedImageMagic(webp), true);
  assert.equal(await hasAllowedImageMagic(spoof), false);
});

test("isImageKitUrl accepts ImageKit hosts", () => {
  assert.equal(isImageKitUrl("https://ik.imagekit.io/demo/photo.jpg"), true);
  assert.equal(isImageKitUrl("http://ik.imagekit.io/demo/photo.jpg"), false);
  assert.equal(isImageKitUrl("https://evil.example/photo.jpg"), false);
  assert.equal(
    isImageKitUrl("https://cdn.example.com/photo.jpg", "https://cdn.example.com"),
    true,
  );
});
