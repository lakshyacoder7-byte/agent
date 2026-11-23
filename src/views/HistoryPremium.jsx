"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext.jsx";
import { clearSearchHistory, deleteSearchHistory, getRecentSearches } from "../features/search/searchHistory.js";

export default function HistoryPremium() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return undefined;
    if (!user) {
      setEntries([]);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    getRecentSearches(user.id, 50)
      .then((items) => { if (active) setEntries(items); })
      .catch(() => { if (active) setError("Your search history could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, user?.id]);

  async function removeEntry(entry) {
    if (!user) return;
    setError("");
    try {
      await deleteSearchHistory(user.id, entry.id);
      setEntries((items) => items.filter((item) => item.id !== entry.id));
    } catch {
      setError("This search could not be removed.");
    }
  }

  async function clearHistory() {
    if (!user) return;
    setError("");
    try {
      await clearSearchHistory(user.id);
      setEntries([]);
    } catch {
      setError("Search history could not be cleared.");
    }
  }

  return (
    <main className="workspace-page history-page">
      <header className="aven-library-heading">
        <div><p className="eyebrow">YOUR ACTIVITY</p><h1>History</h1><p className="page-lede">Return to an earlier line of inquiry.</p></div>
        <div className="aven-history-actions"><Link className="button button--secondary" href="/search">Start a search</Link>{entries.length > 0 && <button className="button button--quiet" type="button" onClick={clearHistory}>Clear history</button>}</div>
      </header>
      {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
      {loading ? <p className="route-status" role="status">Loading search history…</p> : entries.length ? (
        <section className="aven-history-list" aria-label="Recent searches">
          {entries.map((entry) => {
            const date = new Date(entry.created_at);
            return (
              <article className="aven-history-item" key={entry.id}>
                <button type="button" className="aven-history-search" onClick={() => router.push(`/search?q=${encodeURIComponent(entry.query)}`)}><span>↺</span><div><strong>{entry.query}</strong><small>{date.toLocaleString()}</small></div></button>
                <button type="button" className="aven-history-delete" aria-label={`Delete search ${entry.query}`} onClick={() => removeEntry(entry)}>×</button>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="empty-panel">
          <span className="empty-icon" aria-hidden="true">◷</span>
          <h2>No activity yet</h2>
          <p>Your recent searches will appear here.</p>
          <Link className="text-link" href="/search">Explore a question →</Link>
        </section>
      )}
    </main>
  );
}
