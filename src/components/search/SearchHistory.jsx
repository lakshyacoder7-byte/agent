export default function SearchHistory({ entries, isLoading, error, onRepeat, onDelete }) {
	if (isLoading) {
		return <p className="search-history-status" role="status">Loading recent searches…</p>;
	}
	if (error) {
		return <p className="search-history-status search-history-status--error" role="alert">{error}</p>;
	}
	if (!entries.length) return null;

	return (
		<section className="search-history" aria-labelledby="search-history-heading">
			<div className="search-history-heading">
				<div>
					<p className="eyebrow">YOUR ACTIVITY</p>
					<h2 id="search-history-heading">Recent searches</h2>
				</div>
			</div>
			<ul>
				{entries.map((entry) => (
					<li key={entry.id}>
						<button className="search-history-query" type="button" onClick={() => onRepeat(entry.query)}>
							<span aria-hidden="true">↺</span>{entry.query}
						</button>
						<button className="search-history-delete" type="button" onClick={() => onDelete(entry.id)} aria-label={`Delete search: ${entry.query}`}>
							<span aria-hidden="true">×</span>
						</button>
					</li>
				))}
			</ul>
		</section>
	);
}
