export default function SearchSuggestions({ open, query, recentSearches, onChoose, onDismiss }) {
	if (!open) return null;

	const normalizedQuery = query.trim().toLocaleLowerCase();
	const matches = recentSearches
		.filter((entry) => !normalizedQuery || entry.query.toLocaleLowerCase().includes(normalizedQuery))
		.slice(0, 5);

	return (
		<div className="search-suggestions" role="region" aria-label="Search suggestions">
			{matches.length > 0 ? (
				<>
					<p className="search-suggestions-label">{normalizedQuery ? "Recent matching searches" : "Recent searches"}</p>
					<ul>
						{matches.map((entry) => (
							<li key={entry.id}>
								<button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => onChoose(entry)}>
									<span aria-hidden="true">⌕</span>{entry.query}
								</button>
							</li>
						))}
					</ul>
				</>
			) : (
				<div className="search-suggestions-empty">
					<span>Live query suggestions are not connected yet.</span>
					<button type="button" onMouseDown={(event) => event.preventDefault()} onClick={onDismiss} aria-label="Dismiss suggestions">×</button>
				</div>
			)}
		</div>
	);
}
