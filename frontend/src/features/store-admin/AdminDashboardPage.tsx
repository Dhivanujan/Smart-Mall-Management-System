import React, { useEffect, useState } from "react";

import { useAuth } from "../../app/providers/AuthProvider";
import { apiClient } from "../../services/api/client";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

interface AdminMetricsResponse {
	user: {
		full_name?: string | null;
		username: string;
	};
	metrics: {
		total_stores: number;
		active_customers: number;
		daily_revenue: number;
		open_tickets: number;
	};
}

interface StoreMetric {
	store_id: number;
	name: string;
	daily_revenue: number;
	footfall: number;
	open_tickets: number;
}

interface StoreMetricsResponse {
	stores: StoreMetric[];
}

interface MonitoringSnapshot {
	timestamp: string;
	footfall: {
		mall_total: number;
		by_zone: Record<string, number>;
	};
	alerts: { id: string; severity: string; message: string }[];
}

interface MonitoringResponse {
	snapshot: MonitoringSnapshot;
}

interface StoreSummary {
	id: number;
	name: string;
	status: string;
}

interface StoresResponse {
	stores: StoreSummary[];
}

export const AdminDashboardPage: React.FC = () => {
	const { user } = useAuth();
	const [metrics, setMetrics] = useState<AdminMetricsResponse["metrics"] | null>(null);
	const [stores, setStores] = useState<StoreSummary[]>([]);
	const [storeMetrics, setStoreMetrics] = useState<StoreMetric[]>([]);
	const [snapshot, setSnapshot] = useState<MonitoringSnapshot | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

	return (
		<DashboardLayout
			title="Admin Panel"
			navItems={[
				{ to: "/admin", label: "Dashboard" },
				{ to: "/admin/stores", label: "Stores" },
			]}
		>
			<h1>Mall Admin Dashboard</h1>
			<p>Welcome back, {user?.full_name ?? user?.username}.</p>

			{loading && <div>Loading admin dashboard...</div>}

			{!loading && error && <div style={{ color: "#fca5a5", marginTop: "1rem" }}>{error}</div>}

			{!loading && !error && metrics && (
				<section style={{ marginTop: "1.5rem" }}>
					<h2>Key Metrics</h2>
					<ul>
						<li>Total stores: {metrics.total_stores}</li>
						<li>Active customers: {metrics.active_customers}</li>
						<li>Daily revenue: ${metrics.daily_revenue.toFixed(2)}</li>
						<li>Open tickets: {metrics.open_tickets}</li>
					</ul>
				</section>
			)}

			{!loading && !error && snapshot && (
				<section style={{ marginTop: "1.5rem" }}>
					<h2>Live operations snapshot</h2>
					<p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
						Auto-refreshes every 10 seconds for the demo.
					</p>
					<p>Mall footfall right now: {snapshot.footfall.mall_total} visitors</p>
					<ul>
						{Object.entries(snapshot.footfall.by_zone).map(([zone, value]) => (
							<li key={zone}>
								{zone}: {value} visitors
							</li>
						))}
					</ul>
					{snapshot.alerts.length > 0 && (
						<ul style={{ marginTop: "0.5rem" }}>
							{snapshot.alerts.map((alert) => (
								<li key={alert.id} style={{ color: "#f97316" }}>
									[{alert.severity}] {alert.message}
								</li>
							))}
						</ul>
					)}
				</section>
			)}

			{!loading && !error && (
				<section style={{ marginTop: "1.5rem" }}>
					<h2>Managed Stores</h2>
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{stores.map((store) => (
								<tr key={store.id}>
									<td>{store.id}</td>
									<td>{store.name}</td>
									<td>{store.status}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			)}

			{!loading && !error && storeMetrics.length > 0 && (
				<section style={{ marginTop: "1.5rem" }}>
					<h2>Top performing stores</h2>
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th style={{ textAlign: "right" }}>Daily revenue</th>
								<th style={{ textAlign: "right" }}>Footfall</th>
							</tr>
						</thead>
						<tbody>
							{storeMetrics.map((store) => (
								<tr key={store.store_id}>
									<td>{store.store_id}</td>
									<td>{store.name}</td>
									<td style={{ textAlign: "right" }}>${store.daily_revenue.toFixed(2)}</td>
									<td style={{ textAlign: "right" }}>{store.footfall}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			)}
		</DashboardLayout>
	);
};
