"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext.jsx";
import { getAuthErrorMessage } from "../features/auth/authErrors.js";
import { isProfileComplete } from "../features/profile/profileCompletion.js";
import { getProfile } from "../features/profile/profileService.js";
import { getRecentSearches } from "../features/search/searchHistory.js";
import { getSavedSources } from "../features/library/libraryService.js";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedSources, setSavedSources] = useState([]);

  useEffect(() => {
    if (authLoading || !user) return undefined;
    let active = true;
    getProfile(user.id)
      .then((data) => {
        if (!active) return;
        if (!isProfileComplete(data)) {
          router.replace("/onboarding");
          return;
        }
        setProfile(data);
        setLoading(false);
      })
      .catch((profileError) => {
        if (!active) return;
        setError(getAuthErrorMessage(profileError));
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, router, user?.id]);

  useEffect(() => {
    if (authLoading || !user) return undefined;
    let active = true;
    Promise.all([
      getRecentSearches(user.id, 4).catch(() => []),
      getSavedSources(user.id).catch(() => []),
    ]).then(([searches, sources]) => {
      if (!active) return;
      setRecentSearches(searches);
      setSavedSources(sources.slice(0, 4));
    });
    return () => {
      active = false;
    };
  }, [authLoading, user?.id]);

  if (authLoading || !user || loading) {
    return <p className="route-status">Loading your AVEN profile…</p>;
  }

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const categories = [
    ["Web", "search"], ["Images", "images"], ["Videos", "videos"], ["Books", "books"],
    ["News", "news"], ["Research", "research"], ["More", "tools"],
  ];
  const quickTools = [
    ["AI Chat", "ai", "Ask and explore ideas"], ["Translate", "translate", "Language tools"],
    ["Summarize", "summarize", "Distill useful material"], ["PDF Reader", "documents", "Read and annotate"],
    ["Calculator", "calculator", "Useful calculations"], ["More Tools", "tools", "Explore AVEN tools"],
  ];

  return (
    <main className="workspace-page home-page">
      {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
      <section className="aven-hero">
        <div className="aven-hero-orbit" aria-hidden="true"><span /><span /><span /></div>
        <p className="eyebrow">YOUR UNIVERSAL KNOWLEDGE BROWSER</p>
        <h1>Welcome to <span>AVEN</span></h1>
        <p>Discover knowledge, ideas and sources across the universe of information.</p>
        <Link href="/search" className="aven-hero-search">
          <span className="aven-hero-search-icon" aria-hidden="true">⌕</span>
          <span><strong>What would you like to know?</strong><small>Search across the knowledge you can access</small></span>
          <span className="aven-hero-search-action" aria-hidden="true">→</span>
        </Link>
        <nav className="aven-category-row" aria-label="Knowledge categories">
          {categories.map(([label, href]) => <Link key={label} href={href === "search" ? "/search" : `/${href}`}>{label}</Link>)}
        </nav>
      </section>

      <section className="home-quick-grid" aria-label="AVEN quick destinations">
        <Link href="/ai"><span className="home-quick-icon home-quick-icon--violet">✦</span><strong>AI Knowledge</strong><small>Ask a question</small></Link>
        <Link href="/search"><span className="home-quick-icon">⌕</span><strong>Smart Search</strong><small>Find deeper answers</small></Link>
        <Link href="/library"><span className="home-quick-icon home-quick-icon--cyan">▤</span><strong>My Library</strong><small>Saved resources</small></Link>
        <Link href="/search"><span className="home-quick-icon home-quick-icon--blue">◎</span><strong>Explore Web</strong><small>Discover sources</small></Link>
      </section>

      <section className="workspace-section">
        <div className="section-heading"><div><p className="eyebrow">DISCOVER</p><h2>Popular knowledge</h2><p>Starting points for your next exploration.</p></div><Link href="/search" className="text-link">View all →</Link></div>
        <div className="aven-topic-grid">
          {["Artificial intelligence","Space exploration","Quantum physics","Healthy living","Modern technology"].map((topic, index) => (
            <Link href={`/search?q=${encodeURIComponent(topic)}`} className={`aven-topic-card aven-topic-card--${index + 1}`} key={topic}>
              <span className="aven-topic-art" aria-hidden="true"><span /></span>
              <strong>{topic}</strong>
              <small>{index % 2 ? "Explore ideas and sources" : "Discover connected knowledge"}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="workspace-section">
        <div className="section-heading"><div><p className="eyebrow">QUICK TOOLS</p><h2>Useful tools</h2></div><Link href="/tools" className="text-link">View tools →</Link></div>
        <div className="aven-tools-grid">
          {quickTools.map(([title, href, description]) => <Link href={href === "ai" ? "/ai" : href === "tools" ? "/tools" : "/tools"} className="aven-tool-card" key={title}><span>{title === "Translate" ? "文" : title === "Summarize" ? "T" : title === "PDF Reader" ? "PDF" : title === "Calculator" ? "=" : title === "AI Chat" ? "✦" : "⋯"}</span><strong>{title}</strong><small>{description}</small></Link>)}
        </div>
      </section>

      <section className="home-personal-grid">
        <div className="home-personal-panel">
          <div className="section-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Continue exploring</h2></div><Link href="/history" className="text-link">History →</Link></div>
          {recentSearches.length ? (
            <div className="aven-recent-list">
              {recentSearches.map((entry) => (
                <Link href={`/search?q=${encodeURIComponent(entry.query)}`} key={entry.id}>
                  <span>↺</span><div><strong>{entry.query}</strong><small>{new Date(entry.created_at).toLocaleDateString()}</small></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="aven-empty-inline"><span>◷</span><div><strong>No recent searches yet</strong><small>Your searches will appear here.</small></div></div>
          )}
        </div>
        <div className="home-personal-panel">
          <div className="section-heading"><div><p className="eyebrow">YOUR LIBRARY</p><h2>Saved resources</h2></div><Link href="/library" className="text-link">Open →</Link></div>
          {savedSources.length ? (
            <div className="aven-saved-preview">
              {savedSources.map((source) => (
                <a href={source.source_url} target="_blank" rel="noreferrer" key={source.id} title={source.title}>
                  {source.image_url ? <img src={source.image_url} alt="" loading="lazy" /> : <span>▤</span>}
                  <strong>{source.title}</strong>
                </a>
              ))}
            </div>
          ) : (
            <div className="aven-empty-inline"><span>▤</span><div><strong>Your library is ready</strong><small>Saved sources will appear here.</small></div></div>
          )}
        </div>
      </section>
    </main>
  );
}