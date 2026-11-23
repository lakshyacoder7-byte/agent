export const MAX_SEARCH_QUERY_LENGTH = 300;

export function validateSearchQuery(value) {
	if (typeof value !== "string") {
		return { valid: false, error: "Enter a question or topic to search." };
	}

	const query = value.replace(/\s+/gu, " ").trim();
	if (!query) {
		return { valid: false, error: "Enter a question or topic to search." };
	}
	if (query.length > MAX_SEARCH_QUERY_LENGTH) {
		return { valid: false, error: `Search queries must be ${MAX_SEARCH_QUERY_LENGTH} characters or fewer.` };
	}
	if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(query)) {
		return { valid: false, error: "Your search contains unsupported control characters." };
	}

	return { valid: true, query };
}
