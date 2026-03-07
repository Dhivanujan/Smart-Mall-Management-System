import React, { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api/analytics";

interface CustomerInsightsData {
	total_unique_customers: number;
	customer_segments: { segment: string; count: number; avg_spend: number }[];
	shopping_patterns: { hour: number; avg_customers: number }[];
	repeat_customer_rate: number;
	offer_conversion_rate: number;
}

export const CustomerInsightsPage: React.FC = () => {
	const [data, setData] = useState<CustomerInsightsData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		analyticsApi.storeCustomers().then((res) => {
			setData(res.data);
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);

	if (loading) return <div className="loading-spinner" />;
	if (!data) return <p>No data available</p>;

	const segColors = ["#3498db", "#e74c3c", "#27ae60", "#f39c12", "#9b59b6", "#1abc9c"];
	const maxVisits = Math.max(...data.shopping_patterns.map((v) => v.avg_customers), 1);

	return (
		<div className="panel-page">
			<div className="page-header">
				<h1 className="hero-heading">Customer Insights</h1>
				<p className="hero-subtitle">Understand your customers with segmentation and behavior analytics</p>
			</div>

			<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "2rem" }}>
				<div className="metric-card">
					<span className="metric-icon">👥</span>
					<span className="metric-label">Total Customers</span>
					<span className="metric-value">{data.total_unique_customers.toLocaleString()}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">📊</span>
					<span className="metric-label">Segments</span>
					<span className="metric-value">{data.customer_segments.length}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🔄</span>
					<span className="metric-label">Repeat Rate</span>
					<span className="metric-value" style={{ fontSize: "1rem" }}>{data.repeat_customer_rate}%</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🎯</span>
					<span className="metric-label">Offer Conversion</span>
					<span className="metric-value" style={{ fontSize: "1rem" }}>{data.offer_conversion_rate}%</span>
				</div>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
				<div className="section-card">
					<h2 className="section-title">Customer Segments</h2>
					<div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", height: "20px", borderRadius: "10px", overflow: "hidden" }}>
						{data.customer_segments.map((seg, i) => (
							<div key={seg.segment} style={{
								flex: seg.count,
								background: segColors[i % segColors.length],
								minWidth: "2px",
							}} title={`${seg.segment}: ${seg.count}`} />
						))}
					</div>
					{data.customer_segments.map((seg, i) => (
						<div key={seg.segment} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
							<span style={{ width: 14, height: 14, borderRadius: "3px", background: segColors[i % segColors.length], flexShrink: 0 }} />
							<span style={{ flex: 1, fontSize: "0.9rem" }}>{seg.segment}</span>
							<span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{seg.count}</span>
							<span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", width: "80px", textAlign: "right" }}>${seg.avg_spend}</span>
						</div>
					))}
				</div>

				<div className="section-card">
					<h2 className="section-title">Weekly Visit Patterns</h2>
					<div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "200px" }}>
						{data.shopping_patterns.map((vp) => (
							<div key={vp.hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
								<span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{vp.avg_customers}</span>
								<div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
									<div style={{
										width: "100%",
										height: `${(vp.avg_customers / maxVisits) * 100}%`,
										background: "linear-gradient(180deg, var(--color-accent-strong), var(--color-accent))",
										borderRadius: "4px 4px 0 0",
										minHeight: "4px",
									}} />
								</div>
								<span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{vp.hour}:00</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
