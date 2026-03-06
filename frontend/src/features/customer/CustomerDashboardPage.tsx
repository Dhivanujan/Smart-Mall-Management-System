import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/services/api/client";
import { useAuth } from "@/app/providers/AuthProvider";
import type { StoreSummary } from "@/types";

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
	const totalFootfall = stores.reduce((sum, s) => sum + s.current_footfall, 0);

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Welcome, {user?.full_name ?? "Customer"}</h1>
				<p className="hero-subtitle">Your smart mall companion</p>
			</div>

			<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
				<Link to="/mall" className="metric-card" style={{ textDecoration: "none" }}>
					<span className="metric-icon">🏪</span>
					<span className="metric-label">Browse Stores</span>
					<span className="metric-value">{openStores.length} Open</span>
				</Link>
				<Link to="/queue" className="metric-card" style={{ textDecoration: "none" }}>
					<span className="metric-icon">🎫</span>
					<span className="metric-label">Queue</span>
					<span className="metric-value">Join Now</span>
				</Link>
				<Link to="/parking" className="metric-card" style={{ textDecoration: "none" }}>
					<span className="metric-icon">🅿️</span>
					<span className="metric-label">Parking</span>
					<span className="metric-value">View Slots</span>
				</Link>
				<Link to="/loyalty" className="metric-card" style={{ textDecoration: "none" }}>
					<span className="metric-icon">⭐</span>
					<span className="metric-label">Loyalty</span>
					<span className="metric-value">View Points</span>
				</Link>
			</div>

			<div className="section-card" style={{ marginTop: "2rem" }}>
				<h2 className="section-title">Quick Links</h2>
				<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
					<Link to="/offers" className="metric-card" style={{ textDecoration: "none" }}>
						<span className="metric-icon">🏷️</span>
						<span className="metric-label">Active Offers</span>
					</Link>
					<Link to="/mall/map" className="metric-card" style={{ textDecoration: "none" }}>
						<span className="metric-icon">🗺️</span>
						<span className="metric-label">Mall Map</span>
					</Link>
					<Link to="/notifications" className="metric-card" style={{ textDecoration: "none" }}>
						<span className="metric-icon">🔔</span>
						<span className="metric-label">Notifications</span>
					</Link>
					<Link to="/complaints" className="metric-card" style={{ textDecoration: "none" }}>
						<span className="metric-icon">📋</span>
						<span className="metric-label">Complaints</span>
					</Link>
				</div>
			</div>

			{!loading && (
				<div className="section-card" style={{ marginTop: "2rem" }}>
					<h2 className="section-title">Popular Stores</h2>
					<div className="store-grid">
						{openStores.slice(0, 4).map((store) => (
							<Link key={store.id} to={`/mall/stores/${store.id}`} className="store-card" style={{ textDecoration: "none" }}>
								<div className="store-card-header">
									<h3>{store.name}</h3>
									<span className={`status-badge status-${store.status}`}>{store.status}</span>
								</div>
								<span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{store.category}</span>
								<div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.85rem" }}>
									<span>⭐ {store.average_rating}</span>
									<span>👥 {store.current_footfall}</span>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
