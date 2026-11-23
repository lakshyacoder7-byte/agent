import { requireSupabase } from "../../lib/supabaseClient.js";
import { getOAuthProvider, getSafeAuthDestination, getSafeAuthFlow } from "./authOAuth.js";

export async function signUp({ email, password, fullName }) {
  const supabase = requireSupabase();
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", "/onboarding");
  callbackUrl.searchParams.set("flow", "signup");
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: callbackUrl.toString(),
    },
  });
}

export async function signInWithOAuth(providerId, { nextPath = "/home", flow = "login" } = {}) {
  const provider = getOAuthProvider(providerId);
  if (!provider) throw new Error("This sign-in provider is not supported.");

  const supabase = requireSupabase();
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", getSafeAuthDestination(nextPath));
  callbackUrl.searchParams.set("flow", getSafeAuthFlow(flow));
  callbackUrl.searchParams.set("provider", provider.id);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider.supabaseProvider,
    options: {
      redirectTo: callbackUrl.toString(),
      ...(provider.scopes ? { scopes: provider.scopes } : {}),
    },
  });

  if (error || !data?.url) {
    const { error: clearError } = await supabase.auth.signOut({ scope: "local" });
    if (clearError) {
      throw new Error("Sign-in could not be started and AVEN could not clear the previous session. Please reload and try again.");
    }
    throw error ?? new Error("Supabase did not provide a sign-in redirect.");
  }

  return data;
}

export async function signIn({ email, password }) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const { error: clearError } = await supabase.auth.signOut({ scope: "local" });
    if (clearError) {
      throw new Error(
        "Supabase rejected those credentials, but AVEN could not confirm clearing the previous session. Please reload and try again.",
      );
    }
    throw error;
  }

  if (!data?.session || !data.user) {
    const { error: clearError } = await supabase.auth.signOut({ scope: "local" });
    if (clearError) {
      throw new Error("Supabase did not return a valid sign-in session, and AVEN could not clear the previous session.");
    }
    throw new Error("Supabase did not return a valid sign-in session. Please check your credentials and try again.");
  }

  const { data: verifiedData, error: verificationError } = await supabase.auth.getUser();
  if (verificationError || verifiedData.user?.id !== data.user.id) {
    const { error: clearError } = await supabase.auth.signOut({ scope: "local" });
    if (clearError) {
      throw new Error("AVEN could not verify the sign-in or clear the local session. Please reload and try again.");
    }
    throw new Error("Supabase could not verify this sign-in session. Please try again.");
  }

  return { user: verifiedData.user, session: data.session };
}

export async function getAuthenticatedUser(expectedUserId) {
  const { data, error } = await requireSupabase().auth.getUser();
  if (error) throw error;
  if (!data.user || (expectedUserId && data.user.id !== expectedUserId)) {
    throw new Error("Supabase did not verify the authenticated user.");
  }
  return data.user;
}

export async function signOut() {
  return requireSupabase().auth.signOut({ scope: "local" });
}

export async function sendPasswordReset(email) {
  const supabase = requireSupabase();
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", "/reset-password");
  callbackUrl.searchParams.set("flow", "recovery");
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl.toString(),
  });
}

export async function updatePassword(password) {
  return requireSupabase().auth.updateUser({ password });
}