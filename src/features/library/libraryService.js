import { requireSupabase } from "../../lib/supabaseClient.js";

const SAVED_SOURCE_FIELDS =
	"id, user_id, title, description, source_url, source_type, image_url, metadata, created_at";

export async function getSavedSources(userId) {
	if (!userId) throw new Error("Sign in to view your library.");

	const { data, error } = await requireSupabase()
		.from("saved_sources")
		.select(SAVED_SOURCE_FIELDS)
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data ?? [];
}

export async function saveSource(userId, result) {
	if (!userId) throw new Error("Sign in to save sources to your library.");
	if (!result?.url || !result?.title) throw new Error("This search result cannot be saved.");

	const supabase = requireSupabase();
	const { data: existing, error: lookupError } = await supabase
		.from("saved_sources")
		.select(SAVED_SOURCE_FIELDS)
		.eq("user_id", userId)
		.eq("source_url", result.url)
		.maybeSingle();

	if (lookupError) throw lookupError;
	if (existing) return { source: existing, alreadySaved: true };

	const metadata = {
		...(result.metadata && typeof result.metadata === "object" && !Array.isArray(result.metadata)
			? result.metadata
			: {}),
		provider: result.provider ?? null,
		publishedAt: result.publishedAt ?? null,
		language: result.language ?? null,
	};

	const { data, error } = await supabase
		.from("saved_sources")
		.insert({
			user_id: userId,
			title: result.title.slice(0, 500),
			description: result.description?.slice(0, 10000) || null,
			source_url: result.url,
			source_type: (result.sourceType || "web").slice(0, 50),
			image_url: result.imageUrl || null,
			metadata,
		})
		.select(SAVED_SOURCE_FIELDS)
		.single();

	if (error) throw error;
	return { source: data, alreadySaved: false };
}

export async function removeSavedSource(userId, sourceId) {
	if (!userId || !sourceId) throw new Error("Saved source is invalid.");

	const { error } = await requireSupabase()
		.from("saved_sources")
		.delete()
		.eq("id", sourceId)
		.eq("user_id", userId);

	if (error) throw error;
}
