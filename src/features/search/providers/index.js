import "server-only";

import { braveWebSearchProvider } from "./braveWebSearchProvider.js";

const providers = [braveWebSearchProvider];

export async function searchWithProviders(query, { signal, limit = 10 } = {}) {
  const providerRuns = await Promise.all(providers.map(async (provider) => {
    const details = {
      id: provider.id,
      name: provider.name,
      sourceType: provider.sourceType,
    };

    if (!provider.isConfigured()) {
      return { provider: details, status: "not_configured", results: [] };
    }

    try {
      const results = await provider.search(query, { signal, limit });
      return { provider: details, status: "ok", results };
    } catch {
      return {
        provider: details,
        status: "error",
        message: "This search source is temporarily unavailable.",
        results: [],
      };
    }
  }));

  return {
    providers: providerRuns.map(({ results, ...provider }) => ({
      ...provider,
      resultCount: results.length,
    })),
    results: providerRuns.flatMap(({ results }) => results),
  };
}