import assert from "node:assert/strict";
import test from "node:test";
import { validateSearchQuery } from "./searchValidation.js";

test("trims and collapses whitespace in a valid query", () => {
  assert.deepEqual(validateSearchQuery("  how   do stars\nform?  "), {
    valid: true,
    query: "how do stars form?",
  });
});

test("rejects blank and non-string queries", () => {
  assert.equal(validateSearchQuery(" \n ").valid, false);
  assert.equal(validateSearchQuery(null).valid, false);
});

test("enforces the query length limit", () => {
  assert.equal(validateSearchQuery("x".repeat(300)).valid, true);
  assert.equal(validateSearchQuery("x".repeat(301)).valid, false);
});

test("rejects unsupported control characters", () => {
  assert.equal(validateSearchQuery("valid\u0000query").valid, false);
});