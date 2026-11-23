import { generateAnswer } from "../../../features/ai/aiService.js";
import { searchWithProviders } from "../../../features/search/providers/index.js";
import { validateSearchQuery } from "../../../features/search/searchValidation.js";
import { createServerSupabaseClient } from "../../../lib/supabaseServer.js";

export const runtime = "nodejs";

function jsonResponse(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function errorResponse(code, message, status, extra = {}) {
  return jsonResponse({ error: { code, message }, ...extra }, status);
}

export async function POST(request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return errorResponse("auth_not_configured", "Authentication is not configured.", 503);
  }

  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data?.user) {
    return errorResponse("unauthorized", "Sign in to search.", 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("invalid_json", "Send a valid JSON search request.", 400);
  }

  const validation = validateSearchQuery(body?.query);
  if (!validation.valid) {
    return errorResponse("invalid_query", validation.error, 400);
  }

  const search = await searchWithProviders(validation.query, { signal: request.signal });
  const hasConfiguredProvider = search.providers.some((provider) => provider.status === "ok");

  if (!hasConfiguredProvider) {
    const allUnconfigured = search.providers.every((provider) => provider.status === "not_configured");
    if (allUnconfigured) {
      return errorResponse(
        "provider_not_configured",
        "Web search is not configured. Add BRAVE_SEARCH_API_KEY to the server environment.",
        503,
        { providers: search.providers },
      );
    }

    return errorResponse(
      "provider_unavailable",
      "The search provider is temporarily unavailable. Try again shortly.",
      502,
      { providers: search.providers },
    );
  }

  const answer = await generateAnswer({ query: validation.query, sources: search.results });
  return jsonResponse({
    query: validation.query,
    results: search.results,
    providers: search.providers,
    answer,
    totalResults: search.results.length,
  });
}