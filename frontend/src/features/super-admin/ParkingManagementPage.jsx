import React, { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api/analytics";
export const ParkingManagementPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        analyticsApi.mallParking().then((res) => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);
    if (loading)
        return <div className="loading-spinner"/>;
    if (!data)
        return <p>No parking data available</p>;
    const maxDemand = Math.max(...(data.hourly_predictions ?? []).map((d) => d.predicted_occupancy), 1);
    const zoneRows = Object.entries(data.zone_utilization).map(([zone, utilization]) => ({
        zone,
        utilization,
    }));
    return (<div className="panel-page">
			<div className="page-header">
				<h1 className="hero-heading">Parking Management</h1>
				<p className="hero-subtitle">Monitor parking utilization with AI demand predictions</p>
			</div>

			<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
				<div className="metric-card">
					<span className="metric-icon">📊</span>
					<span className="metric-label">Current Utilization</span>
					<span className="metric-value" style={{ color: data.current_utilization > 85 ? "var(--color-danger)" : "var(--color-success)" }}>{data.current_utilization}%</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">⏱️</span>
					<span className="metric-label">Avg Parking Duration</span>
					<span className="metric-value">{data.avg_duration_minutes}m</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🔺</span>
					<span className="metric-label">Peak Hour</span>
					<span className="metric-value">{data.peak_time.hour}:00</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">🔥</span>
					<span className="metric-label">Peak Occupancy</span>
					<span className="metric-value" style={{ color: data.peak_time.predicted_occupancy > 85 ? "var(--color-danger)" : "var(--color-warning)" }}>{data.peak_time.predicted_occupancy}%</span>
				</div>
			</div>

			<div className="section-card" style={{ marginTop: "2rem" }}>
				<h2 className="section-title">Zone Utilization</h2>
				<div className="data-table-wrapper">
					<table className="data-table">
						<thead>
							<tr>
								<th>Zone</th>
								<th>Utilization</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{zoneRows.map((z) => (<tr key={z.zone}>
									<td style={{ fontWeight: 700, fontSize: "1.1rem" }}>{z.zone}</td>
									<td>
										<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
											<div className="zone-bar" style={{ flex: 1, height: "10px" }}>
												<div className="zone-bar-fill" style={{
                width: `${z.utilization}%`,
                background: z.utilization > 85 ? "var(--color-danger)" : z.utilization > 60 ? "#f39c12" : "var(--color-success)",
            }}/>
											</div>
											<span style={{ fontSize: "0.85rem", fontWeight: 600, width: "40px" }}>{z.utilization}%</span>
										</div>
									</td>
									<td>
										<span className={`status-badge ${z.utilization > 85 ? "pending" : z.utilization > 60 ? "active" : "closed"}`}>
											{z.utilization > 85 ? "High" : z.utilization > 60 ? "Moderate" : "Normal"}
										</span>
									</td>
								</tr>))}
						</tbody>
					</table>
				</div>
			</div>

			{data.hourly_predictions && data.hourly_predictions.length > 0 && (<div className="section-card" style={{ marginTop: "1.5rem" }}>
					<h2 className="section-title">AI Demand Predictions (Next 24 Hours)</h2>
					<div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "180px", paddingTop: "1rem" }}>
						{data.hourly_predictions.map((d) => (<div key={d.hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
								<span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>{d.predicted_occupancy}%</span>
								<div style={{
                    width: "100%",
                    height: `${(d.predicted_occupancy / maxDemand) * 140}px`,
                    background: d.predicted_occupancy > 80 ? "var(--color-danger)" : d.predicted_occupancy > 60 ? "#f39c12" : "var(--color-success)",
                    borderRadius: "3px 3px 0 0",
                    minHeight: "2px",
                }}/>
								<span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>{d.hour}h</span>
							</div>))}
					</div>
				</div>)}
		</div>);
};
