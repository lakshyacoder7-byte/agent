import { NextResponse } from "next/server";
import {
	classifyOAuthCallbackError,
	getOAuthErrorReturnPath,
	getOAuthProvider,
	getPostAuthDestination,
	getSafeAuthDestination,
	getSafeAuthFlow,
} from "../../../features/auth/authOAuth.js";
import { isProfileComplete } from "../../../features/profile/profileCompletion.js";
import { createServerSupabaseClient } from "../../../lib/supabaseServer.js";

function errorRedirect(requestUrl, status, flow, providerId) {
	const destination = new URL(getOAuthErrorReturnPath(flow), requestUrl.origin);
	destination.searchParams.set("auth_error", status);
	if (getOAuthProvider(providerId)) destination.searchParams.set("provider", providerId);
	return NextResponse.redirect(destination);
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const flow = getSafeAuthFlow(requestUrl.searchParams.get("flow"));
  const nextPath = getSafeAuthDestination(requestUrl.searchParams.get("next"));
  const providerId = requestUrl.searchParams.get("provider");
  const code = requestUrl.searchParams.get("code");
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return errorRedirect(requestUrl, "oauth_failed", flow, providerId);
  }

  const callbackError = requestUrl.searchParams.get("error");
  if (callbackError || !code) {
		await supabase.auth.signOut({ scope: "local" });
		if (callbackError) {
			const reason = classifyOAuthCallbackError(callbackError, requestUrl.searchParams.get("error_description"));
			return errorRedirect(requestUrl, reason, flow, providerId);
		}
		return errorRedirect(requestUrl, "oauth_failed", flow, providerId);
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data?.session?.user?.id) {
		await supabase.auth.signOut({ scope: "local" });
		return errorRedirect(requestUrl, "oauth_failed", flow, providerId);
  }

  const { data: verifiedData, error: verificationError } = await supabase.auth.getUser();
  if (verificationError || verifiedData?.user?.id !== data.session.user.id) {
		await supabase.auth.signOut({ scope: "local" });
		return errorRedirect(requestUrl, "oauth_failed", flow, providerId);
  }

  if (flow === "recovery") {
		return NextResponse.redirect(new URL("/reset-password", requestUrl.origin));
  }

  const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select("full_name, role, interests, occupation, preferences")
		.eq("id", verifiedData.user.id)
		.maybeSingle();

  const destination = getPostAuthDestination({
		flow,
		nextPath,
		profileComplete: !profileError && isProfileComplete(profile),
  });
  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}