import { SEARCH_CATEGORIES } from "../../features/search/searchPresentation.js";

export default function ResultTabs({ value, onChange }) {
	return (
		<div className="search-categories-wrap">
			<p className="search-control-label" id="search-category-label">Search category</p>
			<div className="search-categories" role="group" aria-labelledby="search-category-label">
				{SEARCH_CATEGORIES.map((category) => (
					<button
						key={category.id}
						className={`search-category${value === category.id ? " is-active" : ""}${!category.connected ? " is-unavailable" : ""}`}
						type="button"
						aria-pressed={value === category.id}
						onClick={() => onChange(category.id)}
					>
						{category.label}
						{!category.connected && <span className="category-status-dot" aria-hidden="true" />}
					</button>
				))}
			</div>
		</div>
	);
}
