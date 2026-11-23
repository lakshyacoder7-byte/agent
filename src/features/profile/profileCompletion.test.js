import assert from "node:assert/strict";
import test from "node:test";
import { getProfileInterests, isProfileComplete } from "./profileCompletion.js";

test("an automatically created placeholder profile remains incomplete until occupation is completed", () => {
  assert.equal(isProfileComplete({ full_name: "A User", role: "other", occupation: null, interests: [] }), false);
});

test("recognizes the new profile fields and preferences interests", () => {
  const profile = {
    full_name: "A User",
    occupation: "researcher",
    preferences: { interests: ["Science"] },
  };
  assert.equal(isProfileComplete(profile), true);
  assert.deepEqual(getProfileInterests(profile), ["Science"]);
});

test("continues to recognize complete legacy profiles", () => {
  assert.equal(isProfileComplete({
    full_name: "A User",
    role: "student",
    interests: [],
  }), true);
});