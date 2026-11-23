function strings(items) {
	return Array.isArray(items) ? items.filter((item) => typeof item === "string" && item.trim()) : [];
}

export default function RelatedQuestions({ answer, onChooseQuestion }) {
	const answerReady = answer?.status === "ready";
	const topics = answerReady ? strings(answer.relatedTopics) : [];
	const questions = answerReady ? strings(answer.suggestedQuestions) : [];
	const concepts = answerReady ? strings(answer.connectedConcepts) : [];
	const furtherReading = Array.isArray(answer?.furtherReading)
		&& answerReady
		? answer.furtherReading.filter((item) => {
			if (!item || typeof item.title !== "string" || typeof item.url !== "string") return false;
			try {
				const url = new URL(item.url);
				return url.protocol === "https:" || url.protocol === "http:";
			} catch {
				return false;
			}
		})
		: [];
	const hasRelatedKnowledge = topics.length || questions.length || concepts.length || furtherReading.length;

	return (
		<section className="related-knowledge" aria-labelledby="related-knowledge-title">
			<div className="related-knowledge-heading">
				<p className="eyebrow">CONTINUE EXPLORING</p>
				<h2 id="related-knowledge-title">Related knowledge</h2>
			</div>
			{!hasRelatedKnowledge ? (
				<p className="knowledge-unavailable">Related topics, suggested questions, and connected concepts are not available until an AI knowledge provider is connected.</p>
			) : (
				<div className="related-knowledge-grid">
					{topics.length > 0 && <KnowledgeLinks title="Related topics" items={topics} onSelect={onChooseQuestion} />}
					{concepts.length > 0 && <KnowledgeLinks title="Connected concepts" items={concepts} onSelect={onChooseQuestion} />}
					{questions.length > 0 && <KnowledgeLinks title="Suggested questions" items={questions} onSelect={onChooseQuestion} />}
					{furtherReading.length > 0 && (
						<div className="related-knowledge-group">
							<h3>Further reading</h3>
							<ul>{furtherReading.map((item) => (
								<li key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></li>
							))}</ul>
						</div>
					)}
				</div>
			)}
		</section>
	);
}

function KnowledgeLinks({ title, items, onSelect }) {
	return (
		<div className="related-knowledge-group">
			<h3>{title}</h3>
			<ul>{items.map((item) => (
				<li key={item}>
					{onSelect ? <button type="button" onClick={() => onSelect(item)}>{item}</button> : item}
				</li>
			))}</ul>
		</div>
	);
}
