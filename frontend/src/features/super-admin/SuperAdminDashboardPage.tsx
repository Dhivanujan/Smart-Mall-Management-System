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
	if (loading) {
		return (
			<DashboardLayout
				title="Super Admin Panel"
				navItems={[
					{ to: "/super-admin", label: "Dashboard" },
					{ to: "/super-admin/admins", label: "Admins" },
				]}
			>
				<div>Loading super admin dashboard...</div>
			</DashboardLayout>
		);
	}

	if (error) {
		return (
			<DashboardLayout
				title="Super Admin Panel"
				navItems={[
					{ to: "/super-admin", label: "Dashboard" },
					{ to: "/super-admin/admins", label: "Admins" },
				]}
			>
				<div style={{ color: "red" }}>{error}</div>
			</DashboardLayout>
		);
	}

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
		</DashboardLayout>
	);
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
