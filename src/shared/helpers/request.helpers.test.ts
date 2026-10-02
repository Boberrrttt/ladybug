import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clientIpFromHeaders,
  contentLengthExceeds,
  contentLengthMissing,
  resolveLoginUrl,
  shouldTrustProxy,
} from "./request.helpers.ts";

test("shouldTrustProxy trusts only an explicit proxy or Vercel", () => {
  assert.equal(shouldTrustProxy({ TRUST_PROXY: "true" }), true);
  assert.equal(shouldTrustProxy({ TRUST_PROXY: "false", VERCEL: "1" }), false);
  assert.equal(shouldTrustProxy({ VERCEL: "1" }), true);
  assert.equal(shouldTrustProxy({ NODE_ENV: "production" }), false);
  assert.equal(shouldTrustProxy({ NODE_ENV: "development" }), false);
});

test("clientIpFromHeaders ignores forwarded headers when proxy is untrusted", () => {
  assert.equal(clientIpFromHeaders("1.2.3.4, 5.6.7.8", "9.9.9.9", false), null);
  assert.equal(clientIpFromHeaders("1.2.3.4", null, false), null);
});

test("contentLengthMissing rejects absent, junk, and negative lengths", () => {
  assert.equal(contentLengthMissing(null), true);
  assert.equal(contentLengthMissing("nope"), true);
  assert.equal(contentLengthMissing("-1"), true);
  assert.equal(contentLengthMissing("0"), false);
  assert.equal(contentLengthMissing("100"), false);
});

test("contentLengthExceeds rejects only a numeric length over the cap", () => {
  assert.equal(contentLengthExceeds(null, 100), false);
  assert.equal(contentLengthExceeds("100", 100), false);
  assert.equal(contentLengthExceeds("101", 100), true);
  assert.equal(contentLengthExceeds("nope", 100), false);
});

test("resolveLoginUrl uses APP_ORIGIN and never a request host", () => {
  assert.equal(resolveLoginUrl({ APP_ORIGIN: "https://album.example" })?.href, "https://album.example/login");
  assert.equal(
    resolveLoginUrl({ APP_ORIGIN: "https://album.example/ignored", NODE_ENV: "production" })?.href,
    "https://album.example/login",
  );
  assert.equal(resolveLoginUrl({ NODE_ENV: "development" })?.href, "http://localhost:3004/login");
  assert.equal(resolveLoginUrl({ NODE_ENV: "production" }), null);
  assert.equal(resolveLoginUrl({ APP_ORIGIN: "javascript:alert(1)", NODE_ENV: "production" }), null);
});

test("clientIpFromHeaders prefers platform IP then the first forwarded hop", () => {
  assert.equal(clientIpFromHeaders("1.2.3.4, 5.6.7.8", "9.9.9.9", true), "9.9.9.9");
  assert.equal(clientIpFromHeaders("1.2.3.4, 5.6.7.8", null, true), "1.2.3.4");
  assert.equal(clientIpFromHeaders(null, "9.9.9.9", true), "9.9.9.9");
  assert.equal(clientIpFromHeaders(null, null, true), null);
});
