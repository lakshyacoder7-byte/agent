"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext.jsx";
import ThemeToggle from "../common/ThemeToggle.jsx";
import FloatingLogoPreview from "../common/FloatingLogoPreview.jsx";

export default function AuthLayout({ title, description, children, error, success, footer }) {
  const { configurationError, error: sessionError } = useAuth();

  return (
    <main className="auth-page">
      <section className="auth-card auth-card--split" aria-labelledby="auth-title">
        <aside className="auth-reference-panel">
          <div className="auth-reference-orbit" aria-hidden="true" />
          <FloatingLogoPreview />
          <h2>Your Knowledge Journey</h2>
          <p>Starts Here</p>
        </aside>
        <div className="auth-reference-form">
          <div className="auth-card-top">
            <Link className="auth-brand" href="/" aria-label="AVEN intro">AVEN</Link>
            <ThemeToggle />
          </div>
          <h1 id="auth-title">{title}</h1>
        <p className="auth-description">{description}</p>
        {configurationError && <p className="auth-message auth-message--error">{configurationError}</p>}
        {sessionError && <p className="auth-message auth-message--error" role="alert">{sessionError}</p>}
        {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
        {success && <p className="auth-message auth-message--success" role="status">{success}</p>}
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </section>
    </main>
  );
}
