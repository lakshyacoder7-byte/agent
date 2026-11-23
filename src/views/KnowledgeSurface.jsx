"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function KnowledgeSurface({
	title,
	eyebrow,
	description,
	icon = "◎",
	connected = false,
	providerName = "Provider",
	placeholder = "Search this knowledge area",
	actions = [],
	children,
}) {
	const router = useRouter();
	const [query, setQuery] = useState("");

	function submit(event) {
		event.preventDefault();
		if (!query.trim()) return;
		if (connected) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
	}

	return (
		<main className="workspace-page knowledge-surface">
			<header className="aven-discovery-hero">
				<div className="aven-discovery-orb" aria-hidden="true"><span>{icon}</span></div>
				<div>
					<p className="eyebrow">{eyebrow}</p>
					<h1>{title}</h1>
					<p className="page-lede">{description}</p>
				</div>
				<form className="aven-discovery-search" onSubmit={submit}>
					<span aria-hidden="true">⌕</span>
					<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
					<button className="button button--primary" type="submit" disabled={!query.trim() || !connected}>{connected ? "Search" : "Unavailable"}</button>
				</form>
			</header>

			{!connected && (
				<section className="notice-card provider-unavailable">
					<span className="notice-icon" aria-hidden="true">i</span>
					<div><h2>{providerName} not connected yet</h2><p>No live data is available for this experience. You can keep exploring connected sources in Discover.</p></div>
				</section>
			)}

			{actions.length > 0 && (
				<nav className="aven-tools-grid knowledge-surface-actions" aria-label={`${title} actions`}>
					{actions.map((action) => (
						<button type="button" className="aven-tool-card" key={action.label} onClick={() => action.onClick?.()}>
							<span>{action.icon}</span><strong>{action.label}</strong><small>{action.description}</small>
						</button>
					))}
				</nav>
			)}
			{children}
		</main>
	);
}
