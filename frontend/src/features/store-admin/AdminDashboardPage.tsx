import React, { useEffect, useState } from "react";

import { useAuth } from "../../app/providers/AuthProvider";
import { apiClient } from "../../services/api/client";

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
		const fetchData = async () => {
			setLoading(true);
			try {
				const [metricsRes, storesRes] = await Promise.all([
					apiClient.get<AdminMetricsResponse>("/api/v1/admin/dashboard"),
					apiClient.get<StoresResponse>("/api/v1/admin/stores"),
				]);
				if (!cancelled) {
					setMetrics(metricsRes.data.metrics);
					setStores(storesRes.data.stores);
				}
			} catch (err) {
				console.error(err);
				if (!cancelled) setError("Failed to load admin data.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		void fetchData();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) {
		return <div style={{ padding: "2rem" }}>Loading admin dashboard...</div>;
	}

	if (error) {
		return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;
	}

	return (
		<div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
			<h1>Mall Admin Dashboard</h1>
			<p>Welcome back, {user?.full_name ?? user?.username}.</p>

			{metrics && (
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
		</div>
	);
};
