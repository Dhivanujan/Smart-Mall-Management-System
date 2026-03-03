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
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const [metricsRes, storesRes] = await Promise.all([
					apiClient.get<AdminMetricsResponse>("/api/v1/admin/dashboard"),
					apiClient.get<StoresResponse>("/api/v1/admin/stores"),
				]);

				if (cancelled) return;

				setMetrics(metricsRes.data.metrics);
				setStores(storesRes.data.stores);
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

		return () => {
			cancelled = true;
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
		</DashboardLayout>
	);
};
