import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/services/api/client";
import { useAuth } from "@/app/providers/AuthProvider";
import type { StoreSummary } from "@/types";

const ACTIONS = [
	{ to: "/mall", icon: "🏪", label: "Browse Stores", color: "purple" },
	{ to: "/queue", icon: "🎫", label: "Join Queue", color: "blue" },
	{ to: "/parking", icon: "🅿️", label: "Parking", color: "green" },
	{ to: "/loyalty", icon: "⭐", label: "Loyalty", color: "amber" },
] as const;

const QUICK_LINKS = [
	{ to: "/offers", icon: "🏷️", label: "Active Offers", color: "pink" },
	{ to: "/mall/map", icon: "🗺️", label: "Mall Map", color: "cyan" },
	{ to: "/notifications", icon: "🔔", label: "Notifications", color: "indigo" },
	{ to: "/complaints", icon: "📋", label: "Complaints", color: "red" },
] as const;

export const CustomerDashboardPage: React.FC = () => {
	const { user } = useAuth();
	const [stores, setStores] = useState<StoreSummary[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		apiClient.get("/api/v1/stores/").then((res) => {
			setStores(res.data.stores);
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);

	const openStores = stores.filter((s) => s.status === "open");

	return (
		<div className="customer-page">
			<div className="welcome-section">
				<h1 className="welcome-greeting">
					Welcome back, <span className="name">{user?.full_name ?? "Customer"}</span>
				</h1>
				<p className="welcome-subtitle">Your smart mall companion — explore stores, manage queues, and earn rewards.</p>
			</div>

			<div className="action-grid">
				{ACTIONS.map((a, i) => (
					<Link key={a.to} to={a.to} className={`action-card ${a.color} animate-fade-in-up stagger-${i + 1}`}>
						<span className={`action-card-icon`}>{a.icon}</span>
						<span className="action-card-text">
							<span className="action-card-label">{a.label}</span>
							<span className="action-card-value">
								{a.to === "/mall" ? `${openStores.length} Open` : "Open →"}
							</span>
						</span>
					</Link>
				))}
			</div>

			<div className="panel animate-fade-in-up stagger-5">
				<h2 className="panel-title">⚡ Quick Access</h2>
				<div className="action-grid" style={{ marginBottom: 0 }}>
					{QUICK_LINKS.map((l) => (
						<Link key={l.to} to={l.to} className={`action-card ${l.color}`}>
							<span className="action-card-icon">{l.icon}</span>
							<span className="action-card-text">
								<span className="action-card-value" style={{ fontSize: "0.95rem" }}>{l.label}</span>
							</span>
						</Link>
					))}
				</div>
			</div>

			{!loading && openStores.length > 0 && (
				<div className="panel animate-fade-in-up stagger-6" style={{ marginTop: "0.25rem" }}>
					<div className="panel-header">
						<h2 className="panel-title">🔥 Popular Stores</h2>
						<Link to="/mall" className="btn btn-ghost btn-sm">View all</Link>
					</div>
					<div className="store-grid">
						{openStores.slice(0, 4).map((store) => (
							<Link key={store.id} to={`/mall/stores/${store.id}`} className="store-card" style={{ textDecoration: "none" }}>
								<div className="store-card-header">
									<h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{store.name}</h3>
									<span className={`status-badge ${store.status}`}>
										<span className="dot" />
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
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
