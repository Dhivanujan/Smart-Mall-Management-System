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
				</div>) : (<div className="offer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{offers.map((offer) => (<div key={offer.id} className="offer-card bg-card border border-border p-6 rounded-2xl animate-fade-in-up card-hover group relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
							<div>
                                <div className="offer-card-header flex justify-between items-start mb-4 relative z-10">
                                    <h3 className="offer-card-title text-xl font-bold text-foreground group-hover:text-primary transition-colors pr-4">{offer.title}</h3>
                                    <span className={`discount-badge px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm whitespace-nowrap ${offer.discount_percent >= 50 ? "bg-gradient-to-r from-red-500 to-rose-600 text-white border-none" : offer.discount_percent >= 30 ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none" : "bg-primary text-primary-foreground border-none"}`}>
                                        {offer.discount_percent}% OFF
                                    </span>
                                </div>
                                <p className="offer-card-desc text-muted-foreground leading-relaxed mb-6 relative z-10">{offer.description}</p>
                            </div>
							<div className="relative z-10">
                                <div className="offer-meta flex flex-wrap gap-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-5">
                                    <span className="bg-secondary/50 px-2.5 py-1 rounded-md border border-border/50">🏪 Store #{offer.store_id}</span>
                                    {offer.end_time && <span className="bg-secondary/50 px-2.5 py-1 rounded-md border border-border/50 text-amber-600 dark:text-amber-500">⏰ {new Date(offer.end_time * 1000).toLocaleDateString()}</span>}
                                </div>
                                {offer.max_redemptions && (<div className="redemption-bar mb-6">
                                        <div className="redemption-bar-track bg-secondary overflow-hidden h-2 rounded-full mb-2">
                                            <div className="redemption-bar-fill bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-1000 ease-out" style={{ width: `${(offer.redemption_count / offer.max_redemptions) * 100}%` }}/>
                                        </div>
                                        <span className="redemption-bar-label text-xs font-semibold text-muted-foreground">{offer.redemption_count}/{offer.max_redemptions} claimed</span>
                                    </div>)}
                                <div className="offer-footer pt-4 border-t border-border/50">
                                    <button className="btn btn-primary w-full py-3 text-sm" onClick={() => handleRedeem(offer.id)}>
                                        Redeem Offer →
                                    </button>
                                </div>
                            </div>
						</div>))}
				</div>)}
		</div>);
};
