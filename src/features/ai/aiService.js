export async function generateAnswer({ query, sources }) {
	return {
		status: "not_configured",
		text: null,
		overview: null,
		importantFacts: [],
		keyConcepts: [],
		relatedTopics: [],
		suggestedQuestions: [],
		furtherReading: [],
		connectedConcepts: [],
		citations: [],
		query,
		sourceCount: sources.length,
	};
}
