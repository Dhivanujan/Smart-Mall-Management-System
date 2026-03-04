import React, { useEffect, useState } from "react";

import { apiClient } from "../../services/api/client";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

interface TenantSummary {
	mall_id: number;
	mall_name: string;
	monthly_recurring_revenue: number;
	occupancy_percent: number;
}

interface TenantsResponse {
	tenants: TenantSummary[];
}

export const SuperAdminTenantsPage: React.FC = () => {
	const [tenants, setTenants] = useState<TenantSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const res = await apiClient.get<TenantsResponse>("/api/v1/admin/super/tenants");
				if (cancelled) return;
				setTenants(res.data.tenants ?? []);
				setError(null);
			} catch (err) {
				if (cancelled) return;
				console.error(err);
				setError("Failed to load tenants and billing.");
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
			title="Super Admin Panel"
			navItems={[
				{ to: "/super-admin", label: "Dashboard" },
				{ to: "/super-admin/admins", label: "Admins" },
				{ to: "/super-admin/tenants", label: "Tenants & Billing" },
			]}
		>
			<h1>Tenants &amp; billing</h1>
			<p>Understand performance and occupancy across all managed malls.</p>

			{loading && <div>Loading tenants…</div>}
			{!loading && error && (
				<div style={{ color: "#fca5a5", marginTop: "1rem" }}>{error}</div>
			)}

			{!loading && !error && (
				<section style={{ marginTop: "1.5rem" }}>
					<h2>Malls</h2>
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Mall</th>
								<th style={{ textAlign: "right" }}>MRR</th>
								<th style={{ textAlign: "right" }}>Occupancy</th>
							</tr>
						</thead>
						<tbody>
							{tenants.map((tenant) => (
								<tr key={tenant.mall_id}>
									<td>{tenant.mall_id}</td>
									<td>{tenant.mall_name}</td>
									<td style={{ textAlign: "right" }}>${tenant.monthly_recurring_revenue.toFixed(2)}</td>
									<td style={{ textAlign: "right" }}>{tenant.occupancy_percent.toFixed(1)}%</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			)}
		</DashboardLayout>
	);
};
