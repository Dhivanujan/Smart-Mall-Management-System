import React, { useEffect, useState } from "react";
import { loyaltyApi } from "@/services/api/loyalty";
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
					<span>ℹ️</span>
					<span>{message}</span>
				</div>)}

			{account && (<>
					<div className="stat-grid">
						<div className="stat-card animate-fade-in-up stagger-1" style={{ borderColor: `${tierColors[account.tier]}44` }}>
							<span className="stat-card-icon amber">🏆</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Current Tier</span>
								<span className="stat-card-value" style={{ color: tierColors[account.tier] }}>{account.tier}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-2">
							<span className="stat-card-icon purple">⭐</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Available Points</span>
								<span className="stat-card-value">{account.total_points.toLocaleString()}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-3">
							<span className="stat-card-icon green">📈</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Lifetime Earned</span>
								<span className="stat-card-value">{account.lifetime_earned.toLocaleString()}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-4">
							<span className="stat-card-icon pink">🎁</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Lifetime Redeemed</span>
								<span className="stat-card-value">{account.lifetime_redeemed.toLocaleString()}</span>
							</span>
						</div>
					</div>

					<div className="panel">
						<h2 className="panel-title">📊 Tier Progress</h2>
						<div className="tier-progress-container">
							<div className="tier-progress-labels">
								{tierThresholds.map((t) => (<span key={t.name} className={`tier-label ${account.tier === t.name ? "active" : ""}`} style={account.tier === t.name ? { color: tierColors[t.name] } : undefined}>
										{t.name}
										<small>{t.pts > 0 ? `${(t.pts / 1000).toFixed(0)}K` : "0"}</small>
									</span>))}
							</div>
							<div className="zone-util-bar" style={{ marginTop: "0.5rem" }}>
								<div className="zone-util-track" style={{ height: "10px" }}>
									<div className="zone-util-fill" style={{
                width: `${Math.min((account.lifetime_earned / 10000) * 100, 100)}%`,
                background: `linear-gradient(90deg, #cd7f32, #c0c0c0, #ffd700, #e5e4e2)`,
            }}/>
								</div>
							</div>
						</div>
					</div>

					<div className="panel">
						<h2 className="panel-title">🎁 Redeem Points</h2>
						<div className="reserve-form">
							<div className="form-group">
								<label className="form-label">Points to Redeem</label>
								<input type="number" className="form-control" placeholder="e.g. 100" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} min={1} max={account.total_points}/>
							</div>
							<div className="form-group" style={{ flex: 1, minWidth: "200px" }}>
								<label className="form-label">Description</label>
								<input type="text" className="form-control" placeholder="e.g. Discount on next purchase" value={redeemDesc} onChange={(e) => setRedeemDesc(e.target.value)}/>
							</div>
							<button className="btn btn-primary" onClick={handleRedeem}>
								Redeem Points →
							</button>
						</div>
					</div>

					<div className="panel">
						<h2 className="panel-title">📋 Transaction History</h2>
						{transactions.length === 0 ? (<div className="empty-panel">
								<span className="empty-panel-icon">📭</span>
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
										{transactions.map((tx) => (<tr key={tx.id}>
												<td>
													<span className={`complaint-status-badge ${tx.transaction_type === "earn" ? "resolved" : "pending"}`}>
														{tx.transaction_type === "earn" ? "+" : "−"} {tx.transaction_type.toUpperCase()}
													</span>
												</td>
												<td style={{
                        color: tx.transaction_type === "earn" ? "var(--color-success)" : "var(--color-danger)",
                        fontWeight: 600,
                    }}>
													{tx.transaction_type === "earn" ? "+" : "−"}{tx.points}
												</td>
												<td>{tx.description}</td>
												<td style={{ color: "var(--color-text-muted)" }}>{new Date(tx.timestamp * 1000).toLocaleDateString()}</td>
											</tr>))}
									</tbody>
								</table>
							</div>)}
					</div>
				</>)}
		</div>);
};
