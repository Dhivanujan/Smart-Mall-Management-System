import React, { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api/analytics";
export const AnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        analyticsApi.mallOverview().then((res) => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);
    if (loading)
        return <div className="loading-spinner"/>;
    if (!data)
        return <p>No analytics data available</p>;
    const maxRev = Math.max(...data.category_revenue.map((s) => s.revenue), 1);
    return (<div className="panel-page">
			<div className="page-header">
				<h1 className="hero-heading">Mall Analytics</h1>
				<p className="hero-subtitle">Comprehensive overview of mall performance and metrics</p>
			</div>

			<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))" }}>
				<div className="metric-card">
					<span className="metric-icon">💰</span>
					<span className="metric-label">Total Revenue</span>
					<span className="metric-value" style={{ color: "var(--color-accent-strong)" }}>${data.total_revenue.toLocaleString()}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">👥</span>
					<span className="metric-label">Total Visitors</span>
					<span className="metric-value">{data.daily_visitors.toLocaleString()}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🏪</span>
					<span className="metric-label">Active Stores</span>
					<span className="metric-value">{data.active_stores}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🔢</span>
					<span className="metric-label">Active Queues</span>
					<span className="metric-value">{data.active_queues}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">📈</span>
					<span className="metric-label">Parking Utilization</span>
					<span className="metric-value">{data.parking_utilization}%</span>
				</div>
			</div>

			<div className="section-card" style={{ marginTop: "2rem" }}>
				<h2 className="section-title">Revenue By Category</h2>
				{data.category_revenue.map((store, i) => (<div key={store.category} style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
						<span style={{ width: "24px", fontWeight: 700, color: i < 3 ? "var(--color-accent-strong)" : "var(--color-text-muted)" }}>#{i + 1}</span>
						<span style={{ width: "150px", fontSize: "0.9rem" }}>{store.category}</span>
						<div className="zone-bar" style={{ flex: 1, height: "10px" }}>
							<div className="zone-bar-fill" style={{ width: `${(store.revenue / maxRev) * 100}%` }}/>
						</div>
						<span style={{ width: "80px", textAlign: "right", fontSize: "0.85rem", fontWeight: 600 }}>${store.revenue.toLocaleString()}</span>
					</div>))}
			</div>
		</div>);
};
