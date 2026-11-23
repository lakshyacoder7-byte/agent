export const OAUTH_PROVIDERS = [
	{ id: "google", supabaseProvider: "google", label: "Google", scopes: "openid email profile" },
	{ id: "microsoft", supabaseProvider: "azure", label: "Microsoft", scopes: "email" },
	{ id: "apple", supabaseProvider: "apple", label: "Apple", scopes: "name email" },
	{ id: "github", supabaseProvider: "github", label: "GitHub", scopes: "read:user user:email" },
];

const SAFE_DESTINATIONS = new Set(["/home", "/onboarding"]);
const SAFE_FLOWS = new Set(["login", "signup", "recovery"]);

export function getOAuthProvider(providerId) {
	return OAUTH_PROVIDERS.find((provider) => provider.id === providerId) ?? null;
}

export function getSafeAuthDestination(destination) {
	return SAFE_DESTINATIONS.has(destination) ? destination : "/home";
}

export function getSafeAuthFlow(flow) {
	return SAFE_FLOWS.has(flow) ? flow : "login";
}

export function classifyOAuthCallbackError(errorCode, description = "") {
	const details = `${errorCode ?? ""} ${description}`.toLowerCase();
	if (details.includes("access_denied") || details.includes("cancel") || details.includes("user denied")) {
		return "cancelled";
	}
	if (
		details.includes("unsupported_provider")
		|| details.includes("unsupported provider")
		|| details.includes("provider is not enabled")
		|| details.includes("provider not enabled")
		|| details.includes("redirect_uri_mismatch")
	) {
		return "provider_setup";
	}
	return "oauth_failed";
}

export function getOAuthStatusMessage(status, providerId) {
	const provider = getOAuthProvider(providerId);
	if (!provider) {
		if (status === "cancelled") return "The authentication step was cancelled. No account was connected.";
		if (status === "provider_setup") return "This sign-in provider is not enabled for AVEN yet. Configure it in Supabase Auth settings.";
		return "We could not complete sign-in or email confirmation. Please try again or request a new confirmation email.";
	}
	const providerName = provider.label;
	if (status === "cancelled") return `${providerName} sign-in was cancelled. No account was connected.`;
	if (status === "provider_setup") {
		return `${providerName} sign-in is not enabled for AVEN yet. Configure this provider and its callback URLs in Supabase Auth settings.`;
	}
	return `${providerName} sign-in could not be completed. Please try again or use email.`;
}

export function getOAuthErrorReturnPath(flow) {
	if (flow === "signup") return "/signup";
	if (flow === "recovery") return "/forgot-password";
	return "/login";
}

export function getPostAuthDestination({ flow, nextPath, profileComplete }) {
	if (flow === "recovery") return "/reset-password";
	if (!profileComplete) return "/onboarding";
	const safeDestination = getSafeAuthDestination(nextPath);
	return safeDestination === "/onboarding" ? "/home" : safeDestination;
}