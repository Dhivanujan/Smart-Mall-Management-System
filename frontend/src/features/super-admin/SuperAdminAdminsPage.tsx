import React, { useEffect, useState } from "react";

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

export const SuperAdminAdminsPage: React.FC = () => {
	const [admins, setAdmins] = useState<AdminSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

	return (
		<DashboardLayout
			title="Super Admin Panel"
			navItems={[
				{ to: "/super-admin", label: "Dashboard" },
				{ to: "/super-admin/admins", label: "Admins" },
				{ to: "/super-admin/tenants", label: "Tenants & Billing" },
			]}
		>
			<h1>Mall admins</h1>
			<p>Review the administrators across all managed malls.</p>

			{loading && <div>Loading admins…</div>}
			{!loading && error && (
				<div style={{ color: "#fca5a5", marginTop: "1rem" }}>{error}</div>
			)}

			{!loading && !error && (
				<section style={{ marginTop: "1.5rem" }}>
					<h2>Admins</h2>
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
