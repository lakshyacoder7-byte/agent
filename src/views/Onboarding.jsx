"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getAuthErrorMessage } from "../features/auth/authErrors.js";
import { validateFullName, validateInterests } from "../features/auth/authValidation.js";
import { getProfileInterests, isProfileComplete } from "../features/profile/profileCompletion.js";
import { getProfile, saveProfile } from "../features/profile/profileService.js";

const roles = ["student", "developer", "researcher", "professional", "educator", "other"];
const interestOptions = [
  "Science",
  "Technology",
  "History",
  "Health",
  "Business",
  "Arts",
  "Environment",
  "Education",
  "News",
  "Books",
];

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [interests, setInterests] = useState([]);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return undefined;
    setFullName((current) => current || user.user_metadata?.full_name || "");
    let active = true;
    getProfile(user.id)
      .then((profile) => {
        if (!active) return;
        if (isProfileComplete(profile)) {
          router.replace("/home");
          return;
        }
        if (profile) {
          setFullName(profile.full_name || user.user_metadata?.full_name || "");
          setRole(profile.occupation !== undefined ? profile.occupation || "" : profile.role || "");
          setInterests(getProfileInterests(profile).filter((interest) => interestOptions.includes(interest)).slice(0, 8));
        }
        setCheckingProfile(false);
      })
      .catch((profileError) => {
        if (!active) return;
        setError(getAuthErrorMessage(profileError));
        setCheckingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, router, user?.id, user?.user_metadata?.full_name]);

  function toggleInterest(value) {
    setInterests((selected) =>
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : selected.length < 8
          ? [...selected, value]
          : selected,
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!validateFullName(fullName)) {
      setError("Your name must be between 2 and 100 characters.");
      return;
    }
    if (!roles.includes(role)) {
      setError("Choose the option that best describes what you do.");
      return;
    }
    if (!validateInterests(interests)) {
      setError("Choose up to 8 interests.");
      return;
    }

    setBusy(true);
    try {
      if (!user) throw new Error("Your session has expired. Please sign in again.");
      await saveProfile({ userId: user.id, fullName, role, interests });
      router.replace("/home");
    } catch (saveError) {
      setError(getAuthErrorMessage(saveError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Make AVEN yours"
      description="Tell us what you do and what you want to explore."
      error={error}
    >
      {authLoading || !user || checkingProfile ? (
        <p className="route-status">Preparing your profile…</p>
      ) : (
        <form className="auth-form onboarding-form" onSubmit={handleSubmit}>
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
            What do you do?
            <select required value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="">Choose one</option>
              {roles.map((value) => (
                <option key={value} value={value}>
                  {value === "educator" ? "Teacher / educator" : value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Interests (optional, up to 8)</legend>
            <div className="interest-options">
              {interestOptions.map((interest) => (
                <label key={interest} className="interest-option">
                  <input
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={() => toggleInterest(interest)}
                  />
                  {interest}
                </label>
              ))}
            </div>
            {interests.length > 0 && (
              <button className="onboarding-skip-interests" type="button" onClick={() => setInterests([])}>
                Skip interests
              </button>
            )}
          </fieldset>
          <button type="submit" disabled={busy}>
            {busy ? "Saving profile…" : "Continue to AVEN"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}