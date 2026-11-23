import assert from "node:assert/strict";
import test from "node:test";
import { passwordsMatch, validateEmail, validateFullName, validateInterests, validatePassword } from "./authValidation.js";

test("validates email, full name, and minimum password length", () => {
  assert.equal(validateEmail("person@example.com"), true);
  assert.equal(validateEmail("not-an-email"), false);
  assert.equal(validateFullName("A Person"), true);
  assert.equal(validateFullName(" "), false);
  assert.equal(validatePassword("12345678"), true);
  assert.equal(validatePassword("short"), false);
});

test("checks password confirmation and allows zero to eight interests", () => {
  assert.equal(passwordsMatch("secret123", "secret123"), true);
  assert.equal(passwordsMatch("secret123", "different"), false);
  assert.equal(validateInterests([]), true);
  assert.equal(validateInterests(["science"]), true);
  assert.equal(validateInterests(Array(9).fill("topic")), false);
});