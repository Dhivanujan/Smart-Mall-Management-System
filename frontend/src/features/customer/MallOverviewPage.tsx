import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiClient } from "../../services/api/client";

interface StoreSummary {
	id: number;
	name: string;
	category: string;
	status: string;
	average_rating: number;
	current_footfall: number;
	current_occupancy_percent: number;
}

interface StoresResponse {
	stores: StoreSummary[];
}

export const MallOverviewPage: React.FC = () => {
	const [stores, setStores] = useState<StoreSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string>("all");

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const res = await apiClient.get<StoresResponse>("/api/v1/stores/");
				if (cancelled) return;
				setStores(res.data.stores);
				setError(null);
			} catch (err) {
				if (cancelled) return;
				console.error(err);
				setError("Failed to load mall overview.");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		load();

		return () => {
			cancelled = true;
		};
	}, []);

	const categories = useMemo(() => {
		const set = new Set<string>();
		stores.forEach((s) => set.add(s.category));
		return Array.from(set.values());
	}, [stores]);

	const filteredStores = useMemo(() => {
		return stores.filter((store) => {
			const matchesCategory = category === "all" || store.category === category;
			const matchesSearch =
				!search || store.name.toLowerCase().includes(search.toLowerCase());
			return matchesCategory && matchesSearch;
		});
	}, [stores, search, category]);

	return (
		<div className="app-page">
			<div className="app-page-inner">
				<section>
					<div className="app-badge" aria-label="Mall directory badge">
						<span className="app-badge-pill">●</span>
						Discover stores and live activity
					</div>
					<h1 className="app-hero-heading">Mall directory & live snapshot.</h1>
					<p className="app-hero-subtitle">
						Browse all stores in the mall, check live footfall and occupancy, and
							explore what each store offers.
					</p>
					<div className="app-actions">
						<Link to="/" className="btn btn-ghost">
							Back to overview
						</Link>
					</div>
				</section>
				<aside>
					<div className="app-card" aria-label="Store filters">
						<div className="app-card-header">
							<h2 className="app-card-title">Filter stores</h2>
							<p className="app-card-subtitle">
								Quickly find the store or category you care about.
							</p>
						</div>
						<div className="app-form" style={{ gap: "0.75rem" }}>
							<label className="app-field-label">
								<span>Search</span>
								<input
									type="search"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="app-input"
									placeholder="Search by store name"
								/>
							</label>
							<label className="app-field-label">
								<span>Category</span>
								<select
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									className="app-input"
								>
									<option value="all">All categories</option>
									{categories.map((cat) => (
										<option key={cat} value={cat}>
											{cat}
										</option>
									))}
								</select>
							</label>
						</div>
					</div>
				</aside>
			</div>
			<div className="app-page-inner" style={{ marginTop: "1.5rem" }}>
				{loading && <div>Loading stores…</div>}
				{!loading && error && (
					<div style={{ color: "#fca5a5" }}>{error}</div>
				)}
				{!loading && !error && (
					<div className="app-feature-grid" aria-label="Store cards">
						{filteredStores.map((store) => (
							<Link
								key={store.id}
								to={`/mall/stores/${store.id}`}
								className="app-feature-card"
							>
								<div className="app-feature-label">{store.category}</div>
								<div className="app-feature-title">{store.name}</div>
								<div className="app-feature-meta">
									<span className="app-feature-tag">
										Rating {store.average_rating.toFixed(1)}
									</span>
									<span className="app-feature-tag">
										Footfall {store.current_footfall}
									</span>
									<span className="app-feature-tag">
										Occupancy {store.current_occupancy_percent.toFixed(0)}%
									</span>
								</div>
							</Link>
						))}
						{!filteredStores.length && !loading && !error && (
							<p style={{ color: "#9ca3af" }}>No stores match your filters.</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
