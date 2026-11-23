function renderList(items) {
	return Array.isArray(items) ? items.filter((item) => typeof item === "string" && item.trim()) : [];
}

export default function AIAnswer({ query, answer }) {
	const answerReady = answer?.status === "ready";
	const overview = answerReady
		? (typeof answer.overview === "string" ? answer.overview : answer.text)
		: null;
	const facts = answerReady ? renderList(answer.importantFacts) : [];
	const concepts = answerReady ? renderList(answer.keyConcepts) : [];
	const hasContent = Boolean(overview || facts.length || concepts.length);

	return (
		<section className="knowledge-overview" aria-labelledby="knowledge-overview-title">
			<div className="knowledge-overview-heading">
				<div>
					<p className="eyebrow">KNOWLEDGE OVERVIEW</p>
					<h2 id="knowledge-overview-title">{query}</h2>
				</div>
				<span className={`knowledge-answer-status${hasContent ? " is-ready" : ""}`}>
					{hasContent ? "AI overview" : "Not connected"}
				</span>
			</div>
			{overview ? <p className="knowledge-overview-text">{overview}</p> : (
				<p className="knowledge-unavailable">An AI-generated topic overview is not available until an answer provider is connected.</p>
			)}
			{facts.length > 0 && <KnowledgeList title="Important facts" items={facts} />}
			{concepts.length > 0 && <KnowledgeList title="Key concepts" items={concepts} />}
		</section>
	);
}

function KnowledgeList({ title, items }) {
	return (
		<div className="knowledge-detail-group">
			<h3>{title}</h3>
			<ul>{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul>
		</div>
	);
}
