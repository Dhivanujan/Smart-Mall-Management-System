import React, { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/services/api/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SUPER_ADMIN_NAV } from "@/constants/navigation";
const occupancyColor = (pct) => {
    if (pct >= 85)
        return "var(--color-success)";
    if (pct >= 60)
        return "var(--color-warning)";
    return "var(--color-danger)";
};
export const SuperAdminTenantsPage = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await apiClient.get("/api/v1/admin/super/tenants");
                if (cancelled)
                    return;
                setTenants(res.data.tenants ?? []);
                setError(null);
            }
            catch (err) {
                if (cancelled)
                    return;
                console.error(err);
                setError("Failed to load tenants and billing.");
            }
            finally {
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
    const totals = useMemo(() => ({
        mrr: tenants.reduce((s, t) => s + t.monthly_recurring_revenue, 0),
        avgOccupancy: tenants.length ? tenants.reduce((s, t) => s + t.occupancy_percent, 0) / tenants.length : 0,
    }), [tenants]);
    return (<DashboardLayout title="Super Admin Panel" navItems={SUPER_ADMIN_NAV}>
			{/* Header */}
			<div className="flex-between" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
				<div>
					<h1 style={{ margin: 0, fontSize: "1.5rem" }}>Tenants &amp; billing</h1>
					<p style={{ margin: "0.25rem 0 0", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
						Understand performance and occupancy across all managed malls.
					</p>
				</div>
				<span className="count-badge">{tenants.length} tenant{tenants.length !== 1 ? "s" : ""}</span>
			</div>

			{/* Loading */}
			{loading && (<div style={{ marginTop: "2rem" }}>
					<div className="loading-spinner" style={{ margin: "0 auto" }}/>
				</div>)}

			{/* Error */}
			{!loading && error && (<div className="error-banner" style={{ marginTop: "1.5rem" }}>
					<span className="error-icon">⚠️</span>
					<span>{error}</span>
				</div>)}

			{!loading && !error && (<>
					{/* Summary cards */}
					<div className="metrics-grid animate-fade-in-up" style={{ marginTop: "1.5rem" }}>
						<div className="metric-card">
							<div className="metric-icon green">💰</div>
							<div className="metric-body">
								<div className="metric-label">Total MRR</div>
								<div className="metric-value">${totals.mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
							</div>
						</div>
						<div className="metric-card">
							<div className="metric-icon blue">📊</div>
							<div className="metric-body">
								<div className="metric-label">Avg occupancy</div>
								<div className="metric-value">{totals.avgOccupancy.toFixed(1)}%</div>
							</div>
						</div>
						<div className="metric-card">
							<div className="metric-icon purple">🏢</div>
							<div className="metric-body">
								<div className="metric-label">Total malls</div>
								<div className="metric-value">{tenants.length}</div>
							</div>
						</div>
					</div>

					{/* Table */}
					<div className="section-card animate-fade-in-up stagger-2" style={{ marginTop: "1.25rem" }}>
						<div className="data-table-wrapper">
							<table className="data-table">
								<thead>
									<tr>
										<th>Mall</th>
										<th style={{ textAlign: "right" }}>MRR</th>
										<th style={{ textAlign: "right" }}>Occupancy</th>
									</tr>
								</thead>
								<tbody>
									{tenants.map((tenant) => (<tr key={tenant.mall_id}>
											<td>
												<div style={{ fontWeight: 500 }}>{tenant.mall_name}</div>
												<div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>ID #{tenant.mall_id}</div>
											</td>
											<td style={{ textAlign: "right" }} className="font-mono text-success">
												${tenant.monthly_recurring_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
											</td>
											<td style={{ textAlign: "right" }}>
												<div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
													<div style={{ width: "60px", height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
														<div style={{ width: `${Math.min(tenant.occupancy_percent, 100)}%`, height: "100%", borderRadius: "3px", background: occupancyColor(tenant.occupancy_percent), transition: "width 0.6s ease" }}/>
													</div>
													<span style={{ fontSize: "0.82rem", fontWeight: 600, color: occupancyColor(tenant.occupancy_percent) }}>
														{tenant.occupancy_percent.toFixed(1)}%
													</span>
												</div>
											</td>
										</tr>))}
									{tenants.length === 0 && (<tr>
											<td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
												No tenants found.
											</td>
										</tr>)}
								</tbody>
							</table>
						</div>
					</div>
				</>)}
		</DashboardLayout>);
};
