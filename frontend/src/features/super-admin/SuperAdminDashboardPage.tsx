import React, { useEffect, useState } from "react";

import { useAuth } from "../../app/providers/AuthProvider";
import { apiClient } from "../../services/api/client";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

interface SuperMetricsResponse {
	metrics: {
		total_malls: number;
		total_stores: number;
		active_admins: number;
		system_uptime_days: number;
	};
}

interface AdminSummary {
	username: string;
	full_name: string;
	mall: string;
}

interface SuperAdminsResponse {
	admins: AdminSummary[];
}

export const SuperAdminDashboardPage: React.FC = () => {
	const { user } = useAuth();
	const [metrics, setMetrics] = useState<SuperMetricsResponse["metrics"] | null>(null);
	const [admins, setAdmins] = useState<AdminSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const [metricsRes, adminsRes] = await Promise.all([
					apiClient.get<SuperMetricsResponse>("/api/v1/admin/super/dashboard"),
					apiClient.get<SuperAdminsResponse>("/api/v1/admin/super/admins"),
				]);

				if (cancelled) return;

				setMetrics(metricsRes.data.metrics);
				setAdmins(adminsRes.data.admins);
				setError(null);
			} catch (err) {
				if (cancelled) return;
				console.error(err);
				setError("Failed to load super admin dashboard.");
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
			]}
		>
			<h1>Super Admin Dashboard</h1>
			<p>Welcome back, {user?.full_name ?? user?.username}.</p>

			{loading && <div>Loading super admin dashboard...</div>}

			{!loading && error && <div style={{ color: "#fca5a5", marginTop: "1rem" }}>{error}</div>}

			{!loading && !error && metrics && (
				<section style={{ marginTop: "1.5rem" }}>
					<h2>Platform Metrics</h2>
					<ul>
						<li>Total malls: {metrics.total_malls}</li>
						<li>Total stores: {metrics.total_stores}</li>
						<li>Active admins: {metrics.active_admins}</li>
						<li>System uptime: {metrics.system_uptime_days} days</li>
					</ul>
				</section>
			)}

			{!loading && !error && (
				<section style={{ marginTop: "1.5rem" }}>
					<h2>Mall Admins</h2>
					<table>
						<thead>
							<tr>
								<th>Username</th>
								<th>Full name</th>
								<th>Mall</th>
							</tr>
						</thead>
						<tbody>
							{admins.map((admin) => (
								<tr key={admin.username}>
									<td>{admin.username}</td>
									<td>{admin.full_name}</td>
									<td>{admin.mall}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			)}
		</DashboardLayout>
	);
};
