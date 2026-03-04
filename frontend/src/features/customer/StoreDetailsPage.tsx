import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiClient } from "../../services/api/client";

interface StoreSummary {
	id: number;
	name: string;
	category: string;
	status: string;
	average_rating: number;
	current_footfall: number;
	current_occupancy_percent: number;
}

interface ProductSummary {
	id: number;
	name: string;
	price: number;
	category: string;
}

interface StoreDetailsResponse {
	store: StoreSummary;
	products_sample: ProductSummary[];
	today_metrics: {
		today_revenue: number;
		today_transactions: number;
		conversion_rate_percent: number;
	};
}

interface StoreProductsResponse {
	store: StoreSummary;
	products: ProductSummary[];
}

export const StoreDetailsPage: React.FC = () => {
	const { storeId } = useParams<{ storeId: string }>();
	const [details, setDetails] = useState<StoreDetailsResponse | null>(null);
	const [products, setProducts] = useState<ProductSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!storeId) return;
		let cancelled = false;

		const load = async () => {
			try {
				const [detailsRes, productsRes] = await Promise.all([
					apiClient.get<StoreDetailsResponse>(`/api/v1/stores/${storeId}`),
					apiClient.get<StoreProductsResponse>(`/api/v1/stores/${storeId}/products`),
				]);
				if (cancelled) return;
				setDetails(detailsRes.data);
				setProducts(productsRes.data.products);
				setError(null);
			} catch (err) {
				if (cancelled) return;
				console.error(err);
				setError("Failed to load store details.");
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
	}, [storeId]);

	return (
		<div className="app-page">
			<div className="app-page-inner">
				<section>
					<Link to="/mall" className="btn btn-ghost" style={{ marginBottom: "0.75rem" }}>
						← Back to mall directory
					</Link>
					{loading && <h1 className="app-hero-heading">Loading store…</h1>}
					{!loading && error && (
						<>
							<h1 className="app-hero-heading">Store unavailable.</h1>
							<p className="app-hero-subtitle" style={{ color: "#fca5a5" }}>
								{error}
							</p>
						</>
					)}
					{!loading && !error && details && (
						<>
							<div className="app-badge" aria-label="Store badge">
								<span className="app-badge-pill">●</span>
								{details.store.category} · {details.store.status === "open" ? "Open now" : "Closed"}
							</div>
							<h1 className="app-hero-heading">{details.store.name}</h1>
							<p className="app-hero-subtitle">
								Live footfall {details.store.current_footfall} visitors · Occupancy {" "}
								{details.store.current_occupancy_percent.toFixed(0)}% · Rating {" "}
								{details.store.average_rating.toFixed(1)}
							</p>
						</>
					)}
				</section>
				<aside>
					{!loading && !error && details && (
						<div className="app-card" aria-label="Store metrics">
							<div className="app-card-header">
								<h2 className="app-card-title">Today&apos;s performance</h2>
								<p className="app-card-subtitle">Indicative metrics for the current trading day.</p>
							</div>
							<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
								<li>Revenue: ${details.today_metrics.today_revenue.toFixed(2)}</li>
								<li>Transactions: {details.today_metrics.today_transactions}</li>
								<li>
									Conversion rate: {details.today_metrics.conversion_rate_percent.toFixed(1)}%
								</li>
							</ul>
						</div>
					)}
				</aside>
			</div>
			<div className="app-page-inner" style={{ marginTop: "1.5rem" }}>
				{!loading && !error && products.length > 0 && (
					<section>
						<h2>Featured products</h2>
						<table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Category</th>
									<th style={{ textAlign: "right" }}>Price</th>
								</tr>
							</thead>
							<tbody>
								{products.map((product) => (
									<tr key={product.id}>
										<td>{product.name}</td>
										<td>{product.category}</td>
										<td style={{ textAlign: "right" }}>${product.price.toFixed(2)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				)}
				{!loading && !error && !products.length && (
					<p style={{ color: "#9ca3af" }}>No products available for this store.</p>
				)}
			</div>
		</div>
	);
};
