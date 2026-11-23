"use client";

import { useState } from "react";
import { MAX_SEARCH_QUERY_LENGTH } from "../../features/search/searchValidation.js";
import SearchSuggestions from "./SearchSuggestions.jsx";

export default function SearchBar({ value, onChange, onSubmit, onClear, isLoading, recentSearches, onChooseSuggestion }) {
	const [suggestionsOpen, setSuggestionsOpen] = useState(false);

	return (
		<div className="search-entry-wrap">
			<form className="workspace-search" onSubmit={(event) => {
				setSuggestionsOpen(false);
				onSubmit(event);
			}} aria-label="Search the web" aria-busy={isLoading}>
				<span className="workspace-search-icon" aria-hidden="true">⌕</span>
				<input
					type="search"
					value={value}
					onFocus={() => setSuggestionsOpen(true)}
					onChange={(event) => onChange(event.target.value)}
					maxLength={MAX_SEARCH_QUERY_LENGTH}
					placeholder="Ask a question or enter a topic"
					aria-label="Search question, topic, or keywords"
				/>
				{value && (
					<button className="search-clear" type="button" onClick={onClear} aria-label="Clear search">
						<span aria-hidden="true">×</span>
					</button>
				)}
				<button className="button button--primary" type="submit" disabled={!value.trim() || isLoading}>
					{isLoading ? "Searching…" : "Search"}
				</button>
			</form>
			<SearchSuggestions
				open={suggestionsOpen}
				query={value}
				recentSearches={recentSearches}
				onChoose={(entry) => {
					setSuggestionsOpen(false);
					onChooseSuggestion(entry);
				}}
				onDismiss={() => setSuggestionsOpen(false)}
			/>
		</div>
	);
}
