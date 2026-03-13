import React, { useEffect, useState } from "react";
import { offersApi } from "@/services/api/offers";
export const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    useEffect(() => {
        offersApi.listActive().then((res) => {
            setOffers(res.data.offers ?? res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);
    const handleRedeem = async (offerId) => {
        try {
            const res = await offersApi.redeemOffer(offerId);
            setMessage(res.data.message ?? "Offer redeemed!");
            const updated = await offersApi.listActive();
            setOffers(updated.data.offers ?? updated.data);
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Failed to redeem offer");
        }
    };
    if (loading)
        return <div className="loading-center"><div className="spinner"/><span className="spinner-text">Loading offers…</span></div>;
    return (<div className="customer-page">
			<div className="page-header">
				<h1 className="hero-heading">Offers & Deals</h1>
				<p className="hero-subtitle">Browse active promotions and exclusive deals from mall stores</p>
			</div>

			{message && (<div className="message-banner success">
					<span>✅</span>
					<span>{message}</span>
				</div>)}

			{offers.length === 0 ? (<div className="empty-panel">
					<span className="empty-panel-icon">🏷️</span>
					<p>No active offers right now. Check back soon!</p>
				</div>) : (<div className="offer-grid">
					{offers.map((offer) => (<div key={offer.id} className="offer-card animate-fade-in-up">
							<div className="offer-card-header">
								<h3 className="offer-card-title">{offer.title}</h3>
								<span className={`discount-badge ${offer.discount_percent >= 50 ? "hot" : offer.discount_percent >= 30 ? "great" : ""}`}>
									{offer.discount_percent}% OFF
								</span>
							</div>
							<p className="offer-card-desc">{offer.description}</p>
							<div className="offer-meta">
								<span>🏪 Store #{offer.store_id}</span>
								{offer.end_time && <span>⏰ {new Date(offer.end_time * 1000).toLocaleDateString()}</span>}
							</div>
							{offer.max_redemptions && (<div className="redemption-bar">
									<div className="redemption-bar-track">
										<div className="redemption-bar-fill" style={{ width: `${(offer.redemption_count / offer.max_redemptions) * 100}%` }}/>
									</div>
									<span className="redemption-bar-label">{offer.redemption_count}/{offer.max_redemptions} claimed</span>
								</div>)}
							<div className="offer-footer">
								<span className="discount-value">{offer.discount_percent}%</span>
								<button className="btn btn-primary" onClick={() => handleRedeem(offer.id)}>
									Redeem Offer →
								</button>
							</div>
						</div>))}
				</div>)}
		</div>);
};
