import React, { useEffect, useState } from "react";

import { apiClient } from "../../services/api/client";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

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

export const AdminStoresPage: React.FC = () => {
	const [stores, setStores] = useState<StoreMetric[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const res = await apiClient.get<StoreMetricsResponse>("/api/v1/admin/store-metrics");
				if (cancelled) return;
				setStores(res.data.stores);
				setError(null);
			} catch (err) {
				if (cancelled) return;
				console.error(err);
				setError("Failed to load store metrics.");
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
			<h1>Store portfolio</h1>
			<p>Track performance across all stores you manage.</p>

			{loading && <div>Loading store metrics…</div>}
			{!loading && error && (
				<div style={{ color: "#fca5a5", marginTop: "1rem" }}>{error}</div>
			)}

			{!loading && !error && (
				<section style={{ marginTop: "1.5rem" }}>
					<h2>Stores</h2>
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th style={{ textAlign: "right" }}>Daily revenue</th>
								<th style={{ textAlign: "right" }}>Footfall</th>
								<th style={{ textAlign: "right" }}>Open tickets</th>
							</tr>
						</thead>
						<tbody>
							{stores.map((store) => (
								<tr key={store.store_id}>
									<td>{store.store_id}</td>
									<td>{store.name}</td>
									<td style={{ textAlign: "right" }}>${store.daily_revenue.toFixed(2)}</td>
									<td style={{ textAlign: "right" }}>{store.footfall}</td>
									<td style={{ textAlign: "right" }}>{store.open_tickets}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			)}
		</DashboardLayout>
	);
};
