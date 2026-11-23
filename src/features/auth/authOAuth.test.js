import assert from "node:assert/strict";
import test from "node:test";
import {
	classifyOAuthCallbackError,
	getOAuthErrorReturnPath,
	getOAuthProvider,
	getOAuthStatusMessage,
	getPostAuthDestination,
	getSafeAuthDestination,
	getSafeAuthFlow,
} from "./authOAuth.js";

test("maps Microsoft to Supabase's Azure provider", () => {
	assert.equal(getOAuthProvider("microsoft").supabaseProvider, "azure");
	assert.equal(getOAuthProvider("google").supabaseProvider, "google");
	assert.equal(getOAuthProvider("google").scopes, "openid email profile");
	assert.equal(getOAuthProvider("apple").scopes, "name email");
	assert.equal(getOAuthProvider("github").scopes, "read:user user:email");
	assert.equal(getOAuthProvider("microsoft").scopes, "email");
	assert.equal(getOAuthProvider("unknown"), null);
});

test("restricts callback destinations and flow names to allowlists", () => {
	assert.equal(getSafeAuthDestination("/onboarding"), "/onboarding");
	assert.equal(getSafeAuthDestination("//attacker.example"), "/home");
	assert.equal(getSafeAuthDestination("https://attacker.example"), "/home");
	assert.equal(getSafeAuthDestination("/reset-password"), "/home");
	assert.equal(getSafeAuthFlow("recovery"), "recovery");
	assert.equal(getSafeAuthFlow("external"), "login");
});

test("classifies cancellation and provider setup errors without echoing provider text", () => {
	assert.equal(classifyOAuthCallbackError("access_denied"), "cancelled");
	assert.equal(classifyOAuthCallbackError("server_error", "Unsupported provider"), "provider_setup");
	assert.match(getOAuthStatusMessage("provider_setup", "microsoft"), /Supabase Auth settings/u);
	assert.match(getOAuthStatusMessage("oauth_failed", null), /confirmation email/u);
	assert.equal(classifyOAuthCallbackError("server_error", "private error text"), "oauth_failed");
});

test("routes recovery and incomplete profiles to fixed destinations", () => {
	assert.equal(getOAuthErrorReturnPath("recovery"), "/forgot-password");
	assert.equal(getPostAuthDestination({ flow: "recovery", profileComplete: true }), "/reset-password");
	assert.equal(getPostAuthDestination({ flow: "login", nextPath: "/home", profileComplete: false }), "/onboarding");
	assert.equal(getPostAuthDestination({ flow: "login", nextPath: "//attacker", profileComplete: true }), "/home");
});