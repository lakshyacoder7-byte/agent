"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getAuthErrorMessage } from "../features/auth/authErrors.js";
import { updatePassword } from "../features/auth/authService.js";
import { getProfile } from "../features/profile/profileService.js";
import { isProfileComplete } from "../features/profile/profileCompletion.js";
import { passwordsMatch, validatePassword } from "../features/auth/authValidation.js";

export default function ResetPassword() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
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
      const { error: updateError } = await updatePassword(password);
      if (updateError) throw updateError;
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
      title="Choose a new password"
      description="Set a new password for your AVEN account."
      error={error}
      footer={!user && !loading ? <Link href="/forgot-password">Request another recovery link</Link> : null}
    >
      {loading ? (
        <p className="route-status">Checking recovery link…</p>
      ) : user ? (
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            New password
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
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
          <button type="submit" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      ) : (
        <p className="auth-message">Open this page using the password recovery link sent to your email.</p>
      )}
    </AuthLayout>
  );
}
