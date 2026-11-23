import { validateSearchQuery } from "./searchValidation.js";

export const SEARCH_CATEGORIES = [
  { id: "all", label: "All", connected: true },
  { id: "web", label: "Web", connected: true },
  { id: "images", label: "Images", connected: false },
  { id: "videos", label: "Videos", connected: false },
  { id: "books", label: "Books", connected: false },
  { id: "news", label: "News", connected: false },
  { id: "research-papers", label: "Research Papers", connected: false },
  { id: "documents", label: "Documents", connected: false },
  { id: "social", label: "Social", connected: false },
];

const KNOWLEDGE_SECTIONS = [
  { id: "web", label: "Web articles", types: ["web", "article"] },
  { id: "images", label: "Images", types: ["image", "images"] },
  { id: "videos", label: "Videos", types: ["video", "videos"] },
  { id: "books", label: "Books", types: ["book", "books"] },
  { id: "news", label: "News", types: ["news"] },
  { id: "research-papers", label: "Research papers", types: ["paper", "research-paper", "scientific-paper"] },
  { id: "documents", label: "Documents", types: ["document", "documents"] },
  { id: "social", label: "Social sources", types: ["social", "social-media"] },
];

export function resolveSearchRequest(categoryId, value) {
  const validation = validateSearchQuery(value);
  if (!validation.valid) return { status: "invalid", error: validation.error };

  const category = SEARCH_CATEGORIES.find((item) => item.id === categoryId);
  if (!category?.connected) {
    return { status: "provider_unavailable", category: category ?? SEARCH_CATEGORIES[0] };
  }

  return { status: "ready", category, query: validation.query };
}

export function supportsResultField(results, field) {
  return results.length > 0 && results.every((result) => {
    const value = result[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function groupSearchResults(results) {
  const remainingResults = [...results];
  const sections = KNOWLEDGE_SECTIONS.flatMap((section) => {
    const matchingResults = remainingResults.filter((result) => {
      const type = typeof result.sourceType === "string"
        ? result.sourceType.toLowerCase().replace(/[\s_]+/gu, "-")
        : "";
      return section.types.includes(type);
    });
    if (!matchingResults.length) return [];
    for (const result of matchingResults) remainingResults.splice(remainingResults.indexOf(result), 1);
    return [{ ...section, results: matchingResults }];
  });

  if (remainingResults.length) {
    sections.push({ id: "other", label: "Other sources", results: remainingResults });
  }
  return sections;
}

export function filterAndSortResults(results, filters) {
  let visibleResults = [...results];

  if (filters.contentType && supportsResultField(results, "sourceType")) {
    visibleResults = visibleResults.filter((result) => result.sourceType === filters.contentType);
  }

  if (filters.language && supportsResultField(results, "language")) {
    visibleResults = visibleResults.filter((result) => result.language === filters.language);
  }

  const hasDates = supportsResultField(results, "publishedAt")
    && results.every((result) => Number.isFinite(Date.parse(result.publishedAt)));
  if (filters.dateRange !== "any" && hasDates) {
    const now = Date.now();
    const duration = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    }[filters.dateRange];
    if (duration) {
      visibleResults = visibleResults.filter((result) => now - Date.parse(result.publishedAt) <= duration);
    }
  }

  if (filters.sort === "newest" && hasDates) {
    visibleResults.sort((first, second) => Date.parse(second.publishedAt) - Date.parse(first.publishedAt));
  }

  return visibleResults;
}