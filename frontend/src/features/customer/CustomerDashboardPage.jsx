import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/services/api/client";
import { useAuth } from "@/app/providers/AuthProvider";
import { favoritesApi } from "@/services/api/favorites";
import { discoveryApi } from "@/services/api/discovery";
const ACTIONS = [
    { to: "/mall", icon: "🏪", label: "Browse Stores", color: "purple" },
    { to: "/queue", icon: "🎫", label: "Join Queue", color: "blue" },
    { to: "/parking", icon: "🅿️", label: "Parking", color: "green" },
    { to: "/loyalty", icon: "⭐", label: "Loyalty", color: "amber" },
];
const QUICK_LINKS = [
    { to: "/offers", icon: "🏷️", label: "Active Offers", color: "pink" },
    { to: "/events", icon: "📅", label: "Events", color: "emerald" },
    { to: "/movies", icon: "🍿", label: "Cinema", color: "purple" },
	{ to: "/ai-concierge", icon: "🤖", label: "AI Concierge", color: "indigo" },
    { to: "/map", icon: "🗺️", label: "Mall Map", color: "cyan" },
    { to: "/services", icon: "ℹ️", label: "Services", color: "blue" },
    { to: "/lost-found", icon: "🔍", label: "Lost & Found", color: "orange" },
    { to: "/notifications", icon: "🔔", label: "Notifications", color: "indigo" },
    { to: "/complaints", icon: "📋", label: "Complaints", color: "red" },
];
export const CustomerDashboardPage = () => {
    const { user } = useAuth();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
	const [favoriteStores, setFavoriteStores] = useState([]);
	const [trendingStores, setTrendingStores] = useState([]);
    useEffect(() => {
		Promise.all([
			apiClient.get("/api/v1/stores/"),
			favoritesApi.list(),
			discoveryApi.trendingStores(3),
		]).then(([storesRes, favoritesRes, trendingRes]) => {
			setStores(storesRes.data.stores);
			setFavoriteStores(favoritesRes.data.stores ?? []);
			setTrendingStores(trendingRes.data.stores ?? []);
			setLoading(false);
		}).catch(() => setLoading(false));
    }, []);
    const openStores = stores.filter((s) => s.status === "open");
    return (<div className="customer-page">
			<div className="welcome-section">
				<h1 className="welcome-greeting">
					Welcome back, <span className="name">{user?.full_name ?? "Customer"}</span>
				</h1>
				<p className="welcome-subtitle">Your smart mall companion — explore stores, manage queues, and earn rewards.</p>
			</div>

			<div className="action-grid">
				{ACTIONS.map((a, i) => (<Link key={a.to} to={a.to} className={`action-card ${a.color} animate-fade-in-up stagger-${i + 1}`}>
						<span className={`action-card-icon`}>{a.icon}</span>
						<span className="action-card-text">
							<span className="action-card-label">{a.label}</span>
							<span className="action-card-value">
								{a.to === "/mall" ? `${openStores.length} Open` : "Open →"}
							</span>
						</span>
					</Link>))}
			</div>

			<div className="panel animate-fade-in-up stagger-5">
				<h2 className="panel-title">⚡ Quick Access</h2>
				<div className="action-grid" style={{ marginBottom: 0 }}>
					{QUICK_LINKS.map((l) => (<Link key={l.to} to={l.to} className={`action-card ${l.color}`}>
							<span className="action-card-icon">{l.icon}</span>
							<span className="action-card-text">
								<span className="action-card-value" style={{ fontSize: "0.95rem" }}>{l.label}</span>
							</span>
						</Link>))}
				</div>
			</div>

			{!loading && (<div className="panel animate-fade-in-up stagger-6" style={{ marginTop: "0.25rem" }}>
					<div className="panel-header">
						<h2 className="panel-title">🧠 For You</h2>
						<Link to="/ai-concierge" className="btn btn-ghost btn-sm">Open AI Concierge</Link>
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "0.8rem" }}>
						<div className="store-card">
							<div className="store-card-header"><h3 style={{ margin: 0, fontSize: "0.95rem" }}>Favorite Stores</h3></div>
							<div style={{ marginTop: "0.4rem" }}>
								{favoriteStores.length ? favoriteStores.slice(0, 3).map((store) => (<div key={store.id} style={{ fontSize: "0.85rem", marginBottom: "0.3rem", color: "var(--color-text-muted)" }}>♥ {store.name}</div>)) : (<div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>No favorites yet.</div>)}
							</div>
						</div>
						<div className="store-card">
							<div className="store-card-header"><h3 style={{ margin: 0, fontSize: "0.95rem" }}>Trending Stores</h3></div>
							<div style={{ marginTop: "0.4rem" }}>
								{trendingStores.length ? trendingStores.map((store) => (<div key={store.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}><span style={{ color: "var(--color-text-muted)" }}>{store.name}</span><span>👥 {store.current_footfall}</span></div>)) : (<div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>No trends right now.</div>)}
							</div>
						</div>
					</div>
				</div>)}

			{!loading && openStores.length > 0 && (<div className="panel animate-fade-in-up stagger-6" style={{ marginTop: "0.25rem" }}>
					<div className="panel-header">
						<h2 className="panel-title">🔥 Popular Stores</h2>
						<Link to="/mall" className="btn btn-ghost btn-sm">View all</Link>
					</div>
					<div className="store-grid">
						{openStores.slice(0, 4).map((store) => (<Link key={store.id} to={`/mall/stores/${store.id}`} className="store-card" style={{ textDecoration: "none" }}>
								<div className="store-card-header">
									<h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{store.name}</h3>
									<span className={`status-badge ${store.status}`}>
										<span className="dot"/>
										{store.status}
									</span>
								</div>
								<span style={{ color: "var(--color-text-dim)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
									{store.category}
								</span>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", fontSize: "0.85rem" }}>
									<span style={{ color: "#fbbf24" }}>★ {store.average_rating.toFixed(1)}</span>
									<span style={{ color: "var(--color-text-muted)" }}>👥 {store.current_footfall}</span>
								</div>
							</Link>))}
					</div>
				</div>)}
		</div>);
};
