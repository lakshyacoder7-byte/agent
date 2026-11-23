import "server-only";

const PROVIDER_ID = "brave-web";
const PROVIDER_NAME = "Brave Search";
const SEARCH_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function normalizeResults(payload, limit) {
  const results = Array.isArray(payload?.web?.results) ? payload.web.results : [];

  return results.slice(0, limit).flatMap((result) => {
    const url = safeUrl(result?.url);
    const title = typeof result?.title === "string" ? result.title.trim() : "";
    if (!url || !title) return [];

    return [{
      id: `${PROVIDER_ID}:${url}`,
      sourceType: "web",
      title,
      description: typeof result.description === "string" ? result.description.trim() : "",
      url,
      provider: { id: PROVIDER_ID, name: PROVIDER_NAME },
    }];
  });
}

export const braveWebSearchProvider = {
  id: PROVIDER_ID,
  name: PROVIDER_NAME,
  sourceType: "web",
  isConfigured() {
    return Boolean(process.env.BRAVE_SEARCH_API_KEY?.trim());
  },
  async search(query, { limit = 10, signal } = {}) {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY?.trim();
    if (!apiKey) throw new Error("Search provider is not configured.");

    const url = new URL(SEARCH_ENDPOINT);
    url.searchParams.set("q", query);
    url.searchParams.set("count", String(limit));

    const timeoutSignal = AbortSignal.timeout(10_000);
    const requestSignal = signal
      ? AbortSignal.any([signal, timeoutSignal])
      : timeoutSignal;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": apiKey,
      },
      cache: "no-store",
      signal: requestSignal,
    });

    if (!response.ok) throw new Error("Search provider request failed.");
    return normalizeResults(await response.json(), limit);
  },
};