import React, { useEffect, useState } from "react";
import { loyaltyApi } from "@/services/api/loyalty";
import { 
    Trophy, Star, TrendingUp, Gift, 
    BarChart, History, Info, Inbox, ArrowRight 
} from "lucide-react";
export const LoyaltyPage = () => {
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [redeemAmount, setRedeemAmount] = useState("");
    const [redeemDesc, setRedeemDesc] = useState("");
    const [message, setMessage] = useState("");
    const fetchData = async () => {
        try {
            const [accRes, histRes] = await Promise.all([
                loyaltyApi.getAccount(),
                loyaltyApi.getHistory(20),
            ]);
            setAccount(accRes.data.account);
            setTransactions(histRes.data.transactions);
        }
        catch {
            // ignore
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);
    const handleRedeem = async () => {
        const pts = parseInt(redeemAmount, 10);
        if (!pts || pts <= 0 || !redeemDesc.trim()) {
            setMessage("Please enter valid points and description");
            return;
        }
        try {
            const res = await loyaltyApi.redeemPoints(pts, redeemDesc);
            setMessage(res.data.message);
            setRedeemAmount("");
            setRedeemDesc("");
            await fetchData();
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Redemption failed");
        }
    };
    if (loading)
        return <div className="loading-center"><div className="spinner"/><span className="spinner-text">Loading loyalty data…</span></div>;
    const tierColors = {
        Bronze: "#cd7f32",
        Silver: "#c0c0c0",
        Gold: "#ffd700",
        Platinum: "#e5e4e2",
    };
    const tierThresholds = [
        { name: "Bronze", pts: 0 },
        { name: "Silver", pts: 1000 },
        { name: "Gold", pts: 5000 },
        { name: "Platinum", pts: 10000 },
    ];
    return (<div className="customer-page">
			<div className="page-header">
				<h1 className="hero-heading">Loyalty & Rewards</h1>
				<p className="hero-subtitle">Earn points, unlock rewards, and track your loyalty journey</p>
			</div>

			{message && (<div className="message-banner info">
					<Info className="w-5 h-5" />
					<span>{message}</span>
				</div>)}

			{account && (<>
					<div className="stat-grid">
						<div className="stat-card animate-fade-in-up stagger-1 card-hover relative overflow-hidden" style={{ borderColor: `${tierColors[account.tier]}44` }}>
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${tierColors[account.tier]}, transparent 70%)` }}></div>
							<span className="stat-card-icon bg-amber-500/20 text-amber-600 p-2.5 rounded-xl"><Trophy className="w-6 h-6" /></span>
							<span className="stat-card-text relative z-10">
								<span className="stat-card-label font-semibold text-muted-foreground uppercase tracking-wider text-xs">Current Tier</span>
								<span className="stat-card-value text-3xl font-black" style={{ color: tierColors[account.tier] }}>{account.tier}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-2 card-hover">
							<span className="stat-card-icon bg-purple-500/20 text-purple-600 p-2.5 rounded-xl"><Star className="w-6 h-6" /></span>
							<span className="stat-card-text">
								<span className="stat-card-label font-semibold text-muted-foreground uppercase tracking-wider text-xs">Available Points</span>
								<span className="stat-card-value text-3xl font-black">{account.total_points.toLocaleString()}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-3 card-hover">
							<span className="stat-card-icon bg-green-500/20 text-green-600 p-2.5 rounded-xl"><TrendingUp className="w-6 h-6" /></span>
							<span className="stat-card-text">
								<span className="stat-card-label font-semibold text-muted-foreground uppercase tracking-wider text-xs">Lifetime Earned</span>
								<span className="stat-card-value text-3xl font-black">{account.lifetime_earned.toLocaleString()}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-4 card-hover">
							<span className="stat-card-icon bg-pink-500/20 text-pink-600 p-2.5 rounded-xl"><Gift className="w-6 h-6" /></span>
							<span className="stat-card-text">
								<span className="stat-card-label font-semibold text-muted-foreground uppercase tracking-wider text-xs">Lifetime Redeemed</span>
								<span className="stat-card-value text-3xl font-black">{account.lifetime_redeemed.toLocaleString()}</span>
							</span>
						</div>
					</div>

					<div className="panel">
						<h2 className="panel-title flex items-center gap-2"><BarChart className="w-5 h-5 text-blue-500" /> Tier Progress</h2>
						<div className="tier-progress-container">
							<div className="tier-progress-labels">
								{tierThresholds.map((t) => (<span key={t.name} className={`tier-label ${account.tier === t.name ? "active" : ""}`} style={account.tier === t.name ? { color: tierColors[t.name] } : undefined}>
										{t.name}
										<small>{t.pts > 0 ? `${(t.pts / 1000).toFixed(0)}K` : "0"}</small>
									</span>))}
							</div>
							<div className="zone-util-bar relative" style={{ marginTop: "0.5rem" }}>
                                <div className="absolute inset-0 blur-md opacity-30" style={{ background: tierColors[account.tier] }}></div>
								<div className="zone-util-track relative z-10 overflow-hidden bg-secondary/50" style={{ height: "10px" }}>
									<div className="zone-util-fill absolute inset-y-0 left-0 transition-all duration-1000 ease-out" style={{
                width: `${Math.min((account.lifetime_earned / 10000) * 100, 100)}%`,
                background: `linear-gradient(90deg, #cd7f32, #c0c0c0, #ffd700, #e5e4e2)`,
            }}/>
								</div>
							</div>
						</div>
					</div>

					<div className="panel">
						<h2 className="panel-title flex items-center gap-2"><Gift className="w-5 h-5 text-pink-500" /> Redeem Points</h2>
						<div className="reserve-form">
							<div className="form-group">
								<label className="form-label">Points to Redeem</label>
								<input type="number" className="form-control" placeholder="e.g. 100" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} min={1} max={account.total_points}/>
							</div>
							<div className="form-group" style={{ flex: 1, minWidth: "200px" }}>
								<label className="form-label">Description</label>
								<input type="text" className="form-control" placeholder="e.g. Discount on next purchase" value={redeemDesc} onChange={(e) => setRedeemDesc(e.target.value)}/>
							</div>
							<button className="btn btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }} onClick={handleRedeem}>
								Redeem Points <ArrowRight className="w-4 h-4" />
							</button>
						</div>
					</div>

					<div className="panel">
						<h2 className="panel-title flex items-center gap-2"><History className="w-5 h-5 text-emerald-500" /> Transaction History</h2>
						{transactions.length === 0 ? (<div className="empty-panel">
								<span className="empty-panel-icon"><Inbox className="w-12 h-12 text-muted-foreground" /></span>
								<p>No transactions yet</p>
							</div>) : (<div className="data-table-wrapper">
								<table className="data-table">
									<thead>
										<tr>
											<th>Type</th>
											<th>Points</th>
											<th>Description</th>
											<th>Date</th>
										</tr>
									</thead>
									<tbody>
										{transactions.map((tx) => (<tr key={tx.id} className="group">
												<td>
													<span className={`status-badge ${tx.transaction_type === "earn" ? "open" : "closed"}`}>
                                                        <span className="dot"/>
														{tx.transaction_type === "earn" ? "Earned" : "Redeemed"}
													</span>
												</td>
												<td style={{
                        color: tx.transaction_type === "earn" ? "var(--color-success)" : "var(--color-danger)",
                        fontWeight: 700,
                        fontSize: "1.1rem"
                    }}>
													{tx.transaction_type === "earn" ? "+" : "−"}{tx.points}
												</td>
												<td className="font-medium text-foreground">{tx.description}</td>
												<td className="text-sm font-medium text-muted-foreground">{new Date(tx.timestamp * 1000).toLocaleDateString()}</td>
											</tr>))}
									</tbody>
								</table>
							</div>)}
					</div>
				</>)}
		</div>);
};
