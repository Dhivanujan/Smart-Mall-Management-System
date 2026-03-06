import React, { useEffect, useState } from "react";
import { offersApi } from "@/services/api/offers";
import type { Offer } from "@/types";

export const OffersPage: React.FC = () => {
	const [offers, setOffers] = useState<Offer[]>([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");

	useEffect(() => {
		offersApi.listActive().then((res) => {
			setOffers(res.data.offers ?? res.data);
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);

	const handleRedeem = async (offerId: number) => {
		try {
			const res = await offersApi.redeemOffer(offerId);
			setMessage(res.data.message ?? "Offer redeemed!");
			const updated = await offersApi.listActive();
			setOffers(updated.data.offers ?? updated.data);
		} catch (err: any) {
			setMessage(err.response?.data?.detail ?? "Failed to redeem offer");
		}
	};

	if (loading) return <div className="loading-spinner" />;

	const discountColor = (percent: number) => {
		if (percent >= 50) return "#e74c3c";
		if (percent >= 30) return "#e67e22";
		if (percent >= 15) return "#8e44ad";
		return "#27ae60";
	};

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Offers & Deals</h1>
				<p className="hero-subtitle">Browse active promotions and exclusive deals from mall stores</p>
			</div>

			{message && (
				<div className="alert-item alert-info" style={{ marginBottom: "1rem" }}>
					{message}
				</div>
			)}

			{offers.length === 0 ? (
				<div className="section-card" style={{ textAlign: "center", padding: "3rem" }}>
					<p style={{ fontSize: "1.2rem", color: "var(--color-text-muted)" }}>No active offers right now. Check back soon!</p>
				</div>
			) : (
				<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
					{offers.map((offer) => (
						<div key={offer.id} className="section-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
								<h3 style={{ margin: 0, fontSize: "1.1rem" }}>{offer.title}</h3>
								<span style={{
									background: discountColor(offer.discount_percent),
									color: "#fff",
									padding: "0.2rem 0.5rem",
									borderRadius: "4px",
									fontSize: "0.75rem",
									fontWeight: 600,
									textTransform: "uppercase",
								}}>
									{offer.discount_percent}% OFF
								</span>
							</div>
							<p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{offer.description}</p>
							<div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
								<span>🏪 Store #{offer.store_id}</span>
								{offer.end_time && <span>⏰ Ends: {new Date(offer.end_time * 1000).toLocaleDateString()}</span>}
							</div>
							<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
							<span style={{ fontSize: "1.5rem", fontWeight: 700, color: discountColor(offer.discount_percent) }}>
								{offer.discount_percent}% OFF
								</span>
								<button className="btn btn-primary" onClick={() => handleRedeem(offer.id)}>
									Redeem
								</button>
							</div>
							{offer.max_redemptions && (
								<div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
									{offer.redemption_count}/{offer.max_redemptions} redeemed
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
