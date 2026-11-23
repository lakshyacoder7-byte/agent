import { requireSupabase } from "../../lib/supabaseClient.js";

const HISTORY_FIELDS = "id, user_id, query, created_at";
const HISTORY_LIMIT = 8;

export async function getRecentSearches(userId, limit = HISTORY_LIMIT) {
	if (!userId) throw new Error("Sign in to view search history.");

	const { data, error } = await requireSupabase()
		.from("search_history")
		.select(HISTORY_FIELDS)
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(Math.min(Math.max(Number(limit) || HISTORY_LIMIT, 1), 50));

	if (error) throw error;
	return data ?? [];
}

export async function saveSearchHistory(userId, query) {
	const normalizedQuery = typeof query === "string" ? query.trim() : "";
	if (!userId) throw new Error("Sign in to save search history.");
	if (!normalizedQuery || normalizedQuery.length > 2000) {
		throw new Error("Search history query is invalid.");
	}

	const { data, error } = await requireSupabase()
		.from("search_history")
		.insert({ user_id: userId, query: normalizedQuery })
		.select(HISTORY_FIELDS)
		.single();

	if (error) throw error;
	return data;
}

export async function deleteSearchHistory(userId, entryId) {
	if (!userId || !entryId) throw new Error("Search history entry is invalid.");

	const { error } = await requireSupabase()
		.from("search_history")
		.delete()
		.eq("id", entryId)
		.eq("user_id", userId);

	if (error) throw error;
}

export async function clearSearchHistory(userId) {
	if (!userId) throw new Error("Sign in to clear search history.");

	const { error } = await requireSupabase()
		.from("search_history")
		.delete()
		.eq("user_id", userId);

	if (error) throw error;
}
