"use client";

import React from "react";
import Link from "next/link";
import FloatingLogoPreview from "../components/common/FloatingLogoPreview.jsx";
import ThemeToggle from "../components/common/ThemeToggle.jsx";

export default function Welcome() {
  return (
    <main className="welcome-page">
      <header className="welcome-top">
        <FloatingLogoPreview />
        <nav className="welcome-header-actions" aria-label="Account and appearance">
          <Link className="welcome-header-signin" href="/login">Sign in</Link>
          <Link className="button button--primary welcome-header-create" href="/signup">Create account</Link>
          <ThemeToggle />
        </nav>
      </header>
      <section className="welcome-card">
        <p className="eyebrow welcome-eyebrow">A CLEARER WAY TO EXPLORE</p>
        <h1>Knowledge starts<br className="welcome-heading-break" /> with a good question.</h1>
        <p className="welcome-description">
          A thoughtful workspace for discovering ideas, sources, and perspectives across the things you care about.
        </p>
        <nav className="welcome-actions" aria-label="Account">
          <Link className="button button--primary welcome-primary-action" href="/signup">
            Create your free account <span aria-hidden="true">→</span>
          </Link>
        </nav>
        <p className="welcome-note">Already have an account? <Link href="/login">Sign in</Link></p>
      </section>
      <Link className="welcome-back" href="/">Return to animated intro</Link>
    </main>
  );
}