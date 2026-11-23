"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../components/common/ThemeProvider.jsx";
import { getAuthErrorMessage } from "../features/auth/authErrors.js";
import { passwordsMatch, validatePassword } from "../features/auth/authValidation.js";
import { updatePassword } from "../features/auth/authService.js";
import { getProfile } from "../features/profile/profileService.js";

export default function Settings({ initialTab = "General" }) {
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = ["General", "Appearance", "Notifications", "Account", "Privacy", "Language"];

  const hasEmailIdentity = user?.app_metadata?.providers?.includes("email")
    || user?.identities?.some((identity) => identity.provider === "email");

  useEffect(() => {
    if (authLoading || !user) return undefined;
    let active = true;
    getProfile(user.id)
      .then((data) => { if (active) setProfile(data); })
      .catch(() => { if (active) setError("Profile details are temporarily unavailable."); });
    return () => { active = false; };
  }, [authLoading, user?.id]);

  async function handlePasswordUpdate(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!validatePassword(password)) {
      setPasswordError("Choose a password with at least 8 characters.");
      return;
    }
    if (!passwordsMatch(password, confirmPassword)) {
      setPasswordError("The passwords do not match.");
      return;
    }

    setPasswordBusy(true);
    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) throw updateError;
      setPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Your password has been updated.");
    } catch (updateError) {
      setPasswordError(getAuthErrorMessage(updateError));
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <main className="workspace-page settings-page">
      <header className="aven-library-heading">
        <div><p className="eyebrow">PREFERENCES</p><h1>Settings</h1><p className="page-lede">Customize your AVEN experience.</p></div>
      </header>
      <div className="aven-settings-layout">
        <aside className="aven-settings-tabs" aria-label="Settings sections">
          {tabs.map((tab) => <button type="button" key={tab} className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
        </aside>
        <section className="settings-card">
          {(activeTab === "General" || activeTab === "Appearance") && (
            <>
              <div className="settings-section">
                <div><h2>Appearance</h2><p>Choose Light, Dark or follow your system.</p></div>
                <div className="aven-theme-options" role="radiogroup" aria-label="Appearance">
                  {[['light', 'Light', '☼'], ['dark', 'Dark', '☾'], ['system', 'System', '◐']].map(([value, label, icon]) => (
                    <button key={value} type="button" role="radio" aria-checked={theme === value} className={theme === value ? "is-active" : ""} onClick={() => setTheme(value)}>
                      <span aria-hidden="true">{icon}</span>{label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="settings-section">
                <div><h2>Motion</h2><p>AVEN respects reduced-motion preferences automatically.</p></div>
                <p className="settings-readonly">System preference is applied</p>
              </div>
            </>
          )}
          {activeTab === "Account" && (
            <>
              <div className="settings-section">
                <div><h2>Account</h2><p>Your sign-in details and profile.</p></div>
                <dl className="account-details">
                  <div><dt>Name</dt><dd>{profile?.full_name || "Loading…"}</dd></div>
                  <div><dt>Email</dt><dd>{user?.email || "Loading…"}</dd></div>
                  <div><dt>Role</dt><dd>{profile?.role || "—"}</dd></div>
                </dl>
              </div>
              <div className="settings-section">
                <div><h2>Password</h2><p>{hasEmailIdentity ? "Update the password for your email sign-in." : "Password updates are available for email-based accounts."}</p></div>
                {hasEmailIdentity ? (
                  <form className="auth-form settings-password-form" onSubmit={handlePasswordUpdate}>
                    {passwordError && <p className="auth-message auth-message--error" role="alert">{passwordError}</p>}
                    {passwordSuccess && <p className="auth-message auth-message--success" role="status">{passwordSuccess}</p>}
                    <label>New password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
                    <label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
                    <button type="submit" disabled={passwordBusy}>{passwordBusy ? "Updating…" : "Update password"}</button>
                  </form>
                ) : <p className="auth-provider-note">This account does not have an email/password sign-in method.</p>}
              </div>
              {profile?.interests?.length > 0 && <div className="settings-section"><div><h2>Interests</h2><p>Your selected topics.</p></div><div className="home-interests">{profile.interests.map((interest) => <span key={interest}>{interest}</span>)}</div></div>}
            </>
          )}
          {activeTab === "Notifications" && <div className="settings-section"><div><h2>Notifications</h2><p>External notification services are not connected.</p></div><p className="settings-readonly">No notification provider is active.</p></div>}
          {activeTab === "Privacy" && <div className="settings-section"><div><h2>Privacy</h2><p>Your Library and History use account-only Supabase access.</p></div><p className="settings-readonly">Profiles and private collections are protected by Row Level Security.</p></div>}
          {activeTab === "Language" && <div className="settings-section"><div><h2>Language</h2><p>Interface language support.</p></div><p className="settings-readonly">English is the active interface language.</p></div>}
          {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
        </section>
      </div>
    </main>
  );
}