import assert from "node:assert/strict";
import { test } from "node:test";
import { clientIpFromHeaders, shouldTrustProxy } from "./request.helpers.ts";

test("shouldTrustProxy trusts only an explicit proxy or Vercel", () => {
  assert.equal(shouldTrustProxy({ TRUST_PROXY: "true" }), true);
  assert.equal(shouldTrustProxy({ TRUST_PROXY: "false", VERCEL: "1" }), false);
  assert.equal(shouldTrustProxy({ VERCEL: "1" }), true);
  assert.equal(shouldTrustProxy({ NODE_ENV: "production" }), false);
  assert.equal(shouldTrustProxy({ NODE_ENV: "development" }), false);
});

test("clientIpFromHeaders ignores forwarded headers when proxy is untrusted", () => {
  assert.equal(clientIpFromHeaders("1.2.3.4, 5.6.7.8", "9.9.9.9", false), "unknown");
  assert.equal(clientIpFromHeaders("1.2.3.4", null, false), "unknown");
});

test("clientIpFromHeaders prefers platform IP then the first forwarded hop", () => {
  assert.equal(clientIpFromHeaders("1.2.3.4, 5.6.7.8", "9.9.9.9", true), "9.9.9.9");
  assert.equal(clientIpFromHeaders("1.2.3.4, 5.6.7.8", null, true), "1.2.3.4");
  assert.equal(clientIpFromHeaders(null, "9.9.9.9", true), "9.9.9.9");
  assert.equal(clientIpFromHeaders(null, null, true), "unknown");
});
