"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext.jsx";
import { getSavedSources, removeSavedSource } from "../features/library/libraryService.js";

const tabs = ["All", "Books", "Articles", "Images", "Videos", "PDFs", "More"];

function sourceCategory(source) {
  const type = String(source.source_type || "").toLowerCase();
  if (type.includes("pdf") || type.includes("document")) return "PDFs";
  if (type.includes("image") || source.image_url) return "Images";
  if (type.includes("video")) return "Videos";
  if (type.includes("book")) return "Books";
  if (type.includes("article") || type.includes("web") || type.includes("news")) return "Articles";
  return "More";
}

export default function LibraryPremium({ initialCategory = "All", bookmarkOnly = false }) {
  const { user, loading: authLoading } = useAuth();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [layout, setLayout] = useState("grid");
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);

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

  const visibleSources = useMemo(() => {
    let items = sources.filter((source) => activeCategory === "All" || sourceCategory(source) === activeCategory);
    if (query.trim()) {
      const needle = query.toLowerCase();
      items = items.filter((source) => `${source.title} ${source.description || ""} ${source.source_type}`.toLowerCase().includes(needle));
    }
    return [...items].sort((a, b) => sort === "oldest" ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at));
  }, [sources, activeCategory, query, sort]);

  const imageSources = useMemo(() => visibleSources.filter((source) => source.image_url), [visibleSources]);
  const viewerSource = viewerIndex >= 0 ? imageSources[viewerIndex] : null;

  useEffect(() => {
    if (viewerIndex < 0) return undefined;
    function handleKey(event) {
      if (event.key === "Escape") setViewerIndex(-1);
      if (event.key === "ArrowLeft") setViewerIndex((index) => imageSources.length ? (index <= 0 ? imageSources.length - 1 : index - 1) : -1);
      if (event.key === "ArrowRight") setViewerIndex((index) => imageSources.length ? (index >= imageSources.length - 1 ? 0 : index + 1) : -1);
    }
    window.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [viewerIndex, imageSources.length]);

  async function handleRemove(sourceId) {
    if (!user) return;
    setRemovingId(sourceId);
    setError("");
    try {
      await removeSavedSource(user.id, sourceId);
      setSources((items) => items.filter((item) => item.id !== sourceId));
      if (viewerSource?.id === sourceId) setViewerIndex(-1);
    } catch {
      setError("This source could not be removed. Please try again.");
    } finally {
      setRemovingId("");
    }
  }

  function openViewer(source) {
    const index = imageSources.findIndex((item) => item.id === source.id);
    if (index >= 0) {
      setZoom(1);
      setViewerIndex(index);
    }
  }

  async function shareSource(source) {
    try {
      if (navigator.share) await navigator.share({ title: source.title, text: source.description || source.title, url: source.source_url });
      else await navigator.clipboard.writeText(source.source_url);
    } catch {
      // Cancellation or unavailable sharing needs no fake success state.
    }
  }

  function downloadSource(source) {
    const anchor = document.createElement("a");
    anchor.href = source.image_url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.click();
  }

  return (
    <main className="workspace-page library-page">
      <header className="aven-library-heading">
        <div><p className="eyebrow">YOUR KNOWLEDGE COLLECTION</p><h1>{bookmarkOnly ? "Bookmarks" : "My Library"}</h1><p className="page-lede">Saved books, articles, images and discoveries in one place.</p></div>
        <Link className="button button--secondary" href="/search">Explore sources</Link>
      </header>
      <div className="aven-library-tabs" role="tablist" aria-label="Library categories">
        {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeCategory === tab} className={activeCategory === tab ? "is-active" : ""} onClick={() => setActiveCategory(tab)}>{tab}</button>)}
      </div>
      <div className="aven-gallery-toolbar">
        <label><span className="sr-only">Search library</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search my library" /></label>
        <div className="aven-library-controls">
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort library"><option value="newest">Newest</option><option value="oldest">Oldest</option></select>
          <div className="aven-layout-toggle" aria-label="View layout">
            <button type="button" aria-label="Grid view" aria-pressed={layout === "grid"} className={layout === "grid" ? "is-active" : ""} onClick={() => setLayout("grid")}>▦</button>
            <button type="button" aria-label="List view" aria-pressed={layout === "list"} className={layout === "list" ? "is-active" : ""} onClick={() => setLayout("list")}>☰</button>
          </div>
        </div>
      </div>

      {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
      {loading ? (
        <p className="route-status" role="status">Loading your library…</p>
      ) : visibleSources.length ? (
        <section className={`aven-library-grid ${layout === "list" ? "is-list" : ""}`} aria-label="Saved library resources">
          {visibleSources.map((source) => {
            const type = sourceCategory(source);
            return (
              <article className="aven-library-card" key={source.id}>
                <button type="button" className="aven-library-card-main" onClick={() => source.image_url ? openViewer(source) : window.open(source.source_url, "_blank", "noopener,noreferrer") }>
                  {source.image_url ? <div className="aven-library-image"><img src={source.image_url} alt="" loading="lazy" /><span>{type}</span></div> : <div className="aven-library-resource"><span>{source.source_type || type}</span></div>}
                  <div className="aven-library-card-copy"><strong>{source.title}</strong>{source.description && <p>{source.description}</p>}<small>{source.metadata?.provider?.name || source.source_type || "Saved source"}</small></div>
                </button>
                <div className="aven-library-card-actions"><button type="button" onClick={() => shareSource(source)} aria-label={`Share ${source.title}`}>↗</button><button type="button" onClick={() => handleRemove(source.id)} disabled={removingId === source.id} aria-label={`Remove ${source.title}`}>{removingId === source.id ? "…" : "×"}</button></div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="empty-panel">
          <span className="empty-icon" aria-hidden="true">▤</span>
          <h2>{query ? "No matching resources" : "Your library is ready"}</h2>
          <p>{query ? "Try another library search or clear the search field." : "Sources you save from search will appear here."}</p>
          <Link className="text-link" href="/search">Discover something to read →</Link>
        </section>
      )}

      {viewerSource && (
        <div className="aven-viewer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewerIndex(-1); }}>
          <div className="aven-viewer" role="dialog" aria-modal="true" aria-label="Maximized library image">
            <button className="aven-viewer-close" type="button" aria-label="Close image viewer" onClick={() => setViewerIndex(-1)}>×</button>
            <button className="aven-viewer-nav aven-viewer-prev" type="button" aria-label="Previous image" onClick={() => setViewerIndex((index) => index <= 0 ? imageSources.length - 1 : index - 1)}>‹</button>
            <div className="aven-viewer-stage"><img src={viewerSource.image_url} alt={viewerSource.title || "Library image"} style={{ "--viewer-scale": zoom }} /></div>
            <button className="aven-viewer-nav aven-viewer-next" type="button" aria-label="Next image" onClick={() => setViewerIndex((index) => index >= imageSources.length - 1 ? 0 : index + 1)}>›</button>
            <aside className="aven-viewer-aside">
              <p className="eyebrow">LIBRARY IMAGE</p><h2>{viewerSource.title}</h2>{viewerSource.description && <p>{viewerSource.description}</p>}
              <div className="aven-viewer-controls"><button type="button" onClick={() => setZoom((value) => Math.max(.5, value - .25))} aria-label="Zoom out">−</button><button type="button" onClick={() => setZoom(1)} aria-label="Fit screen">Fit</button><button type="button" onClick={() => setZoom((value) => Math.min(3, value + .25))} aria-label="Zoom in">+</button></div>
              <div className="aven-viewer-actions"><button type="button" onClick={() => downloadSource(viewerSource)}>Download</button><button type="button" onClick={() => shareSource(viewerSource)}>Share</button><button type="button" disabled>Saved</button></div>
              {imageSources.length > 1 && <div className="aven-viewer-related"><p>Related images</p>{imageSources.filter((item) => item.id !== viewerSource.id).slice(0, 3).map((item) => <button type="button" key={item.id} onClick={() => setViewerIndex(imageSources.findIndex((candidate) => candidate.id === item.id))}><img src={item.image_url} alt="" /></button>)}</div>}
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}
