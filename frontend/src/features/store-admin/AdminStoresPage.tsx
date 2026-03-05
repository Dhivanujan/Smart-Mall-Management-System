import React, { useEffect, useMemo, useState } from "react";

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
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<"name" | "revenue" | "footfall" | "tickets">("revenue");

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

	const filtered = useMemo(() => {
		let list = [...stores];
		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter((s) => s.name.toLowerCase().includes(q));
		}
		list.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.name.localeCompare(b.name);
				case "revenue":
					return b.daily_revenue - a.daily_revenue;
				case "footfall":
					return b.footfall - a.footfall;
				case "tickets":
					return b.open_tickets - a.open_tickets;
			}
		});
		return list;
	}, [stores, search, sortBy]);

	const totals = useMemo(() => ({
		revenue: stores.reduce((s, st) => s + st.daily_revenue, 0),
		footfall: stores.reduce((s, st) => s + st.footfall, 0),
		tickets: stores.reduce((s, st) => s + st.open_tickets, 0),
	}), [stores]);

	return (
		<DashboardLayout
			title="Admin Panel"
			navItems={[
				{ to: "/admin", label: "Dashboard", icon: "📊" },
				{ to: "/admin/stores", label: "Stores", icon: "🏪" },
			]}
		>
			{/* Header */}
			<div className="flex-between" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
				<div>
					<h1 style={{ margin: 0, fontSize: "1.5rem" }}>Store portfolio</h1>
					<p style={{ margin: "0.25rem 0 0", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
						Track performance across all stores you manage.
					</p>
				</div>
				<span className="count-badge">{stores.length} store{stores.length !== 1 ? "s" : ""}</span>
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
					{/* Summary cards */}
					<div className="metrics-grid animate-fade-in-up" style={{ marginTop: "1.5rem" }}>
						<div className="metric-card">
							<div className="metric-icon green">💰</div>
							<div className="metric-body">
								<div className="metric-label">Total revenue</div>
								<div className="metric-value">${totals.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
							</div>
						</div>
						<div className="metric-card">
							<div className="metric-icon blue">👥</div>
							<div className="metric-body">
								<div className="metric-label">Total footfall</div>
								<div className="metric-value">{totals.footfall.toLocaleString()}</div>
							</div>
						</div>
						<div className="metric-card">
							<div className="metric-icon amber">🎫</div>
							<div className="metric-body">
								<div className="metric-label">Open tickets</div>
								<div className="metric-value">{totals.tickets}</div>
							</div>
						</div>
					</div>

					{/* Filters */}
					<div className="filter-bar animate-fade-in-up stagger-2" style={{ marginTop: "1.25rem" }}>
						<div className="search-input-wrapper">
							<span className="search-icon">🔍</span>
							<input
								type="text"
								placeholder="Search stores…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
						<select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
							<option value="revenue">Sort by revenue</option>
							<option value="footfall">Sort by footfall</option>
							<option value="tickets">Sort by tickets</option>
							<option value="name">Sort by name</option>
						</select>
					</div>

					{/* Table */}
					<div className="section-card animate-fade-in-up stagger-3" style={{ marginTop: "1.25rem" }}>
						<div className="data-table-wrapper">
							<table className="data-table">
								<thead>
									<tr>
										<th>Store</th>
										<th style={{ textAlign: "right" }}>Daily revenue</th>
										<th style={{ textAlign: "right" }}>Footfall</th>
										<th style={{ textAlign: "right" }}>Open tickets</th>
									</tr>
								</thead>
								<tbody>
									{filtered.map((store) => (
										<tr key={store.store_id}>
											<td>
												<div style={{ fontWeight: 500 }}>{store.name}</div>
												<div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>ID #{store.store_id}</div>
											</td>
											<td style={{ textAlign: "right" }} className="font-mono text-success">
												${store.daily_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
											</td>
											<td style={{ textAlign: "right" }}>{store.footfall.toLocaleString()}</td>
											<td style={{ textAlign: "right" }}>
												<span className={`status-badge ${store.open_tickets > 0 ? "pending" : "active"}`}>
													{store.open_tickets}
												</span>
											</td>
										</tr>
									))}
									{filtered.length === 0 && (
										<tr>
											<td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
												No stores match your search.
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
