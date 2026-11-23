import SearchResultCard from "../search/SearchResultCard.jsx";

export default function KnowledgeSections({ sections, savedUrls, workingUrls, actionErrors, onSave }) {
	return (
		<div className="knowledge-sections">
			{sections.map((section) => (
				<section className="knowledge-section" key={section.id} id={`knowledge-${section.id}`} aria-labelledby={`knowledge-${section.id}-title`}>
					<header className="knowledge-section-heading">
						<h2 id={`knowledge-${section.id}-title`}>{section.label}</h2>
						<span>{section.results.length}</span>
					</header>
					<div className="search-results-list">
						{section.results.map((result) => (
							<SearchResultCard
								key={result.id}
								result={result}
								saved={savedUrls.has(result.url)}
								working={workingUrls.has(result.url)}
								error={actionErrors[result.url]}
								onAction={() => onSave(result)}
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
}