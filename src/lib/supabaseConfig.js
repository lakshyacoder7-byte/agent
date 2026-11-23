export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

export function getSupabaseConfigError() {
  if (!supabaseUrl || !supabasePublishableKey) {
    return "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.";
  }

  try {
    const url = new URL(supabaseUrl);
    if (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.hostname &&
      (url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1")
    ) {
      return null;
    }
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS Supabase project URL.";
  }

  return "NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS Supabase project URL.";
}
