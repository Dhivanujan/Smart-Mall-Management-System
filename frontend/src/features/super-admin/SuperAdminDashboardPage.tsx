import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { apiClient } from "@/services/api/client";
import { Building2, Store, Users, Clock } from "lucide-react";

export const SuperAdminDashboardPage = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [metricsRes, adminsRes] = await Promise.all([
                    apiClient.get("/api/v1/admin/super/dashboard"),
                    apiClient.get("/api/v1/admin/super/admins"),
                ]);
                if (cancelled) return;
                setMetrics(metricsRes.data.metrics);
                setAdmins(adminsRes.data.admins);
                setError(null);
            } catch {
                if (!cancelled) setError("Failed to load super admin dashboard.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="hero-heading">Super Admin Dashboard</h1>
                    <p className="hero-subtitle">Welcome back, <strong>{user?.full_name ?? user?.username}</strong></p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 text-xs font-semibold border border-green-500/20">
                    <span className="live-dot" />
                    Platform Active
                </div>
            </div>

            {loading && <div className="flex justify-center py-16"><div className="loading-spinner" /></div>}
            {!loading && error && <div className="error-banner"><span>⚠</span><span>{error}</span></div>}

            {!loading && !error && metrics && (
                <div className="metrics-grid animate-fade-in-up">
                    {[
                        { label: "Total Malls", value: metrics.total_malls, Icon: Building2, color: "purple" },
                        { label: "Total Stores", value: metrics.total_stores, Icon: Store, color: "blue" },
                        { label: "Active Admins", value: metrics.active_admins, Icon: Users, color: "green" },
                        { label: "System Uptime", value: `${metrics.system_uptime_days}d`, Icon: Clock, color: "amber" },
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

            {!loading && !error && admins.length > 0 && (
                <div className="section-card animate-fade-in-up stagger-2" style={{ marginTop: "1.5rem" }}>
                    <div className="flex-between" style={{ marginBottom: "1rem" }}>
                        <h2 className="panel-title"><Users className="w-4 h-4" /> Mall Administrators</h2>
                        <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{admins.length} admin{admins.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead><tr><th>Username</th><th>Full Name</th><th>Assigned Mall</th></tr></thead>
                            <tbody>
                                {admins.map((admin) => (
                                    <tr key={admin.username}>
                                        <td className="font-mono text-xs">{admin.username}</td>
                                        <td style={{ fontWeight: 500 }}>{admin.full_name}</td>
                                        <td>{admin.mall}</td>
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