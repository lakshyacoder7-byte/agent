"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { classifyOAuthCallbackError, getOAuthProvider, getOAuthStatusMessage, OAUTH_PROVIDERS } from "../../features/auth/authOAuth.js";
import { signInWithOAuth } from "../../features/auth/authService.js";

function ProviderIcon({ providerId }) {
	if (providerId === "microsoft") {
		return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#f25022" d="M2 2h9v9H2z"/><path fill="#7fba00" d="M13 2h9v9h-9z"/><path fill="#00a4ef" d="M2 13h9v9H2z"/><path fill="#ffb900" d="M13 13h9v9h-9z"/></svg>;
	}
	if (providerId === "google") {
		return <svg viewBox="0 0 24 24" aria-hidden="true"><text x="3" y="19" fill="#4285f4" fontFamily="Arial, sans-serif" fontSize="21" fontWeight="700">G</text></svg>;
	}
	if (providerId === "apple") {
		return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.8 12.6c0-2 1.6-3 1.7-3.1-1-1.4-2.5-1.6-3.1-1.6-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.7-1.5 0-2.9.9-3.7 2.3-1.6 2.8-.4 6.8 1.1 9.1.7 1.1 1.5 2.3 2.6 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1.1 2.6-2.3.8-1.3 1.1-2.6 1.1-2.7-.1 0-2-.8-2-3zM14.6 6.4c.6-.7 1-1.6.9-2.5-.9 0-1.9.6-2.5 1.2-.5.6-1 1.5-.9 2.4.9.1 1.9-.4 2.5-1.1z"/></svg>;
	}
	return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.68.08-.68 1.12.08 1.71 1.16 1.71 1.16 1 .1.47 2.05 2.89 1.61.1-.72.39-1.21.7-1.49-2.48-.28-5.08-1.24-5.08-5.53 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.68.11 2.96.72.78 1.16 1.78 1.16 3 0 4.3-2.6 5.24-5.1 5.52.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8z"/></svg>;
}

function callbackMessage() {
	const params = new URLSearchParams(window.location.search);
	const status = params.get("auth_error");
	const providerId = params.get("provider");
	if (!status) return "";
	return getOAuthStatusMessage(status, providerId);
}

export default function OAuthProviders({ flow = "login", nextPath = "/home" }) {
	const pathname = usePathname();
	const [busyProvider, setBusyProvider] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		setError(callbackMessage());
	}, [pathname]);

	async function handleProvider(providerId) {
		setError("");
		setBusyProvider(providerId);
		try {
			await signInWithOAuth(providerId, { nextPath, flow });
		} catch (authError) {
			const provider = getOAuthProvider(providerId);
			const reason = classifyOAuthCallbackError(authError?.code, authError?.message);
			setError(getOAuthStatusMessage(reason, provider?.id));
			setBusyProvider("");
		}
	}

	return (
		<div className="oauth-options">
			<div className="oauth-provider-list">
				{OAUTH_PROVIDERS.map((provider) => (
					<button
						className="oauth-provider-button"
						type="button"
						key={provider.id}
						disabled={Boolean(busyProvider)}
						onClick={() => handleProvider(provider.id)}
					>
						<span className={`oauth-provider-icon oauth-provider-icon--${provider.id}`}><ProviderIcon providerId={provider.id} /></span>
						<span>{busyProvider === provider.id ? `Connecting to ${provider.label}…` : `Continue with ${provider.label}`}</span>
					</button>
				))}
			</div>
			{error && <p className="auth-message auth-message--error oauth-error" role="alert">{error}</p>}
		</div>
	);
}