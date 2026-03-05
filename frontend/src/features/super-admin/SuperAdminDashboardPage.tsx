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

const SA_NAV = [
	{ to: "/super-admin", label: "Dashboard", icon: "📊" },
	{ to: "/super-admin/admins", label: "Admins", icon: "👥" },
	{ to: "/super-admin/tenants", label: "Tenants & Billing", icon: "💰" },
];

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
		<DashboardLayout title="Super Admin Panel" navItems={SA_NAV}>
			{/* Header */}
			<div className="flex-between" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
				<div>
					<h1 style={{ margin: 0, fontSize: "1.5rem" }}>Super Admin Dashboard</h1>
					<p style={{ margin: "0.25rem 0 0", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
						Welcome back, <strong>{user?.full_name ?? user?.username}</strong>
					</p>
				</div>
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
						<div className="metric-icon purple">🏢</div>
						<div className="metric-body">
							<div className="metric-label">Total malls</div>
							<div className="metric-value">{metrics.total_malls}</div>
						</div>
					</div>
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
							<div className="metric-label">Active admins</div>
							<div className="metric-value">{metrics.active_admins}</div>
						</div>
					</div>
					<div className="metric-card">
						<div className="metric-icon amber">⏱️</div>
						<div className="metric-body">
							<div className="metric-label">System uptime</div>
							<div className="metric-value">{metrics.system_uptime_days} <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--color-text-muted)" }}>days</span></div>
						</div>
					</div>
				</div>
			)}

			{/* Admins table */}
			{!loading && !error && admins.length > 0 && (
				<div className="section-card animate-fade-in-up stagger-2" style={{ marginTop: "1.5rem" }}>
					<div className="flex-between" style={{ marginBottom: "1rem" }}>
						<h2 style={{ margin: 0, fontSize: "1.05rem" }}>👥 Mall administrators</h2>
						<span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{admins.length} admin{admins.length !== 1 ? "s" : ""}</span>
					</div>
					<div className="data-table-wrapper">
						<table className="data-table">
							<thead>
								<tr>
									<th>Username</th>
									<th>Full name</th>
									<th>Assigned mall</th>
								</tr>
							</thead>
							<tbody>
								{admins.map((admin) => (
									<tr key={admin.username}>
										<td className="font-mono">{admin.username}</td>
										<td style={{ fontWeight: 500 }}>{admin.full_name}</td>
										<td>{admin.mall}</td>
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
