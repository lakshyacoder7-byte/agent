import assert from "node:assert/strict";
import test from "node:test";
import {
  filterAndSortResults,
  groupSearchResults,
  resolveSearchRequest,
  SEARCH_CATEGORIES,
  supportsResultField,
} from "./searchPresentation.js";

test("only All and Web advertise a connected category", () => {
  assert.deepEqual(SEARCH_CATEGORIES.filter((category) => category.connected).map(({ id }) => id), ["all", "web"]);
});

test("query submission dispatches only for connected categories", () => {
  assert.deepEqual(resolveSearchRequest("web", "  climate   research "), {
    status: "ready",
    category: SEARCH_CATEGORIES[1],
    query: "climate research",
  });
  assert.equal(resolveSearchRequest("images", "wildlife").status, "provider_unavailable");
  assert.equal(resolveSearchRequest("all", "  ").status, "invalid");
});

test("does not claim to filter fields missing from the results", () => {
  const results = [{ sourceType: "web", title: "A" }, { sourceType: "web", title: "B" }];
  assert.equal(supportsResultField(results, "language"), false);
  assert.deepEqual(filterAndSortResults(results, {
    contentType: "web",
    language: "en",
    dateRange: "year",
    sort: "newest",
  }), results);
});

test("filters and sorts only when result metadata supports it", () => {
  const results = [
    { sourceType: "web", language: "en", publishedAt: "2025-01-01T00:00:00Z" },
    { sourceType: "news", language: "fr", publishedAt: "2026-01-01T00:00:00Z" },
  ];
  assert.deepEqual(filterAndSortResults(results, {
    contentType: "news",
    language: "fr",
    dateRange: "any",
    sort: "newest",
  }), [results[1]]);
});

test("groups only actual provider results and preserves unknown source types", () => {
  const web = { id: "web-1", sourceType: "web", title: "A real web result" };
  const paper = { id: "paper-1", sourceType: "research_paper", title: "A real paper result" };
  const other = { id: "other-1", sourceType: "archive", title: "A real archive result" };
  assert.deepEqual(groupSearchResults([web, paper, other]), [
    { id: "web", label: "Web articles", types: ["web", "article"], results: [web] },
    { id: "research-papers", label: "Research papers", types: ["paper", "research-paper", "scientific-paper"], results: [paper] },
    { id: "other", label: "Other sources", results: [other] },
  ]);
  assert.deepEqual(groupSearchResults([]), []);
});