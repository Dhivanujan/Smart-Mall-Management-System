import React, { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api/analytics";

interface ParkingData {
	summary: {
		total_slots: number;
		available: number;
		occupied: number;
		reserved: number;
		utilization: number;
		is_peak_hour: boolean;
	};
	zone_stats: { zone: string; total: number; available: number; occupied: number; reserved: number; utilization: number }[];
	demand_predictions: { hour: number; predicted_demand: number }[];
}

export const ParkingManagementPage: React.FC = () => {
	const [data, setData] = useState<ParkingData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		analyticsApi.mallParking().then((res) => {
			setData(res.data);
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);

	if (loading) return <div className="loading-spinner" />;
	if (!data) return <p>No parking data available</p>;

	const { summary } = data;
	const maxDemand = Math.max(...(data.demand_predictions ?? []).map((d) => d.predicted_demand), 1);

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Parking Management</h1>
				<p className="hero-subtitle">Monitor parking utilization with AI demand predictions</p>
			</div>

			<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
				<div className="metric-card">
					<span className="metric-icon">🅿️</span>
					<span className="metric-label">Total Slots</span>
					<span className="metric-value">{summary.total_slots}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">✅</span>
					<span className="metric-label">Available</span>
					<span className="metric-value" style={{ color: "var(--color-success)" }}>{summary.available}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🚗</span>
					<span className="metric-label">Occupied</span>
					<span className="metric-value">{summary.occupied}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">📋</span>
					<span className="metric-label">Reserved</span>
					<span className="metric-value" style={{ color: "#f39c12" }}>{summary.reserved}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">📊</span>
					<span className="metric-label">Utilization</span>
					<span className="metric-value" style={{ color: summary.utilization > 85 ? "var(--color-danger)" : "var(--color-success)" }}>
						{summary.utilization}%
					</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">{summary.is_peak_hour ? "🔴" : "🟢"}</span>
					<span className="metric-label">Peak Hour</span>
					<span className="metric-value" style={{ color: summary.is_peak_hour ? "var(--color-danger)" : "var(--color-success)" }}>
						{summary.is_peak_hour ? "Yes" : "No"}
					</span>
				</div>
			</div>

			<div className="section-card" style={{ marginTop: "2rem" }}>
				<h2 className="section-title">Zone Utilization</h2>
				<div className="data-table-wrapper">
					<table className="data-table">
						<thead>
							<tr>
								<th>Zone</th>
								<th>Total</th>
								<th>Available</th>
								<th>Occupied</th>
								<th>Reserved</th>
								<th>Utilization</th>
							</tr>
						</thead>
						<tbody>
							{data.zone_stats.map((z) => (
								<tr key={z.zone}>
									<td style={{ fontWeight: 700, fontSize: "1.1rem" }}>{z.zone}</td>
									<td>{z.total}</td>
									<td style={{ color: "var(--color-success)" }}>{z.available}</td>
									<td>{z.occupied}</td>
									<td style={{ color: "#f39c12" }}>{z.reserved}</td>
									<td>
										<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
											<div className="zone-bar" style={{ flex: 1, height: "10px" }}>
												<div className="zone-bar-fill" style={{
													width: `${z.utilization}%`,
													background: z.utilization > 85 ? "var(--color-danger)" : z.utilization > 60 ? "#f39c12" : "var(--color-success)",
												}} />
											</div>
											<span style={{ fontSize: "0.85rem", fontWeight: 600, width: "40px" }}>{z.utilization}%</span>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{data.demand_predictions && data.demand_predictions.length > 0 && (
				<div className="section-card" style={{ marginTop: "1.5rem" }}>
					<h2 className="section-title">AI Demand Predictions (Next 24 Hours)</h2>
					<div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "180px", paddingTop: "1rem" }}>
						{data.demand_predictions.map((d) => (
							<div key={d.hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
								<span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>{d.predicted_demand}%</span>
								<div style={{
									width: "100%",
									height: `${(d.predicted_demand / maxDemand) * 140}px`,
									background: d.predicted_demand > 80 ? "var(--color-danger)" : d.predicted_demand > 60 ? "#f39c12" : "var(--color-success)",
									borderRadius: "3px 3px 0 0",
									minHeight: "2px",
								}} />
								<span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>{d.hour}h</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
