import React, { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api/analytics";

interface SalesData {
	period: string;
	total_revenue: number;
	total_transactions: number;
	avg_transaction_value: number;
	daily_breakdown: { day: string; revenue: number; transactions: number }[];
}

interface CustomerData {
	total_unique_customers: number;
	customer_segments: { segment: string; count: number; avg_spend: number }[];
	shopping_patterns: { hour: number; avg_customers: number }[];
}

export const SalesDashboardPage: React.FC = () => {
	const [sales, setSales] = useState<SalesData | null>(null);
	const [customers, setCustomers] = useState<CustomerData | null>(null);
	const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		Promise.all([
			analyticsApi.storeSales(period),
			analyticsApi.storeCustomers(),
		]).then(([sRes, cRes]) => {
			setSales(sRes.data);
			setCustomers(cRes.data);
		}).finally(() => setLoading(false));
	}, [period]);

	if (loading) return <div className="loading-spinner" />;

	const maxRev = sales ? Math.max(...sales.daily_breakdown.map((d) => d.revenue)) : 1;

	return (
		<div className="panel-page">
			<div className="page-header">
				<h1 className="hero-heading">Sales Dashboard</h1>
				<p className="hero-subtitle">Revenue analytics and customer insights for your store</p>
			</div>

			<div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
				{(["daily", "weekly", "monthly"] as const).map((p) => (
					<button key={p} className={`btn ${period === p ? "btn-primary" : ""}`} onClick={() => setPeriod(p)} style={{ textTransform: "capitalize" }}>
						{p}
					</button>
				))}
			</div>

			{sales && (
				<>
					<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
						<div className="metric-card">
							<span className="metric-icon">💰</span>
							<span className="metric-label">Total Revenue</span>
							<span className="metric-value" style={{ color: "var(--color-accent-strong)" }}>${sales.total_revenue.toLocaleString()}</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">📦</span>
							<span className="metric-label">Total Transactions</span>
							<span className="metric-value">{sales.total_transactions.toLocaleString()}</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">📊</span>
							<span className="metric-label">Avg Transaction Value</span>
							<span className="metric-value">${sales.avg_transaction_value.toFixed(2)}</span>
						</div>
						{customers && (
							<div className="metric-card">
								<span className="metric-icon">👥</span>
								<span className="metric-label">Total Customers</span>
								<span className="metric-value">{customers.total_unique_customers.toLocaleString()}</span>
							</div>
						)}
					</div>

					<div className="section-card" style={{ marginTop: "2rem" }}>
						<h2 className="section-title">Revenue Chart</h2>
						<div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "200px", paddingTop: "1rem" }}>
							{sales.daily_breakdown.map((d, i) => (
								<div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
									<span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>${d.revenue}</span>
									<div style={{
										width: "100%",
										maxWidth: "40px",
										height: `${(d.revenue / maxRev) * 160}px`,
										background: "linear-gradient(180deg, var(--color-accent-strong), var(--color-accent))",
										borderRadius: "4px 4px 0 0",
										minHeight: "4px",
									}} />
									<span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", transform: "rotate(-45deg)", transformOrigin: "top left", whiteSpace: "nowrap" }}>
										{d.day}
									</span>
								</div>
							))}
						</div>
					</div>
				</>
			)}

			{customers && (
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "2rem" }}>
					<div className="section-card">
						<h2 className="section-title">Customer Segments</h2>
						{customers.customer_segments.map((seg) => (
							<div key={seg.segment} style={{ marginBottom: "0.75rem" }}>
								<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
									<span>{seg.segment}</span>
									<span style={{ color: "var(--color-text-muted)" }}>{seg.count} customers</span>
								</div>
								<div className="zone-bar" style={{ height: "8px" }}>
									<div className="zone-bar-fill" style={{ width: `${Math.min((seg.count / Math.max(customers.total_unique_customers, 1)) * 100, 100)}%` }} />
								</div>
							</div>
						))}
					</div>
					<div className="section-card">
						<h2 className="section-title">Visit Patterns</h2>
						{customers.shopping_patterns.map((vp) => (
							<div key={vp.hour} style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
								<span style={{ width: "40px", fontSize: "0.85rem", fontWeight: 600 }}>{vp.hour}:00</span>
								<div className="zone-bar" style={{ flex: 1, height: "8px" }}>
									<div className="zone-bar-fill" style={{ width: `${(vp.avg_customers / 50) * 100}%` }} />
								</div>
								<span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", width: "30px", textAlign: "right" }}>{vp.avg_customers}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
