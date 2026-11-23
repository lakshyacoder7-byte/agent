export class SearchRequestError extends Error {
	constructor(message, status = 500) {
		super(message);
		this.name = "SearchRequestError";
		this.status = status;
	}
}

export async function searchKnowledge(query, { signal } = {}) {
	let response;
	try {
		response = await fetch("/api/search", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query }),
			cache: "no-store",
			signal,
		});
	} catch (error) {
		if (error?.name === "AbortError") throw error;
		throw new SearchRequestError("The search service could not be reached.");
	}

	let payload;
	try {
		payload = await response.json();
	} catch {
		throw new SearchRequestError("The search service returned an invalid response.", response.status);
	}

	if (!response.ok) {
		throw new SearchRequestError(
			payload?.error?.message || "Search could not be completed.",
			response.status,
		);
	}

	return payload;
}
