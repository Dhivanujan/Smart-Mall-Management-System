import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "@/services/api/client";
export const StoreDetailsPage = () => {
    const { storeId } = useParams();
    const [details, setDetails] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!storeId)
            return;
        let cancelled = false;
        const load = async () => {
            try {
                const [detailsRes, productsRes] = await Promise.all([
                    apiClient.get(`/api/v1/stores/${storeId}`),
                    apiClient.get(`/api/v1/stores/${storeId}/products`),
                ]);
                if (cancelled)
                    return;
                setDetails(detailsRes.data);
                setProducts(productsRes.data.products);
                setError(null);
            }
            catch (err) {
                if (cancelled)
                    return;
                console.error(err);
                setError("Failed to load store details.");
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
    }, [storeId]);
    return (<div className="app-page" style={{ flexDirection: "column", alignItems: "center", gap: 0 }}>
			<div className="app-page-inner animate-fade-in-up">
				<section>
					{/* Breadcrumbs */}
					<div className="breadcrumbs">
						<Link to="/">Home</Link>
						<span className="sep">/</span>
						<Link to="/mall">Mall directory</Link>
						<span className="sep">/</span>
						<span className="current">{details?.store.name ?? "Store details"}</span>
					</div>

					{loading && (<>
							<div className="skeleton skeleton-row" style={{ width: "40%", height: "20px", marginBottom: "0.75rem" }}/>
							<div className="skeleton skeleton-row" style={{ width: "70%", height: "32px", marginBottom: "0.75rem" }}/>
							<div className="skeleton skeleton-row" style={{ width: "55%", height: "16px" }}/>
						</>)}
					{!loading && error && (<>
							<h1 className="app-hero-heading">Store unavailable</h1>
							<div className="error-banner">
								<span className="error-icon">⚠️</span>
								<span>{error}</span>
							</div>
							<Link to="/mall" className="btn btn-ghost" style={{ marginTop: "0.5rem" }}>
								← Back to mall directory
							</Link>
						</>)}
					{!loading && !error && details && (<>
							<div className="app-badge" aria-label="Store badge" style={{ marginBottom: "0.75rem" }}>
								<span className="app-badge-pill" style={{ color: details.store.status === "open" ? "#4ade80" : "#f87171" }}>●</span>
								{details.store.category} · {details.store.status === "open" ? "Open now" : "Closed"}
							</div>
							<h1 className="app-hero-heading">{details.store.name}</h1>
                            
                            {details.store.description && (
                                <p className="app-hero-subtitle" style={{ marginTop: "0.5rem", marginBottom: "1.25rem" }}>
                                    {details.store.description}
                                </p>
                            )}

                            <div className="store-meta-grid" style={{ marginBottom: "1.5rem", display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))" }}>
                                {details.store.floor && (
                                    <div className="meta-item">
                                        <span className="text-muted text-sm">📍 Location</span>
                                        <div className="font-medium">Floor {details.store.floor}</div>
                                    </div>
                                )}
                                {details.store.working_hours && (
                                    <div className="meta-item">
                                        <span className="text-muted text-sm">🕒 Hours</span>
                                        <div className="font-medium">{details.store.working_hours}</div>
                                    </div>
                                )}
                                {details.store.address && (
                                    <div className="meta-item">
                                        <span className="text-muted text-sm">🏢 Address</span>
                                        <div className="font-medium">{details.store.address}</div>
                                    </div>
                                )}
                            </div>

							{/* Live stats row */}
							<div className="stats-row">
								<div className="mini-stat">
									<span className="mini-stat-icon">👥</span>
									<div>
										<div className="mini-stat-label">Footfall</div>
										<div className="mini-stat-value">{details.store.current_footfall} <span className="mini-stat-sub">visitors</span></div>
									</div>
								</div>
								<div className="mini-stat">
									<span className="mini-stat-icon">📊</span>
									<div>
										<div className="mini-stat-label">Occupancy</div>
										<div className="mini-stat-value">{details.store.current_occupancy_percent.toFixed(0)}%</div>
									</div>
								</div>
								<div className="mini-stat">
									<span className="bg-transparent text-warning text-base">★</span>
									<div>
										<div className="mini-stat-label">Rating</div>
										<div className="mini-stat-value">{details.store.average_rating.toFixed(1)} <span className="mini-stat-sub">/ 5.0</span></div>
									</div>
								</div>
							</div>
						</>)}
				</section>
				<aside>
					{loading && <div className="skeleton skeleton-card" style={{ height: "200px" }}/>}
					{!loading && !error && details && (<div className="app-card animate-fade-in-up stagger-2" aria-label="Store metrics">
							<div className="app-card-header">
								<h2 className="app-card-title">📈 Today&apos;s performance</h2>
								<p className="app-card-subtitle">Indicative metrics for the current trading day.</p>
							</div>
							<ul className="detail-metrics-list">
								<li>
									<span className="label">Revenue</span>
									<span className="value text-success">${details.today_metrics.today_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
								</li>
								<li>
									<span className="label">Transactions</span>
									<span className="value">{details.today_metrics.today_transactions.toLocaleString()}</span>
								</li>
								<li>
									<span className="label">Conversion rate</span>
									<span className="value text-accent">{details.today_metrics.conversion_rate_percent.toFixed(1)}%</span>
								</li>
							</ul>
						</div>)}
				</aside>
			</div>

			{/* Products section */}
			<div style={{ width: "100%", maxWidth: "1120px", padding: "0 1.5rem", marginTop: "2rem" }}>
				{!loading && !error && products.length > 0 && (<div className="animate-fade-in-up stagger-3">
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
							<h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 600 }}>🛒 Featured products</h2>
							<span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
								{products.length} product{products.length !== 1 ? "s" : ""}
							</span>
						</div>
						<div className="products-grid">
							{products.map((product, i) => (<div key={product.id} className={`product-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
									<div className="product-card-category">{product.category}</div>
									<div className="product-card-name">{product.name}</div>
									<div className="product-card-price">${product.price.toFixed(2)}</div>
								</div>))}
						</div>
					</div>)}
				{!loading && !error && !products.length && (<div className="empty-state">
						<div className="empty-state-icon">📦</div>
						<h3>No products available</h3>
						<p>This store hasn&apos;t listed any products yet. Check back later!</p>
					</div>)}
			</div>
		</div>);
};
