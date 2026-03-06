import React, { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api/analytics";

interface MallOverview {
	total_revenue: number;
	total_visitors: number;
	total_stores: number;
	active_offers: number;
	avg_occupancy_rate: number;
	top_stores: { name: string; revenue: number }[];
}

export const AnalyticsPage: React.FC = () => {
	const [data, setData] = useState<MallOverview | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		analyticsApi.mallOverview().then((res) => {
			setData(res.data);
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);

	if (loading) return <div className="loading-spinner" />;
	if (!data) return <p>No analytics data available</p>;

	const maxRev = Math.max(...data.top_stores.map((s) => s.revenue), 1);

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Mall Analytics</h1>
				<p className="hero-subtitle">Comprehensive overview of mall performance and metrics</p>
			</div>

			<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
				<div className="metric-card">
					<span className="metric-icon">💰</span>
					<span className="metric-label">Total Revenue</span>
					<span className="metric-value" style={{ color: "var(--color-accent-strong)" }}>${data.total_revenue.toLocaleString()}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">👥</span>
					<span className="metric-label">Total Visitors</span>
					<span className="metric-value">{data.total_visitors.toLocaleString()}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🏪</span>
					<span className="metric-label">Total Stores</span>
					<span className="metric-value">{data.total_stores}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🏷️</span>
					<span className="metric-label">Active Offers</span>
					<span className="metric-value">{data.active_offers}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">📈</span>
					<span className="metric-label">Occupancy Rate</span>
					<span className="metric-value">{data.avg_occupancy_rate}%</span>
				</div>
			</div>

			<div className="section-card" style={{ marginTop: "2rem" }}>
				<h2 className="section-title">Top Performing Stores</h2>
				{data.top_stores.map((store, i) => (
					<div key={store.name} style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
						<span style={{ width: "24px", fontWeight: 700, color: i < 3 ? "var(--color-accent-strong)" : "var(--color-text-muted)" }}>#{i + 1}</span>
						<span style={{ width: "150px", fontSize: "0.9rem" }}>{store.name}</span>
						<div className="zone-bar" style={{ flex: 1, height: "10px" }}>
							<div className="zone-bar-fill" style={{ width: `${(store.revenue / maxRev) * 100}%` }} />
						</div>
						<span style={{ width: "80px", textAlign: "right", fontSize: "0.85rem", fontWeight: 600 }}>${store.revenue.toLocaleString()}</span>
					</div>
				))}
			</div>
		</div>
	);
};
