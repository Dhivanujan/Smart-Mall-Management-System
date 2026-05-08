import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/services/api/client";
import { favoritesApi } from "@/services/api/favorites";
import { discoveryApi } from "@/services/api/discovery";
const StarRating = ({ rating }) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (<span className="star-rating">
			{"★".repeat(full)}
			{half ? "★" : ""}
			<span className="star-rating-empty">{"☆".repeat(empty)}</span>
			<span className="star-rating-value">
				{rating.toFixed(1)}
			</span>
		</span>);
};
const OccupancyBar = ({ percent }) => {
    const color = percent > 80 ? "#ef4444" : percent > 50 ? "#f59e0b" : "#22c55e";
    return (<div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.35rem" }}>
			<div className="progress-bar-track relative overflow-hidden bg-secondary/50">
				<div className="progress-bar-fill transition-all duration-500 ease-out absolute inset-y-0 left-0" style={{ width: `${Math.min(percent, 100)}%`, background: color }}/>
			</div>
			<span style={{ fontSize: "0.7rem", color: color, minWidth: "28px", textAlign: "right", fontWeight: "bold" }}>
				{percent.toFixed(0)}%
			</span>
		</div>);
};
export const MallOverviewPage = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");
	const [favoriteStoreIds, setFavoriteStoreIds] = useState([]);
	const [favoritesOnly, setFavoritesOnly] = useState(false);
	const [trendingStores, setTrendingStores] = useState([]);
	const [bannerMessage, setBannerMessage] = useState("");
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await apiClient.get("/api/v1/stores/");
                if (cancelled)
                    return;
                setStores(res.data.stores);
				const [favoritesRes, trendingRes] = await Promise.all([
					favoritesApi.list(),
					discoveryApi.trendingStores(4),
				]);
				if (cancelled)
					return;
				setFavoriteStoreIds(favoritesRes.data.store_ids ?? []);
				setTrendingStores(trendingRes.data.stores ?? []);
                setError(null);
            }
            catch (err) {
                if (cancelled)
                    return;
                console.error(err);
                setError("Failed to load mall overview.");
            }
            finally {
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
        const set = new Set();
        stores.forEach((s) => set.add(s.category));
        return Array.from(set.values()).sort();
    }, [stores]);
    const filteredStores = useMemo(() => {
        let result = stores.filter((store) => {
            const matchesCategory = category === "all" || store.category === category;
            const matchesSearch = !search || store.name.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || store.status === statusFilter;
			const matchesFavorites = !favoritesOnly || favoriteStoreIds.includes(store.id);
			return matchesCategory && matchesSearch && matchesStatus && matchesFavorites;
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
	}, [stores, search, category, statusFilter, sortBy, favoritesOnly, favoriteStoreIds]);
    const totalFootfall = useMemo(() => stores.reduce((sum, s) => sum + s.current_footfall, 0), [stores]);
    const avgOccupancy = useMemo(() => {
        if (!stores.length)
            return 0;
        return stores.reduce((sum, s) => sum + s.current_occupancy_percent, 0) / stores.length;
    }, [stores]);
    const openStores = useMemo(() => stores.filter((s) => s.status === "open").length, [stores]);
	const toggleFavorite = async (storeId) => {
		try {
			if (favoriteStoreIds.includes(storeId)) {
				await favoritesApi.removeStore(storeId);
				setFavoriteStoreIds((prev) => prev.filter((id) => id !== storeId));
				setBannerMessage("Store removed from favorites.");
			}
			else {
				await favoritesApi.addStore(storeId);
				setFavoriteStoreIds((prev) => [...prev, storeId]);
				setBannerMessage("Store added to favorites.");
			}
		}
		catch (err) {
			setBannerMessage(err.response?.data?.detail ?? "Could not update favorites.");
		}
	};
    return (<div className="app-page" style={{ flexDirection: "column", alignItems: "center", gap: 0 }}>
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

					{!loading && !error && (<div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(148,163,184,0.12)" }}>
							<div className="bg-secondary/40 backdrop-blur-md border border-border/50 rounded-xl px-4 py-3 min-w-[110px]">
								<div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#a5b4fc" }}>{stores.length}</div>
								<div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Total stores</div>
							</div>
							<div className="bg-secondary/40 backdrop-blur-md border border-border/50 rounded-xl px-4 py-3 min-w-[110px]">
								<div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#4ade80" }}>{openStores}</div>
								<div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Open now</div>
							</div>
							<div className="bg-secondary/40 backdrop-blur-md border border-border/50 rounded-xl px-4 py-3 min-w-[110px]">
								<div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#38bdf8" }}>{totalFootfall.toLocaleString()}</div>
								<div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Live footfall</div>
							</div>
							<div className="bg-secondary/40 backdrop-blur-md border border-border/50 rounded-xl px-4 py-3 min-w-[110px]">
								<div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fbbf24" }}>{avgOccupancy.toFixed(0)}%</div>
								<div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Avg occupancy</div>
							</div>
						</div>)}
				</section>
				<aside>
					<div className="app-card animate-fade-in-up stagger-2" aria-label="Store filters">
						<div className="app-card-header pb-3 border-b border-border/50 mb-4">
							<h2 className="app-card-title text-xl flex items-center gap-2"><span className="text-primary">🔍</span> Filter stores</h2>
							<p className="app-card-subtitle">Quickly find the store or category you care about.</p>
						</div>
						<div className="app-form" style={{ gap: "0.75rem" }}>
							<label className="app-field-label border-b border-border/30 pb-3">
								<span className="font-semibold">Search</span>
								<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="app-input bg-secondary/30" placeholder="Search by store name…"/>
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
				{bannerMessage && (<div className="message-banner" style={{ marginBottom: "1rem" }}>{bannerMessage}</div>)}
				{loading && <div className="loading-spinner">Loading stores…</div>}
				{!loading && error && (<div className="error-banner">
						<span className="error-icon">⚠️</span>
						<span>{error}</span>
					</div>)}
				{!loading && !error && (<>
						{trendingStores.length > 0 && (<div className="section-card" style={{ marginBottom: "1rem" }}>
							<h2 className="section-title">Trending Right Now</h2>
							<div className="booking-list">
								{trendingStores.map((store) => (<div key={store.id} className="booking-item">
									<div>
										<div className="booking-title">{store.name}</div>
										<div className="booking-time">{store.category}</div>
									</div>
									<span className="booking-status">👥 {store.current_footfall}</span>
								</div>))}
							</div>
						</div>)}

						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
							<div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
								Showing {filteredStores.length} of {stores.length} stores
							</div>
							<label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
								<input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)}/>
								Favorites only
							</label>
						</div>
						<div className="app-feature-grid" aria-label="Store cards" style={{ marginTop: 0, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))" }}>
							{filteredStores.map((store, i) => (<Link key={store.id} to={`/mall/stores/${store.id}`} className={`app-feature-card animate-fade-in-up stagger-${Math.min(i + 1, 6)} card-hover group relative overflow-hidden`} style={{ textDecoration: "none", color: "inherit" }}>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
									<div className="relative z-10" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.25rem" }}>
										<div className="app-feature-label font-bold text-primary">{store.category}</div>
										<div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
											<button
												type="button"
												onClick={(event) => {
													event.preventDefault();
													event.stopPropagation();
													toggleFavorite(store.id);
												}}
												className="btn btn-ghost btn-sm rounded-full w-8 h-8 p-0 flex items-center justify-center hover:bg-red-100 hover:text-red-500 hover:border-red-200 transition-colors"
												style={{ lineHeight: 1 }}
											>
												{favoriteStoreIds.includes(store.id) ? "♥" : "♡"}
											</button>
											<span className={`status-badge ${store.status}`}>
												<span className="dot"/>
												{store.status}
											</span>
										</div>
									</div>
									<div className="app-feature-title relative z-10" style={{ marginBottom: "0.35rem" }}>{store.name}</div>
									<div className="relative z-10"><StarRating rating={store.average_rating}/></div>
									<div className="relative z-10" style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.78rem" }}>
										<div>
											<div style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Footfall</div>
											<div style={{ fontWeight: 700, fontSize: "1rem" }}>{store.current_footfall}</div>
										</div>
										<div style={{ flex: 1 }}>
											<div style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Occupancy</div>
											<OccupancyBar percent={store.current_occupancy_percent}/>
										</div>
									</div>
								</Link>))}
						</div>
						{!filteredStores.length && (<div className="empty-state">
								<div className="empty-state-icon">🔍</div>
								<h3>No stores found</h3>
								<p>Try adjusting your search or filter criteria to find what you&apos;re looking for.</p>
							</div>)}
					</>)}
			</div>
		</div>);
};
