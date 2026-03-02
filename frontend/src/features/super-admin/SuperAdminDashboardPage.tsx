import React, { useEffect, useState } from "react";

import { useAuth } from "../../app/providers/AuthProvider";
import { apiClient } from "../../services/api/client";

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

interface AdminsResponse {
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
		const fetchData = async () => {
			setLoading(true);
			try {
				const [metricsRes, adminsRes] = await Promise.all([
					apiClient.get<SuperMetricsResponse>("/api/v1/admin/super/dashboard"),
					apiClient.get<AdminsResponse>("/api/v1/admin/super/admins"),
				]);
				if (!cancelled) {
					setMetrics(metricsRes.data.metrics);
					setAdmins(adminsRes.data.admins);
				}
			} catch (err) {
				console.error(err);
				if (!cancelled) setError("Failed to load super admin data.");
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
		return <div style={{ padding: "2rem" }}>Loading super admin dashboard...</div>;
	}

	if (error) {
		return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;
	}

	return (
		<div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
			<h1>Super Admin Dashboard</h1>
			<p>Welcome back, {user?.full_name ?? user?.username}.</p>

			{metrics && (
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
		</div>
	);
};
