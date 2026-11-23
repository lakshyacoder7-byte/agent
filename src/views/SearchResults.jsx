"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ResultTabs from "../components/search/ResultTabs.jsx";
import SearchFilters from "../components/search/SearchFilters.jsx";
import SearchHistory from "../components/search/SearchHistory.jsx";
import SearchBar from "../components/search/SearchBar.jsx";
import AIAnswer from "../components/knowledge/AIAnswer.jsx";
import KnowledgeSections from "../components/knowledge/KnowledgeSections.jsx";
import RelatedQuestions from "../components/knowledge/RelatedQuestions.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { saveSource } from "../features/library/libraryService.js";
import { deleteSearchHistory, getRecentSearches, saveSearchHistory } from "../features/search/searchHistory.js";
import { filterAndSortResults, groupSearchResults, resolveSearchRequest, SEARCH_CATEGORIES } from "../features/search/searchPresentation.js";
import { useSearch } from "../hooks/useSearch.js";
import Link from "next/link";

const DEFAULT_FILTERS = { contentType: "", dateRange: "any", language: "", sort: "relevance" };

export default function SearchResults() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [savedUrls, setSavedUrls] = useState(() => new Set());
  const [workingUrls, setWorkingUrls] = useState(() => new Set());
  const [actionErrors, setActionErrors] = useState({});
  const { user, loading: authLoading } = useAuth();
  const { data, error, isLoading, search, clearError, clearResults } = useSearch();
  const selectedCategory = SEARCH_CATEGORIES.find((item) => item.id === category) ?? SEARCH_CATEGORIES[0];
  const providerIssues = data?.providers?.filter((provider) => provider.status === "error" || provider.status === "not_configured") ?? [];

  useEffect(() => {
    if (authLoading) return undefined;
    if (!user) {
      setHistory([]);
      setHistoryLoading(false);
      return undefined;
    }

    let active = true;
    setHistoryLoading(true);
    getRecentSearches(user.id)
      .then((entries) => { if (active) setHistory(entries); })
      .catch(() => { if (active) setHistoryError("Recent searches could not be loaded."); })
      .finally(() => { if (active) setHistoryLoading(false); });

    return () => { active = false; };
  }, [authLoading, user?.id]);

  function rememberSearch(searchQuery) {
    if (!user) return;
    setHistoryError("");
    saveSearchHistory(user.id, searchQuery)
      .then((entry) => setHistory((entries) => [entry, ...entries.filter((item) => item.id !== entry.id)].slice(0, 8)))
      .catch(() => setHistoryError("This search could not be added to your history."));
  }

  function runSearch(searchQuery, categoryId = category) {
    const request = resolveSearchRequest(categoryId, searchQuery);
    if (request.status === "invalid") {
      search(searchQuery);
      return;
    }

    setQuery(request.query ?? searchQuery);
    setSubmittedQuery(request.query ?? searchQuery);
    setFilters(DEFAULT_FILTERS);
    rememberSearch(request.query ?? searchQuery);
    if (request.status === "provider_unavailable") {
      clearResults();
      return;
    }
    search(request.query);
  }

  function handleSubmit(event) {
    event.preventDefault();
    runSearch(query);
  }

  useEffect(() => {
    if (initialQuery.trim()) runSearch(initialQuery, "all");
    // The URL query is the intended single source for initial route hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  function handleCategoryChange(nextCategory) {
    setCategory(nextCategory);
    setFilters(DEFAULT_FILTERS);
    clearError();
  }

  function handleRepeatSearch(value) {
    setCategory("all");
    runSearch(value, "all");
  }

  async function handleHistoryDelete(entryId) {
    if (!user) return;
    try {
      await deleteSearchHistory(user.id, entryId);
      setHistory((entries) => entries.filter((entry) => entry.id !== entryId));
      setHistoryError("");
    } catch {
      setHistoryError("This search could not be removed from your history.");
    }
  }

  async function handleSave(result) {
    if (!user) return;
    setWorkingUrls((urls) => new Set(urls).add(result.url));
    setActionErrors((errors) => ({ ...errors, [result.url]: "" }));
    try {
      await saveSource(user.id, result);
      setSavedUrls((urls) => new Set(urls).add(result.url));
    } catch {
      setActionErrors((errors) => ({ ...errors, [result.url]: "Could not save this source. Please try again." }));
    } finally {
      setWorkingUrls((urls) => {
        const next = new Set(urls);
        next.delete(result.url);
        return next;
      });
    }
  }

  const categoryResults = data?.results?.filter((result) => category !== "web" || result.sourceType === "web") ?? [];
  const visibleResults = filterAndSortResults(categoryResults, filters);
  const knowledgeSections = groupSearchResults(visibleResults);

  return (
    <main className="workspace-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">KNOWLEDGE SEARCH</p>
          <h1>Explore what matters.</h1>
          <p className="page-lede">Search connected sources with clear links and provenance.</p>
        </div>
      </header>
      <ResultTabs value={category} onChange={handleCategoryChange} />
      <SearchBar
        value={query}
        onChange={(value) => {
          setQuery(value);
          setSubmittedQuery("");
          clearError();
          clearResults();
        }}
        onClear={() => {
          setQuery("");
          setSubmittedQuery("");
          clearResults();
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        recentSearches={history}
        onChooseSuggestion={(entry) => handleRepeatSearch(entry.query)}
      />
      {category === "all" && (
        <p className="search-availability-note">All currently connected sources are included. Web is the only connected category.</p>
      )}

      {isLoading && (
        <p className="search-loading" role="status" aria-live="polite">
          <span className="search-spinner" aria-hidden="true" /> Searching the web…
        </p>
      )}

      {error && (
        <section className="notice-card search-error" role="alert">
          <span className="notice-icon" aria-hidden="true">!</span>
          <div><h2>Search unavailable</h2><p>{error}</p></div>
        </section>
      )}

      {submittedQuery && (
        <>
          <AIAnswer query={data?.query ?? submittedQuery} answer={data?.answer} />
          <RelatedQuestions answer={data?.answer} onChooseQuestion={handleRepeatSearch} />
        </>
      )}

      {!selectedCategory.connected && (
        <section className="notice-card provider-unavailable" role="status">
          <span className="notice-icon" aria-hidden="true">i</span>
          <div><h2>{selectedCategory.label} provider not connected yet</h2><p>This category is not connected to a search provider. No search was sent for it.</p></div>
        </section>
      )}

      {!data && !error && !isLoading && selectedCategory.connected && (
        <section className="empty-panel search-welcome">
          <span className="empty-icon" aria-hidden="true">⌕</span>
          <h2>Start with a question</h2>
          <p>Search with a question, a topic, or a few keywords. Your sources will appear here.</p>
        </section>
      )}

      {data && selectedCategory.connected && (
        <section className="search-results" aria-live="polite">
          <header className="search-results-heading">
            <div>
              <p className="eyebrow">SOURCE RESULTS</p>
              <h2>{visibleResults.length} {visibleResults.length === 1 ? "result" : "results"} for <q>{data.query}</q></h2>
            </div>
            <span className="search-provider-label">
              {data.providers.filter((provider) => provider.status === "ok").map((provider) => provider.name).join(", ")}
            </span>
          </header>
          <SearchFilters results={categoryResults} filters={filters} onChange={setFilters} />
          {providerIssues.length > 0 && (
            <p className="search-partial-provider-status" role="status">
              Some sources are unavailable: {providerIssues.map((provider) => provider.name).join(", ")}.
              Other connected sources may still have results below.
            </p>
          )}
          {data.answer.status === "not_configured" && (
            <p className="search-ai-status" role="status">
              Search sources below are provider results. AI summaries and generated claims are not connected.
            </p>
          )}
          {visibleResults.length > 0 ? (
            <KnowledgeSections
              sections={knowledgeSections}
              savedUrls={savedUrls}
              workingUrls={workingUrls}
              actionErrors={actionErrors}
              onSave={handleSave}
            />
          ) : (
            <section className="empty-panel search-no-results">
              <span className="empty-icon" aria-hidden="true">⌕</span>
              <h2>{data.results.length ? "No results match these filters" : "No results found"}</h2>
              <p>{data.results.length ? "Adjust the filters to see more sources." : "The connected search provider returned no sources for this query. Try different wording."}</p>
            </section>
          )}
        </section>
      )}
      <section className="research-workspace-link">
        <div>
          <p className="eyebrow">RESEARCH WORKSPACE</p>
          <h2>Keep useful sources together</h2>
          <p>Save provider results to your Library. Notes and topic collections are not connected yet.</p>
        </div>
        <Link className="button button--secondary" href="/library">Open Library</Link>
      </section>
      <SearchHistory entries={history} isLoading={historyLoading} error={historyError} onRepeat={handleRepeatSearch} onDelete={handleHistoryDelete} />
    </main>
  );
}