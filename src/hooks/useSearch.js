"use client";

import { useEffect, useRef, useState } from "react";
import { searchKnowledge } from "../features/search/searchService.js";
import { validateSearchQuery } from "../features/search/searchValidation.js";

export function useSearch() {
	const [data, setData] = useState(null);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const activeRequest = useRef(null);

	useEffect(() => () => activeRequest.current?.abort(), []);

	async function search(value) {
		const validation = validateSearchQuery(value);
		if (!validation.valid) {
			setError(validation.error);
			setData(null);
			return;
		}

		activeRequest.current?.abort();
		const controller = new AbortController();
		activeRequest.current = controller;
		setError("");
		setData(null);
		setIsLoading(true);

		try {
			const response = await searchKnowledge(validation.query, { signal: controller.signal });
			if (!controller.signal.aborted) setData(response);
		} catch (requestError) {
			if (!controller.signal.aborted) {
				setError(requestError.message || "Search could not be completed.");
			}
		} finally {
			if (!controller.signal.aborted) {
				setIsLoading(false);
				activeRequest.current = null;
			}
		}
	}

	function clearError() {
		setError("");
	}

	function clearResults() {
		activeRequest.current?.abort();
		activeRequest.current = null;
		setData(null);
		setError("");
		setIsLoading(false);
	}

	return { data, error, isLoading, search, clearError, clearResults };
}
