import React, { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api/analytics";
import type { QueueEfficiencyData } from "@/types";

export const QueueEfficiencyPage: React.FC = () => {
	const [data, setData] = useState<QueueEfficiencyData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		analyticsApi.mallQueueEfficiency().then((res) => {
			setData(res.data.stores ?? res.data);
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);

	if (loading) return <div className="loading-spinner" />;
	if (!data.length) return <p>No queue efficiency data available</p>;

	const effColor = (rate: number) => {
		if (rate >= 90) return "var(--color-success)";
		if (rate >= 70) return "#f39c12";
		return "var(--color-danger)";
	};

	const avgServiceTime = data.length > 0 ? (data.reduce((a, s) => a + s.avg_service_time_min, 0) / data.length).toFixed(1) : "0";
	const avgEfficiency = data.length > 0 ? (data.reduce((a, s) => a + s.efficiency_score, 0) / data.length).toFixed(1) : "0";
	const avgAbandonment = data.length > 0 ? (data.reduce((a, s) => a + s.abandonment_rate_percent, 0) / data.length).toFixed(1) : "0";

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Queue Efficiency</h1>
				<p className="hero-subtitle">AI-powered queue performance analysis across all stores</p>
			</div>

			<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "2rem" }}>
				<div className="metric-card">
					<span className="metric-icon">⏱️</span>
					<span className="metric-label">Avg Service Time</span>
					<span className="metric-value">{avgServiceTime}m</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">📊</span>
					<span className="metric-label">Avg Efficiency</span>
					<span className="metric-value" style={{ color: effColor(parseFloat(avgEfficiency)) }}>{avgEfficiency}%</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🚪</span>
					<span className="metric-label">Avg Abandonment</span>
					<span className="metric-value" style={{ color: parseFloat(avgAbandonment) > 15 ? "var(--color-danger)" : "var(--color-success)" }}>
						{avgAbandonment}%
					</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🏪</span>
					<span className="metric-label">Stores Monitored</span>
					<span className="metric-value">{data.length}</span>
				</div>
			</div>

			{data.length > 0 && (
				<div className="section-card">
					<h2 className="section-title">Store-by-Store Breakdown</h2>
					<div className="data-table-wrapper">
						<table className="data-table">
							<thead>
								<tr>
									<th>Store</th>
									<th>Queue Length</th>
									<th>Avg Service Time</th>
									<th>Predicted Wait</th>
									<th>Abandonment</th>
									<th>Efficiency</th>
								</tr>
							</thead>
							<tbody>
								{data.map((store) => (
									<tr key={store.store_id}>
										<td style={{ fontWeight: 600 }}>{store.name}</td>
										<td>{store.queue_length}</td>
										<td>{store.avg_service_time_min}m</td>
										<td>{store.predicted_wait_min}m</td>
										<td style={{ color: store.abandonment_rate_percent > 15 ? "var(--color-danger)" : "var(--color-success)" }}>
											{store.abandonment_rate_percent}%
										</td>
										<td>
											<div className="zone-bar" style={{ height: "8px", width: "80px", display: "inline-block" }}>
												<div className="zone-bar-fill" style={{ width: `${store.efficiency_score}%`, background: effColor(store.efficiency_score) }} />
											</div>
											<span style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}>{store.efficiency_score}%</span>
										</td>
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
