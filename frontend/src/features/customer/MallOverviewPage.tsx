import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiClient } from "@/services/api/client";
import type { StoreSummary, StoresResponse } from "@/types";

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
	const full = Math.floor(rating);
	const half = rating - full >= 0.5 ? 1 : 0;
	const empty = 5 - full - half;
	return (
		<span style={{ display: "inline-flex", alignItems: "center", gap: "1px", fontSize: "0.72rem", color: "#fbbf24" }}>
			{"★".repeat(full)}
			{half ? "★" : ""}
			<span style={{ color: "rgba(148,163,184,0.4)" }}>{"☆".repeat(empty)}</span>
			<span style={{ marginLeft: "0.3rem", fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
				{rating.toFixed(1)}
			</span>
		</span>
	);
};

const OccupancyBar: React.FC<{ percent: number }> = ({ percent }) => {
	const color = percent > 80 ? "#f87171" : percent > 50 ? "#fbbf24" : "#4ade80";
	return (
		<div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.35rem" }}>
			<div style={{ flex: 1, height: "4px", borderRadius: "999px", background: "rgba(148,163,184,0.12)", overflow: "hidden" }}>
				<div style={{ width: `${Math.min(percent, 100)}%`, height: "100%", borderRadius: "999px", background: color, transition: "width 0.5s ease-out" }} />
			</div>
			<span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", minWidth: "28px", textAlign: "right" }}>
				{percent.toFixed(0)}%
			</span>
		</div>
	);
};

export const MallOverviewPage: React.FC = () => {
	const [stores, setStores] = useState<StoreSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [sortBy, setSortBy] = useState<string>("name");

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
		return Array.from(set.values()).sort();
	}, [stores]);

	const filteredStores = useMemo(() => {
		let result = stores.filter((store) => {
			const matchesCategory = category === "all" || store.category === category;
			const matchesSearch = !search || store.name.toLowerCase().includes(search.toLowerCase());
			const matchesStatus = statusFilter === "all" || store.status === statusFilter;
			return matchesCategory && matchesSearch && matchesStatus;
		});

		result.sort((a, b) => {
			switch (sortBy) {
				case "rating": return b.average_rating - a.average_rating;
				case "footfall": return b.current_footfall - a.current_footfall;
				case "occupancy": return b.current_occupancy_percent - a.current_occupancy_percent;
				default: return a.name.localeCompare(b.name);
			}
		});

		return result;
	}, [stores, search, category, statusFilter, sortBy]);

	const totalFootfall = useMemo(() => stores.reduce((sum, s) => sum + s.current_footfall, 0), [stores]);
	const avgOccupancy = useMemo(() => {
		if (!stores.length) return 0;
		return stores.reduce((sum, s) => sum + s.current_occupancy_percent, 0) / stores.length;
	}, [stores]);
	const openStores = useMemo(() => stores.filter((s) => s.status === "open").length, [stores]);

	return (
		<div className="app-page" style={{ flexDirection: "column", alignItems: "center", gap: 0 }}>
			<div className="app-page-inner animate-fade-in-up">
				<section>
					<Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--color-text-muted)", textDecoration: "none", marginBottom: "1rem" }}>
						← Back to home
					</Link>
					<div className="app-badge" aria-label="Mall directory badge" style={{ marginBottom: "0.75rem" }}>
						<span className="app-badge-pill" style={{ color: "#4ade80" }}>●</span>
						Discover stores and live activity
					</div>
					<h1 className="app-hero-heading">Mall directory &amp; live snapshot.</h1>
					<p className="app-hero-subtitle">
						Browse all stores in the mall, check live footfall and occupancy, and explore what each store offers.
					</p>

					{!loading && !error && (
						<div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(148,163,184,0.12)" }}>
							<div>
								<div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#a5b4fc" }}>{stores.length}</div>
								<div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total stores</div>
							</div>
							<div>
								<div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#4ade80" }}>{openStores}</div>
								<div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Open now</div>
							</div>
							<div>
								<div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#38bdf8" }}>{totalFootfall.toLocaleString()}</div>
								<div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live footfall</div>
							</div>
							<div>
								<div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fbbf24" }}>{avgOccupancy.toFixed(0)}%</div>
								<div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Avg occupancy</div>
							</div>
						</div>
					)}
				</section>
				<aside>
					<div className="app-card animate-fade-in-up stagger-2" aria-label="Store filters">
						<div className="app-card-header">
							<h2 className="app-card-title">🔍 Filter stores</h2>
							<p className="app-card-subtitle">Quickly find the store or category you care about.</p>
						</div>
						<div className="app-form" style={{ gap: "0.75rem" }}>
							<label className="app-field-label">
								<span>Search</span>
								<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="app-input" placeholder="Search by store name…" />
							</label>
							<label className="app-field-label">
								<span>Category</span>
								<select value={category} onChange={(e) => setCategory(e.target.value)} className="app-input">
									<option value="all">All categories</option>
									{categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
								</select>
							</label>
							<label className="app-field-label">
								<span>Status</span>
								<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="app-input">
									<option value="all">All statuses</option>
									<option value="open">Open</option>
									<option value="closed">Closed</option>
								</select>
							</label>
							<label className="app-field-label">
								<span>Sort by</span>
								<select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="app-input">
									<option value="name">Name (A–Z)</option>
									<option value="rating">Rating (high first)</option>
									<option value="footfall">Footfall (high first)</option>
									<option value="occupancy">Occupancy (high first)</option>
								</select>
							</label>
						</div>
					</div>
				</aside>
			</div>

			<div style={{ width: "100%", maxWidth: "1120px", padding: "0 1.5rem", marginTop: "1.5rem" }}>
				{loading && <div className="loading-spinner">Loading stores…</div>}
				{!loading && error && (
					<div className="error-banner">
						<span className="error-icon">⚠️</span>
						<span>{error}</span>
					</div>
				)}
				{!loading && !error && (
					<>
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
							<div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
								Showing {filteredStores.length} of {stores.length} stores
							</div>
						</div>
						<div className="app-feature-grid" aria-label="Store cards" style={{ marginTop: 0, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
							{filteredStores.map((store, i) => (
								<Link
									key={store.id}
									to={`/mall/stores/${store.id}`}
									className={`app-feature-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
									style={{ textDecoration: "none", color: "inherit" }}
								>
									<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.25rem" }}>
										<div className="app-feature-label">{store.category}</div>
										<span className={`status-badge ${store.status}`}>
											<span className="dot" />
											{store.status}
										</span>
									</div>
									<div className="app-feature-title" style={{ marginBottom: "0.35rem" }}>{store.name}</div>
									<StarRating rating={store.average_rating} />
									<div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.78rem" }}>
										<div>
											<div style={{ color: "var(--color-text-muted)" }}>Footfall</div>
											<div style={{ fontWeight: 600 }}>{store.current_footfall}</div>
										</div>
										<div style={{ flex: 1 }}>
											<div style={{ color: "var(--color-text-muted)" }}>Occupancy</div>
											<OccupancyBar percent={store.current_occupancy_percent} />
										</div>
									</div>
								</Link>
							))}
						</div>
						{!filteredStores.length && (
							<div className="empty-state">
								<div className="empty-state-icon">🔍</div>
								<h3>No stores found</h3>
								<p>Try adjusting your search or filter criteria to find what you&apos;re looking for.</p>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};
