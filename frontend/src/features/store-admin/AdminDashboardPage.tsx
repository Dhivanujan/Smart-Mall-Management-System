import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { apiClient } from "@/services/api/client";
import { Store, Users, DollarSign, Ticket, MapPin, Bell } from "lucide-react";

const severityColor = (s: string) => {
    switch (s.toLowerCase()) {
        case "critical": return "hsl(0 84% 45%)";
        case "warning": return "hsl(38 92% 40%)";
        default: return "hsl(221 83% 53%)";
    }
};

export const AdminDashboardPage = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState(null);
    const [stores, setStores] = useState([]);
    const [storeMetrics, setStoreMetrics] = useState([]);
    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const [metricsRes, storesRes, storeMetricsRes, monitoringRes] = await Promise.all([
                    apiClient.get("/api/v1/admin/dashboard"),
                    apiClient.get("/api/v1/admin/stores"),
                    apiClient.get("/api/v1/admin/store-metrics"),
                    apiClient.get("/api/v1/admin/monitoring"),
                ]);
                if (cancelled) return;
                setMetrics(metricsRes.data.metrics);
                setStores(storesRes.data.stores);
                setStoreMetrics(storeMetricsRes.data.stores);
                setSnapshot(monitoringRes.data.snapshot);
                setLastRefresh(new Date());
                setError(null);
            } catch {
                if (!cancelled) setError("Failed to load admin dashboard.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        const interval = window.setInterval(load, 10000);
        return () => { cancelled = true; window.clearInterval(interval); };
    }, []);

    const zoneMax = snapshot ? Math.max(...Object.values(snapshot.footfall.by_zone) as number[], 1) : 1;

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="hero-heading">Mall Admin Dashboard</h1>
                    <p className="hero-subtitle">Welcome back, <strong>{user?.full_name ?? user?.username}</strong></p>
                </div>
                {lastRefresh && (
                    <div className="refresh-indicator">
                        <span className="live-dot" />
                        Live · {lastRefresh.toLocaleTimeString()}
                    </div>
                )}
            </div>

            {loading && <div className="flex justify-center py-16"><div className="loading-spinner" /></div>}
            {!loading && error && <div className="error-banner"><span>⚠</span><span>{error}</span></div>}

            {!loading && !error && metrics && (
                <div className="metrics-grid animate-fade-in-up">
                    {[
                        { label: "Total Stores", value: metrics.total_stores, Icon: Store, color: "blue" },
                        { label: "Active Customers", value: metrics.active_customers.toLocaleString(), Icon: Users, color: "green" },
                        { label: "Daily Revenue", value: `$${metrics.daily_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, Icon: DollarSign, color: "amber" },
                        { label: "Open Tickets", value: metrics.open_tickets, Icon: Ticket, color: "red" },
                    ].map(({ label, value, Icon, color }) => (
                        <div key={label} className="metric-card">
                            <div className={`metric-icon ${color}`}><Icon className="w-5 h-5" /></div>
                            <div className="metric-body">
                                <div className="metric-label">{label}</div>
                                <div className="metric-value">{value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && snapshot && (
                <div className="dashboard-grid animate-fade-in-up stagger-2" style={{ marginTop: "1.5rem" }}>
                    <div className="section-card">
                        <h2 className="panel-title" style={{ marginBottom: "1rem" }}><MapPin className="w-4 h-4" /> Footfall by Zone</h2>
                        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                            Mall total: <strong>{snapshot.footfall.mall_total.toLocaleString()}</strong> visitors
                        </p>
                        {Object.entries(snapshot.footfall.by_zone).map(([zone, value]: [string, any]) => (
                            <div key={zone} className="zone-bar">
                                <div className="zone-label"><span>{zone}</span><span>{(value as number).toLocaleString()}</span></div>
                                <div className="zone-track"><div className="zone-fill" style={{ width: `${Math.round((value / zoneMax) * 100)}%` }} /></div>
                            </div>
                        ))}
                    </div>

                    <div className="section-card">
                        <h2 className="panel-title" style={{ marginBottom: "1rem" }}><Bell className="w-4 h-4" /> Active Alerts</h2>
                        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                            {snapshot.alerts.length} alert{snapshot.alerts.length !== 1 ? "s" : ""} requiring attention
                        </p>
                        {snapshot.alerts.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon">✓</div>
                                <p>All clear — no active alerts.</p>
                            </div>
                        )}
                        {snapshot.alerts.map((alert: any) => (
                            <div key={alert.id} className={`alert-item ${alert.severity.toLowerCase()}`} style={{ marginBottom: "0.5rem" }}>
                                <span className="alert-dot" style={{ background: severityColor(alert.severity) }} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", color: severityColor(alert.severity) }}>{alert.severity}</div>
                                    <div style={{ fontSize: "0.85rem" }}>{alert.message}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && !error && stores.length > 0 && (
                <div className="section-card animate-fade-in-up stagger-3" style={{ marginTop: "1.5rem" }}>
                    <div className="flex-between" style={{ marginBottom: "1rem" }}>
                        <h2 className="panel-title"><Store className="w-4 h-4" /> Managed Stores</h2>
                        <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{stores.length} stores</span>
                    </div>
                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead><tr><th>ID</th><th>Store Name</th><th>Category</th><th>Status</th></tr></thead>
                            <tbody>
                                {stores.map((store: any) => (
                                    <tr key={store.id}>
                                        <td className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>#{store.id}</td>
                                        <td style={{ fontWeight: 600 }}>{store.name}</td>
                                        <td style={{ color: "var(--color-text-muted)" }}>{store.category}</td>
                                        <td><span className={`status-badge ${store.status}`}><span className="dot" />{store.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && !error && storeMetrics.length > 0 && (
                <div className="section-card animate-fade-in-up stagger-4" style={{ marginTop: "1.5rem" }}>
                    <h2 className="panel-title" style={{ marginBottom: "1rem" }}>Top Performing Stores</h2>
                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead><tr><th>Store</th><th style={{ textAlign: "right" }}>Revenue</th><th style={{ textAlign: "right" }}>Footfall</th><th style={{ textAlign: "right" }}>Tickets</th></tr></thead>
                            <tbody>
                                {storeMetrics.map((store: any) => (
                                    <tr key={store.store_id}>
                                        <td style={{ fontWeight: 600 }}>{store.name}</td>
                                        <td style={{ textAlign: "right", color: "var(--color-success)", fontWeight: 600 }}>${store.daily_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td style={{ textAlign: "right" }}>{store.footfall.toLocaleString()}</td>
                                        <td style={{ textAlign: "right" }}><span className={`status-badge ${store.open_tickets > 0 ? "pending" : "active"}`}>{store.open_tickets}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};