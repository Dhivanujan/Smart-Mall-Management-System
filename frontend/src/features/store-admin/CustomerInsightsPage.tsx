import React, { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api/analytics";

interface CustomerInsightsData {
	total_customers: number;
	segments: { name: string; count: number; percentage: number }[];
	visit_patterns: { day: string; avg_visits: number }[];
	top_repeat_customers: { name: string; visits: number; total_spent: number }[];
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
	const maxVisits = Math.max(...data.visit_patterns.map((v) => v.avg_visits), 1);

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Customer Insights</h1>
				<p className="hero-subtitle">Understand your customers with segmentation and behavior analytics</p>
			</div>

			<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "2rem" }}>
				<div className="metric-card">
					<span className="metric-icon">👥</span>
					<span className="metric-label">Total Customers</span>
					<span className="metric-value">{data.total_customers.toLocaleString()}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">📊</span>
					<span className="metric-label">Segments</span>
					<span className="metric-value">{data.segments.length}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🔄</span>
					<span className="metric-label">Top Spender</span>
					<span className="metric-value" style={{ fontSize: "1rem" }}>
						{data.top_repeat_customers?.[0]?.name ?? "—"}
					</span>
				</div>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
				<div className="section-card">
					<h2 className="section-title">Customer Segments</h2>
					<div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", height: "20px", borderRadius: "10px", overflow: "hidden" }}>
						{data.segments.map((seg, i) => (
							<div key={seg.name} style={{
								flex: seg.percentage,
								background: segColors[i % segColors.length],
								minWidth: "2px",
							}} title={`${seg.name}: ${seg.percentage}%`} />
						))}
					</div>
					{data.segments.map((seg, i) => (
						<div key={seg.name} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
							<span style={{ width: 14, height: 14, borderRadius: "3px", background: segColors[i % segColors.length], flexShrink: 0 }} />
							<span style={{ flex: 1, fontSize: "0.9rem" }}>{seg.name}</span>
							<span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{seg.count}</span>
							<span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", width: "40px", textAlign: "right" }}>{seg.percentage}%</span>
						</div>
					))}
				</div>

				<div className="section-card">
					<h2 className="section-title">Weekly Visit Patterns</h2>
					<div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "200px" }}>
						{data.visit_patterns.map((vp) => (
							<div key={vp.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
								<span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{vp.avg_visits}</span>
								<div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
									<div style={{
										width: "100%",
										height: `${(vp.avg_visits / maxVisits) * 100}%`,
										background: "linear-gradient(180deg, var(--color-accent-strong), var(--color-accent-strong-hover))",
										borderRadius: "4px 4px 0 0",
										minHeight: "4px",
									}} />
								</div>
								<span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{vp.day}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{data.top_repeat_customers && data.top_repeat_customers.length > 0 && (
				<div className="section-card" style={{ marginTop: "1.5rem" }}>
					<h2 className="section-title">Top Repeat Customers</h2>
					<div className="data-table-wrapper">
						<table className="data-table">
							<thead>
								<tr>
									<th>Rank</th>
									<th>Name</th>
									<th>Visits</th>
									<th>Total Spent</th>
								</tr>
							</thead>
							<tbody>
								{data.top_repeat_customers.map((c, i) => (
									<tr key={c.name}>
										<td style={{ fontWeight: 700, color: i < 3 ? "var(--color-accent-strong)" : undefined }}>#{i + 1}</td>
										<td>{c.name}</td>
										<td>{c.visits}</td>
										<td>${c.total_spent.toLocaleString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
};
