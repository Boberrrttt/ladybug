import assert from "node:assert/strict";
import { test } from "node:test";
import { clientIpFromHeaders } from "./request.helpers.ts";

test("clientIpFromHeaders prefers platform IP then the first forwarded hop", () => {
  assert.equal(clientIpFromHeaders("1.2.3.4, 5.6.7.8", "9.9.9.9"), "9.9.9.9");
  assert.equal(clientIpFromHeaders("1.2.3.4, 5.6.7.8", null), "1.2.3.4");
  assert.equal(clientIpFromHeaders(null, "9.9.9.9"), "9.9.9.9");
  assert.equal(clientIpFromHeaders(null, null), "unknown");
});
