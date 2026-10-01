import assert from "node:assert/strict";
import { test } from "node:test";
import { MediaKind } from "../../../shared/media-kind.ts";
import {
  formatMediaCount,
  getMediaKind,
  hasAllowedMediaMagic,
  isAllowedMediaFile,
  isImageKitUrl,
  rejectMediaReason,
  gridThumbUrl,
  imageKitMediaUrl,
  isImageKitFileId,
  uploadBudgetError,
} from "./photos.helpers.ts";

test("isAllowedMediaFile rejects svg and oversized files", () => {
  assert.equal(isAllowedMediaFile(new File([new Uint8Array([1])], "ok.jpg", { type: "image/jpeg" })), true);
  assert.equal(isAllowedMediaFile(new File([new Uint8Array([1])], "no.svg", { type: "image/svg+xml" })), false);
  const bigImage = new File([new Uint8Array([1])], "big.jpg", { type: "image/jpeg" });
  Object.defineProperty(bigImage, "size", { value: 101 * 1024 * 1024 });
  assert.equal(isAllowedMediaFile(bigImage), false);
  const bigVideo = new File([new Uint8Array([1])], "big.mp4", { type: "video/mp4" });
  Object.defineProperty(bigVideo, "size", { value: 26 * 1024 * 1024 });
  assert.equal(isAllowedMediaFile(bigVideo), false);
  assert.equal(isAllowedMediaFile(new File([new Uint8Array([1])], "ok.mp4", { type: "video/mp4" })), true);
});

test("rejectMediaReason returns size and type messages", () => {
  assert.equal(rejectMediaReason(new File([new Uint8Array([1])], "x.txt", { type: "text/plain" })), "Unsupported file type.");
  const bigImage = new File([new Uint8Array([1])], "big.jpg", { type: "image/jpeg" });
  Object.defineProperty(bigImage, "size", { value: 101 * 1024 * 1024 });
  assert.equal(rejectMediaReason(bigImage), "Image too large (max 100MB).");
  const bigVideo = new File([new Uint8Array([1])], "big.mp4", { type: "video/mp4" });
  Object.defineProperty(bigVideo, "size", { value: 26 * 1024 * 1024 });
  assert.equal(rejectMediaReason(bigVideo), "Video too large (max 25MB).");
  assert.equal(rejectMediaReason(new File([new Uint8Array([1])], "ok.jpg", { type: "image/jpeg" })), null);
});

test("formatMediaCount names photos and videos", () => {
  assert.equal(formatMediaCount([]), "No media");
  assert.equal(formatMediaCount([{ mediaKind: MediaKind.IMAGE }]), "1 photo");
  assert.equal(formatMediaCount([{ mediaKind: MediaKind.VIDEO }, { mediaKind: MediaKind.VIDEO }]), "2 videos");
  assert.equal(
    formatMediaCount([{ mediaKind: MediaKind.IMAGE }, { mediaKind: MediaKind.IMAGE }, { mediaKind: MediaKind.VIDEO }]),
    "2 photos, 1 video",
  );
});

test("getMediaKind maps mime types", () => {
  assert.equal(getMediaKind(new File([], "a.jpg", { type: "image/jpeg" })), "IMAGE");
  assert.equal(getMediaKind(new File([], "a.mp4", { type: "video/mp4" })), "VIDEO");
  assert.equal(getMediaKind(new File([], "a.webm", { type: "video/webm" })), "VIDEO");
  assert.equal(getMediaKind(new File([], "a.txt", { type: "text/plain" })), null);
});

test("hasAllowedMediaMagic accepts jpeg png gif webp mp4 webm", async () => {
  const jpeg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], "a.jpg", { type: "image/jpeg" });
  const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00])], "a.png", { type: "image/png" });
  const gif = new File([new Uint8Array([0x47, 0x49, 0x46, 0x38])], "a.gif", { type: "image/gif" });
  const webpBytes = new Uint8Array(12);
  webpBytes.set([0x52, 0x49, 0x46, 0x46], 0);
  webpBytes.set([0x57, 0x45, 0x42, 0x50], 8);
  const webp = new File([webpBytes], "a.webp", { type: "image/webp" });
  const mp4 = new File([new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70])], "a.mp4", {
    type: "video/mp4",
  });
  const webm = new File([new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x00])], "a.webm", { type: "video/webm" });
  const spoof = new File([new Uint8Array([0x00, 0x00, 0x00, 0x00])], "a.jpg", { type: "image/jpeg" });
  const spoofVideo = new File([new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])], "a.mp4", {
    type: "video/mp4",
  });
  assert.equal(await hasAllowedMediaMagic(jpeg), true);
  assert.equal(await hasAllowedMediaMagic(png), true);
  assert.equal(await hasAllowedMediaMagic(gif), true);
  assert.equal(await hasAllowedMediaMagic(webp), true);
  assert.equal(await hasAllowedMediaMagic(mp4), true);
  assert.equal(await hasAllowedMediaMagic(webm), true);
  assert.equal(await hasAllowedMediaMagic(spoof), false);
  assert.equal(await hasAllowedMediaMagic(spoofVideo), false);
});

test("gridThumbUrl shrinks ImageKit files and drops other hosts", () => {
  assert.equal(
    gridThumbUrl("https://ik.imagekit.io/demo/ladybug/a.jpg"),
    "https://ik.imagekit.io/demo/ladybug/a.jpg?tr=w-400",
  );
  assert.equal(
    gridThumbUrl("https://ik.imagekit.io/demo/ladybug/a.mp4"),
    "https://ik.imagekit.io/demo/ladybug/a.mp4/ik-thumbnail.jpg?tr=w-400",
  );
  assert.equal(
    gridThumbUrl("https://ik.imagekit.io/demo/ladybug/a.webm"),
    "https://ik.imagekit.io/demo/ladybug/a.webm/ik-thumbnail.jpg?tr=w-400",
  );
  assert.equal(gridThumbUrl("https://cdn.example/a.jpg"), "");
  assert.equal(gridThumbUrl("https://notimagekit.io/a.jpg"), "");
  assert.equal(gridThumbUrl("https://imagekit.io.evil.com/a.jpg"), "");
  assert.equal(gridThumbUrl("not a url"), "");
  assert.equal(imageKitMediaUrl("https://ik.imagekit.io/demo/a.jpg"), "https://ik.imagekit.io/demo/a.jpg");
  assert.equal(imageKitMediaUrl("https://evil.example/a.jpg"), "");
  assert.equal(isImageKitFileId("abc_DEF-123"), true);
  assert.equal(isImageKitFileId("../other"), false);
  assert.equal(isImageKitFileId(""), false);
});

test("isImageKitUrl accepts only the configured endpoint", () => {
  const endpoint = "https://ik.imagekit.io/demo";
  assert.equal(isImageKitUrl("https://ik.imagekit.io/demo/photo.jpg", endpoint), true);
  assert.equal(isImageKitUrl("https://ik.imagekit.io/other/photo.jpg", endpoint), false);
  assert.equal(isImageKitUrl("https://ik.imagekit.io/demo/photo.jpg"), false);
  assert.equal(isImageKitUrl("http://ik.imagekit.io/demo/photo.jpg", endpoint), false);
  assert.equal(isImageKitUrl("https://evil.example/photo.jpg", endpoint), false);
  assert.equal(isImageKitUrl("https://cdn.example.com/photo.jpg", "https://cdn.example.com"), true);
});

test("uploadBudgetError names the cap that failed", () => {
  assert.equal(uploadBudgetError(500, 0, 1), "Album is full");
  assert.equal(uploadBudgetError(1, 500 * 1024 * 1024, 1), "Album storage limit reached");
  assert.equal(uploadBudgetError(1, 1, 1), "Album is full");
});
