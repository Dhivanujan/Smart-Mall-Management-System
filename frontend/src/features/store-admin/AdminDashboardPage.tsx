import React, { useEffect, useState } from "react";

import { useAuth } from "@/app/providers/AuthProvider";
import { apiClient } from "@/services/api/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import type {
	AdminMetricsResponse,
	StoreMetric,
	StoreMetricsResponse,
	MonitoringSnapshot,
	MonitoringResponse,
	StoreSummary,
	StoresResponse,
} from "@/types";

const severityColor = (s: string) => {
	switch (s.toLowerCase()) {
		case "critical":
			return "var(--color-danger)";
		case "warning":
			return "var(--color-warning)";
		default:
			return "var(--color-info)";
	}
};

export const AdminDashboardPage: React.FC = () => {
	const { user } = useAuth();
	const [metrics, setMetrics] = useState<AdminMetricsResponse["metrics"] | null>(null);
	const [stores, setStores] = useState<StoreSummary[]>([]);
	const [storeMetrics, setStoreMetrics] = useState<StoreMetric[]>([]);
	const [snapshot, setSnapshot] = useState<MonitoringSnapshot | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const [metricsRes, storesRes, storeMetricsRes, monitoringRes] = await Promise.all([
					apiClient.get<AdminMetricsResponse>("/api/v1/admin/dashboard"),
					apiClient.get<StoresResponse>("/api/v1/admin/stores"),
					apiClient.get<StoreMetricsResponse>("/api/v1/admin/store-metrics"),
					apiClient.get<MonitoringResponse>("/api/v1/admin/monitoring"),
				]);

				if (cancelled) return;

				setMetrics(metricsRes.data.metrics);
				setStores(storesRes.data.stores);
				setStoreMetrics(storeMetricsRes.data.stores);
				setSnapshot(monitoringRes.data.snapshot);
				setLastRefresh(new Date());
				setError(null);
			} catch (err) {
				if (cancelled) return;
				console.error(err);
				setError("Failed to load admin dashboard.");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		load();

		const interval = window.setInterval(load, 10000);

		return () => {
			cancelled = true;
			window.clearInterval(interval);
		};
	}, []);

	const zoneMax = snapshot
		? Math.max(...Object.values(snapshot.footfall.by_zone), 1)
		: 1;

	return (
		<DashboardLayout
			title="Admin Panel"
			navItems={ADMIN_NAV}
		>
			{/* Header */}
			<div className="flex-between" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
				<div>
					<h1 style={{ margin: 0, fontSize: "1.5rem" }}>Mall Admin Dashboard</h1>
					<p style={{ margin: "0.25rem 0 0", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
						Welcome back, <strong>{user?.full_name ?? user?.username}</strong>
					</p>
				</div>
				{lastRefresh && (
					<div className="refresh-indicator">
						<div className="live-dot" /> Live · updated {lastRefresh.toLocaleTimeString()}
					</div>
				)}
			</div>

			{/* Loading */}
			{loading && (
				<div style={{ marginTop: "2rem" }}>
					<div className="loading-spinner" style={{ margin: "0 auto" }} />
				</div>
			)}

			{/* Error */}
			{!loading && error && (
				<div className="error-banner" style={{ marginTop: "1.5rem" }}>
					<span className="error-icon">⚠️</span>
					<span>{error}</span>
				</div>
			)}

			{/* Metric cards */}
			{!loading && !error && metrics && (
				<div className="metrics-grid animate-fade-in-up" style={{ marginTop: "1.5rem" }}>
					<div className="metric-card">
						<div className="metric-icon blue">🏪</div>
						<div className="metric-body">
							<div className="metric-label">Total stores</div>
							<div className="metric-value">{metrics.total_stores}</div>
						</div>
					</div>
					<div className="metric-card">
						<div className="metric-icon green">👥</div>
						<div className="metric-body">
							<div className="metric-label">Active customers</div>
							<div className="metric-value">{metrics.active_customers.toLocaleString()}</div>
						</div>
					</div>
					<div className="metric-card">
						<div className="metric-icon amber">💰</div>
						<div className="metric-body">
							<div className="metric-label">Daily revenue</div>
							<div className="metric-value">${metrics.daily_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
						</div>
					</div>
					<div className="metric-card">
						<div className="metric-icon red">🎫</div>
						<div className="metric-body">
							<div className="metric-label">Open tickets</div>
							<div className="metric-value">{metrics.open_tickets}</div>
						</div>
					</div>
				</div>
			)}

			{/* Live operations + alerts side by side */}
			{!loading && !error && snapshot && (
				<div className="dashboard-grid animate-fade-in-up stagger-2" style={{ marginTop: "1.5rem" }}>
					{/* Footfall by zone */}
					<div className="section-card">
						<h2 style={{ margin: "0 0 0.25rem", fontSize: "1.05rem" }}>📍 Footfall by zone</h2>
						<p style={{ margin: "0 0 1rem", color: "var(--color-text-muted)", fontSize: "0.78rem" }}>
							Mall total: <strong>{snapshot.footfall.mall_total.toLocaleString()}</strong> visitors
						</p>
						{Object.entries(snapshot.footfall.by_zone).map(([zone, value]) => (
							<div className="zone-bar" key={zone}>
								<div className="zone-label">
									<span>{zone}</span>
									<span>{value.toLocaleString()}</span>
								</div>
								<div className="zone-track">
									<div className="zone-fill" style={{ width: `${Math.round((value / zoneMax) * 100)}%` }} />
								</div>
							</div>
						))}
					</div>

					{/* Alerts */}
					<div className="section-card">
						<h2 style={{ margin: "0 0 0.25rem", fontSize: "1.05rem" }}>🔔 Active alerts</h2>
						<p style={{ margin: "0 0 1rem", color: "var(--color-text-muted)", fontSize: "0.78rem" }}>
							{snapshot.alerts.length} alert{snapshot.alerts.length !== 1 ? "s" : ""} requiring attention
						</p>
						{snapshot.alerts.length === 0 && (
							<div className="empty-state" style={{ padding: "1.5rem 0" }}>
								<div className="empty-state-icon">✅</div>
								<h3>All clear</h3>
								<p>No active alerts at this time.</p>
							</div>
						)}
						{snapshot.alerts.map((alert) => (
							<div
								className={`alert-item ${alert.severity.toLowerCase() === "critical" ? "critical" : alert.severity.toLowerCase() === "warning" ? "warning" : "info"}`}
								key={alert.id}
							>
								<span className="alert-dot" style={{ background: severityColor(alert.severity) }} />
								<div style={{ flex: 1 }}>
									<div style={{ fontWeight: 600, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em", color: severityColor(alert.severity) }}>
										{alert.severity}
									</div>
									<div style={{ fontSize: "0.85rem" }}>{alert.message}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Managed stores table */}
			{!loading && !error && stores.length > 0 && (
				<div className="section-card animate-fade-in-up stagger-3" style={{ marginTop: "1.5rem" }}>
					<div className="flex-between" style={{ marginBottom: "1rem" }}>
						<h2 style={{ margin: 0, fontSize: "1.05rem" }}>🏬 Managed stores</h2>
						<span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{stores.length} store{stores.length !== 1 ? "s" : ""}</span>
					</div>
					<div className="data-table-wrapper">
						<table className="data-table">
							<thead>
								<tr>
									<th>ID</th>
									<th>Store name</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{stores.map((store) => (
									<tr key={store.id}>
										<td className="font-mono" style={{ color: "var(--color-text-muted)" }}>#{store.id}</td>
										<td style={{ fontWeight: 500 }}>{store.name}</td>
										<td><span className={`status-badge ${store.status}`}>{store.status}</span></td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Top performing stores */}
			{!loading && !error && storeMetrics.length > 0 && (
				<div className="section-card animate-fade-in-up stagger-4" style={{ marginTop: "1.5rem" }}>
					<div className="flex-between" style={{ marginBottom: "1rem" }}>
						<h2 style={{ margin: 0, fontSize: "1.05rem" }}>🏆 Top performing stores</h2>
					</div>
					<div className="data-table-wrapper">
						<table className="data-table">
							<thead>
								<tr>
									<th>Store</th>
									<th style={{ textAlign: "right" }}>Revenue</th>
									<th style={{ textAlign: "right" }}>Footfall</th>
									<th style={{ textAlign: "right" }}>Tickets</th>
								</tr>
							</thead>
							<tbody>
								{storeMetrics.map((store) => (
									<tr key={store.store_id}>
										<td style={{ fontWeight: 500 }}>{store.name}</td>
										<td style={{ textAlign: "right" }} className="text-success font-mono">${store.daily_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
										<td style={{ textAlign: "right" }}>{store.footfall.toLocaleString()}</td>
										<td style={{ textAlign: "right" }}>
											<span className={`status-badge ${store.open_tickets > 0 ? "pending" : "active"}`}>
												{store.open_tickets}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
};
