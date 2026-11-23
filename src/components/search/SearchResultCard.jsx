export default function SearchResultCard({
	result,
	saved = false,
	working = false,
	error = "",
	actionLabel = "Save to Library",
	actionDoneLabel = "Saved to Library",
	workingLabel = "Saving…",
	onAction,
}) {
	let hostname = result.url;
	try {
		hostname = new URL(result.url).hostname.replace(/^www\./u, "");
	} catch {
		// Keep the source URL visible if an unexpected persisted URL is malformed.
	}
	const providerName = result.provider?.name || hostname;
	let imageUrl = "";
	try {
		const parsedImageUrl = new URL(result.imageUrl);
		if (parsedImageUrl.protocol === "https:" || parsedImageUrl.protocol === "http:") imageUrl = parsedImageUrl.href;
	} catch {
		// Ignore malformed optional thumbnails.
	}
	const publishedAt = result.publishedAt && Number.isFinite(Date.parse(result.publishedAt))
		? new Date(result.publishedAt).toLocaleDateString()
		: null;
		const resourceType = typeof result.sourceType === "string"
			? result.sourceType.replace(/[-_]+/gu, " ")
			: "source";

	return (
		<article className="search-result-card">
			{imageUrl && <img className="search-result-thumbnail" src={imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />}
			<div className="search-result-meta">
				<span>{providerName}</span>
				<span aria-hidden="true">·</span>
				<span>{hostname}</span>
				{publishedAt && <><span aria-hidden="true">·</span><time dateTime={result.publishedAt}>{publishedAt}</time></>}
				<span className="search-result-type">{resourceType}</span>
			</div>
			<h3>
				<a href={result.url} target="_blank" rel="noreferrer" aria-label={`${result.title} (opens in a new tab)`}>
					{result.title}
				</a>
			</h3>
			{result.description && <p>{result.description}</p>}
			<a className="search-result-url" href={result.url} target="_blank" rel="noreferrer">
				{result.url}
				<span aria-hidden="true">↗</span>
			</a>
			{onAction && (
				<div className="search-result-actions">
					<button className="button button--secondary" type="button" onClick={onAction} disabled={working || (saved && actionDoneLabel !== "") }>
						{working ? workingLabel : saved ? actionDoneLabel : actionLabel}
					</button>
					{error && <span className="search-result-action-error" role="alert">{error}</span>}
				</div>
			)}
		</article>
	);
}
