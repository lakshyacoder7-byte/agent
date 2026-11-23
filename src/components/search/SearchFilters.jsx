import { supportsResultField } from "../../features/search/searchPresentation.js";

export default function SearchFilters({ results, filters, onChange }) {
	const hasContentTypes = supportsResultField(results, "sourceType");
	const languages = [...new Set(results.map((result) => result.language).filter((value) => typeof value === "string" && value.trim()))];
	const hasLanguages = supportsResultField(results, "language");
	const hasDates = supportsResultField(results, "publishedAt")
		&& results.every((result) => Number.isFinite(Date.parse(result.publishedAt)));
	const contentTypes = hasContentTypes ? [...new Set(results.map((result) => result.sourceType))] : [];

	function update(name, value) {
		onChange((current) => ({ ...current, [name]: value }));
	}

	return (
		<div className="search-filters" aria-label="Filter and sort search results">
			<label>
				<span>Content type</span>
				<select value={filters.contentType} onChange={(event) => update("contentType", event.target.value)} disabled={!hasContentTypes}>
					<option value="">All types</option>
					{contentTypes.map((type) => <option value={type} key={type}>{type.replaceAll("_", " ")}</option>)}
				</select>
			</label>
			<label>
				<span>Date range</span>
				<select value={filters.dateRange} onChange={(event) => update("dateRange", event.target.value)} disabled={!hasDates}>
					<option value="any">Any time</option>
					<option value="week">Past week</option>
					<option value="month">Past month</option>
					<option value="year">Past year</option>
				</select>
			</label>
			<label>
				<span>Language</span>
				<select value={filters.language} onChange={(event) => update("language", event.target.value)} disabled={!hasLanguages}>
					<option value="">All languages</option>
					{languages.map((language) => <option value={language} key={language}>{language}</option>)}
				</select>
			</label>
			<label>
				<span>Sort by</span>
				<select value={filters.sort} onChange={(event) => update("sort", event.target.value)}>
					<option value="relevance">Relevance</option>
					<option value="newest" disabled={!hasDates}>Newest first</option>
				</select>
			</label>
		</div>
	);
}
