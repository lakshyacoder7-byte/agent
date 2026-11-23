"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import OAuthProviders from "../components/auth/OAuthProviders.jsx";
import { getAuthErrorMessage } from "../features/auth/authErrors.js";
import { getAuthenticatedUser, signUp } from "../features/auth/authService.js";
import {
  validateEmail,
  validateFullName,
  validatePassword,
  passwordsMatch,
} from "../features/auth/authValidation.js";

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateFullName(fullName)) {
      setError("Your name must be between 2 and 100 characters.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (!passwordsMatch(password, confirmPassword)) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const { data, error: signUpError } = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });
      if (signUpError) throw signUpError;

      if (data.session && data.user) {
        await getAuthenticatedUser(data.user.id);
        router.replace("/onboarding");
      } else {
        setSuccess(
          "If this address can be registered, check your email to confirm it. If you already have an account, sign in or reset your password.",
        );
      }
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Start discovering knowledge with AVEN."
      error={error}
      success={success}
      footer={<>Already have an account? <Link href="/login">Sign in</Link></>}
    >
      <OAuthProviders flow="signup" nextPath="/onboarding" />
      <div className="auth-method-divider"><span>or</span></div>
      <button
        className="auth-email-toggle"
        type="button"
        aria-expanded={emailExpanded}
        onClick={() => setEmailExpanded((expanded) => !expanded)}
      >
        {emailExpanded ? "Hide email form" : "Continue with Email"}
      </button>
      {emailExpanded && <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>}
    </AuthLayout>
  );
}