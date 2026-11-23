"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import OAuthProviders from "../components/auth/OAuthProviders.jsx";
import { getProfile } from "../features/profile/profileService.js";
import { isProfileComplete } from "../features/profile/profileCompletion.js";
import { getAuthErrorMessage } from "../features/auth/authErrors.js";
import { signIn } from "../features/auth/authService.js";
import { validateEmail } from "../features/auth/authValidation.js";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setBusy(true);
    try {
      const { user, session } = await signIn({ email: email.trim(), password });
      if (!user || !session) {
        throw new Error("Supabase did not confirm an authenticated session. Please try again.");
      }

      const profile = await getProfile(user.id);
      router.replace(isProfileComplete(profile) ? "/home" : "/onboarding");
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      description="Continue your AVEN knowledge journey."
      error={error}
      footer={<>New to AVEN? <Link href="/signup">Create an account</Link></>}
    >
      <OAuthProviders flow="login" nextPath="/home" />
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <div className="auth-inline-link"><Link href="/forgot-password">Forgot password?</Link></div>
        <button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>}
    </AuthLayout>
  );
}