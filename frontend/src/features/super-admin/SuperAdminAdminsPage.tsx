import React, { useEffect, useMemo, useState } from "react";

import { apiClient } from "../../services/api/client";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

interface AdminSummary {
	username: string;
	full_name: string;
	mall: string;
}

interface AdminsResponse {
	admins: AdminSummary[];
}

const SA_NAV = [
	{ to: "/super-admin", label: "Dashboard", icon: "📊" },
	{ to: "/super-admin/admins", label: "Admins", icon: "👥" },
	{ to: "/super-admin/tenants", label: "Tenants & Billing", icon: "💰" },
];

export const SuperAdminAdminsPage: React.FC = () => {
	const [admins, setAdmins] = useState<AdminSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const res = await apiClient.get<AdminsResponse>("/api/v1/admin/super/admins");
				if (cancelled) return;
				setAdmins(res.data.admins);
				setError(null);
			} catch (err) {
				if (cancelled) return;
				console.error(err);
				setError("Failed to load admins.");
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

	const filtered = useMemo(() => {
		if (!search.trim()) return admins;
		const q = search.toLowerCase();
		return admins.filter(
			(a) =>
				a.username.toLowerCase().includes(q) ||
				a.full_name.toLowerCase().includes(q) ||
				a.mall.toLowerCase().includes(q),
		);
	}, [admins, search]);

	const mallCount = useMemo(() => new Set(admins.map((a) => a.mall)).size, [admins]);

	return (
		<DashboardLayout title="Super Admin Panel" navItems={SA_NAV}>
			{/* Header */}
			<div className="flex-between" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
				<div>
					<h1 style={{ margin: 0, fontSize: "1.5rem" }}>Mall administrators</h1>
					<p style={{ margin: "0.25rem 0 0", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
						Review the administrators across all managed malls.
					</p>
				</div>
				<span className="count-badge">{admins.length} admin{admins.length !== 1 ? "s" : ""}</span>
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

			{!loading && !error && (
				<>
					{/* Summary */}
					<div className="metrics-grid animate-fade-in-up" style={{ marginTop: "1.5rem" }}>
						<div className="metric-card">
							<div className="metric-icon blue">👥</div>
							<div className="metric-body">
								<div className="metric-label">Total admins</div>
								<div className="metric-value">{admins.length}</div>
							</div>
						</div>
						<div className="metric-card">
							<div className="metric-icon purple">🏢</div>
							<div className="metric-body">
								<div className="metric-label">Malls covered</div>
								<div className="metric-value">{mallCount}</div>
							</div>
						</div>
					</div>

					{/* Search */}
					<div className="filter-bar animate-fade-in-up stagger-2" style={{ marginTop: "1.25rem" }}>
						<div className="search-input-wrapper">
							<span className="search-icon">🔍</span>
							<input
								type="text"
								placeholder="Search by name, username or mall…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</div>

					{/* Table */}
					<div className="section-card animate-fade-in-up stagger-3" style={{ marginTop: "1.25rem" }}>
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
									{filtered.map((admin) => (
										<tr key={admin.username}>
											<td className="font-mono">{admin.username}</td>
											<td style={{ fontWeight: 500 }}>{admin.full_name}</td>
											<td>{admin.mall}</td>
										</tr>
									))}
									{filtered.length === 0 && (
										<tr>
											<td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
												No admins match your search.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</>
			)}
		</DashboardLayout>
	);
};
