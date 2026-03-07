import React, { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api/analytics";
import type { HeatmapZone } from "@/types";

interface CrowdData {
	heatmap: HeatmapZone[];
	congestion_alerts: { zone: string; level: string; message: string }[];
	mall_total_visitors: number;
}

export const CrowdTrafficPage: React.FC = () => {
	const [data, setData] = useState<CrowdData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		analyticsApi.mallCrowd().then((res) => {
			setData(res.data);
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);

	if (loading) return <div className="loading-spinner" />;
	if (!data) return <p>No crowd data available</p>;

	const densityColor = (density: number) => {
		if (density > 80) return "#e74c3c";
		if (density > 60) return "#f39c12";
		if (density > 40) return "#f1c40f";
		if (density > 20) return "#27ae60";
		return "#2ecc71";
	};

	const densityLabel = (density: number) => {
		if (density > 80) return "Critical";
		if (density > 60) return "High";
		if (density > 40) return "Moderate";
		if (density > 20) return "Normal";
		return "Low";
	};

	return (
		<div className="panel-page">
			<div className="page-header">
				<h1 className="hero-heading">Crowd & Traffic</h1>
				<p className="hero-subtitle">Real-time crowd density heatmap and congestion monitoring</p>
			</div>

			<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "2rem" }}>
				<div className="metric-card">
					<span className="metric-icon">👥</span>
					<span className="metric-label">Current Visitors</span>
					<span className="metric-value" style={{ color: "var(--color-accent-strong)" }}>{data.mall_total_visitors.toLocaleString()}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">📍</span>
					<span className="metric-label">Zones Monitored</span>
					<span className="metric-value">{data.heatmap.length}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">⚠️</span>
					<span className="metric-label">Congestion Alerts</span>
					<span className="metric-value" style={{ color: data.congestion_alerts.length > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
						{data.congestion_alerts.length}
					</span>
				</div>
			</div>

			{data.congestion_alerts.length > 0 && (
				<div className="section-card" style={{ marginBottom: "1.5rem", border: "1px solid var(--color-danger)" }}>
					<h2 className="section-title" style={{ color: "var(--color-danger)" }}>Congestion Alerts</h2>
					{data.congestion_alerts.map((alert, i) => (
						<div key={i} className="alert-item" style={{
							background: alert.level === "critical" ? "rgba(231,76,60,0.1)" : "rgba(243,156,18,0.1)",
							borderLeft: `3px solid ${alert.level === "critical" ? "#e74c3c" : "#f39c12"}`,
							padding: "0.75rem",
							borderRadius: "4px",
							marginBottom: "0.5rem",
						}}>
							<strong>{alert.zone}</strong> — {alert.message}
						</div>
					))}
				</div>
			)}

			<div className="section-card">
				<h2 className="section-title">Crowd Density Heatmap</h2>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem", padding: "1rem 0" }}>
					{data.heatmap.map((zone) => (
						<div key={zone.id} style={{
							background: `${densityColor(zone.density)}22`,
							border: `2px solid ${densityColor(zone.density)}`,
							borderRadius: "12px",
							padding: "1rem",
							textAlign: "center",
							transition: "transform 0.2s",
						}}>
							<div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>{zone.name}</div>
							<div style={{
								fontSize: "2rem",
								fontWeight: 700,
								color: densityColor(zone.density),
								lineHeight: 1,
							}}>
								{zone.density}%
							</div>
							<div style={{
								fontSize: "0.75rem",
								marginTop: "0.5rem",
								padding: "0.2rem 0.5rem",
								borderRadius: "10px",
								background: densityColor(zone.density),
								color: "#fff",
								fontWeight: 600,
								display: "inline-block",
							}}>
								{densityLabel(zone.density)}
							</div>
							<div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
								{zone.visitor_count} visitors
							</div>
						</div>
					))}
				</div>

				<div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem", flexWrap: "wrap" }}>
					{[
						{ label: "Low", color: "#2ecc71" },
						{ label: "Normal", color: "#27ae60" },
						{ label: "Moderate", color: "#f1c40f" },
						{ label: "High", color: "#f39c12" },
						{ label: "Critical", color: "#e74c3c" },
					].map((l) => (
						<span key={l.label} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }}>
							<span style={{ width: 12, height: 12, borderRadius: "3px", background: l.color }} />
							{l.label}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};
