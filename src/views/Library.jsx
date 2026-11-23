"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchResultCard from "../components/search/SearchResultCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getSavedSources, removeSavedSource } from "../features/library/libraryService.js";

export default function Library() {
  const { user, loading: authLoading } = useAuth();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");

  useEffect(() => {
    if (authLoading) return undefined;
    if (!user) {
      setSources([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    getSavedSources(user.id)
      .then((items) => { if (active) setSources(items); })
      .catch(() => { if (active) setError("Your library could not be loaded. Please try again."); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [authLoading, user?.id]);

  async function handleRemove(sourceId) {
    if (!user) return;
    setRemovingId(sourceId);
    setError("");
    try {
      await removeSavedSource(user.id, sourceId);
      setSources((items) => items.filter((item) => item.id !== sourceId));
    } catch {
      setError("This source could not be removed. Please try again.");
    } finally {
      setRemovingId("");
    }
  }

  return (
    <main className="workspace-page">
      <header className="page-heading">
        <div><p className="eyebrow">YOUR SPACE</p><h1>My library</h1><p className="page-lede">A home for the resources and ideas you want to keep.</p></div>
        <Link className="button button--secondary" href="/search">Explore sources</Link>
      </header>
      {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
      {loading ? (
        <p className="route-status" role="status">Loading your library…</p>
      ) : sources.length ? (
        <section className="library-list" aria-label="Saved sources">
          {sources.map((source) => {
            const result = {
              id: source.id,
              title: source.title,
              description: source.description,
              url: source.source_url,
              sourceType: source.source_type,
              imageUrl: source.image_url,
              provider: source.metadata?.provider,
              publishedAt: source.metadata?.publishedAt,
            };
            return (
              <SearchResultCard
                key={source.id}
                result={result}
                working={removingId === source.id}
                actionLabel="Remove from Library"
                actionDoneLabel=""
                workingLabel="Removing…"
                onAction={() => handleRemove(source.id)}
              />
            );
          })}
        </section>
      ) : (
        <section className="empty-panel">
          <span className="empty-icon" aria-hidden="true">▤</span>
          <h2>Your library is ready</h2>
          <p>Sources you save from search will appear here.</p>
          <Link className="text-link" href="/search">Discover something to read <span aria-hidden="true">→</span></Link>
        </section>
      )}
    </main>
  );
}