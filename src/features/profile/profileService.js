import { requireSupabase } from "../../lib/supabaseClient.js";

const profileFields =
  "id, full_name, username, occupation, avatar_url, preferences, role, interests, created_at, updated_at";

export async function getProfile(userId) {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select(profileFields)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveProfile({ userId, fullName, role, interests }) {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: fullName.trim(),
        occupation: role,
        preferences: { interests },
        role,
        interests,
      },
      { onConflict: "id" },
    )
    .select(profileFields)
    .single();

  if (error) throw error;
  return data;
}