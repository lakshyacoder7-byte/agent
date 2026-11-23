"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { getAuthErrorMessage } from "../features/auth/authErrors.js";
import { sendPasswordReset } from "../features/auth/authService.js";
import { validateEmail } from "../features/auth/authValidation.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("auth_error");
    if (!status) return;
    setError(status === "cancelled"
      ? "Password recovery was cancelled. You can request a new recovery email."
      : "We could not verify that recovery link. Please request a new one.");
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    try {
      const { error: resetError } = await sendPasswordReset(email.trim());
      if (resetError) throw resetError;
      setSuccess("If an account exists for that email, a password recovery link is on its way.");
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="We’ll send you a secure password recovery link."
      error={error}
      success={success}
      footer={<Link href="/login">Back to sign in</Link>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
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
        <button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send recovery link"}
        </button>
      </form>
    </AuthLayout>
  );
}
