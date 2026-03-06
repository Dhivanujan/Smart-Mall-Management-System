import React, { useEffect, useState } from "react";
import { loyaltyApi } from "@/services/api/loyalty";
import type { LoyaltyAccount, LoyaltyTransaction } from "@/types";

export const LoyaltyPage: React.FC = () => {
	const [account, setAccount] = useState<LoyaltyAccount | null>(null);
	const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
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
		} catch {
			// ignore
		} finally {
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
		} catch (err: any) {
			setMessage(err.response?.data?.detail ?? "Redemption failed");
		}
	};

	if (loading) return <div className="loading-spinner" />;

	const tierColors: Record<string, string> = {
		Bronze: "#cd7f32",
		Silver: "#c0c0c0",
		Gold: "#ffd700",
		Platinum: "#e5e4e2",
	};

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Loyalty & Rewards</h1>
				<p className="hero-subtitle">Earn points, unlock rewards, and track your loyalty journey</p>
			</div>

			{message && (
				<div className="alert-item alert-info" style={{ marginBottom: "1rem" }}>
					{message}
				</div>
			)}

			{account && (
				<>
					<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
						<div className="metric-card" style={{ borderColor: tierColors[account.tier] }}>
							<span className="metric-icon">🏆</span>
							<span className="metric-label">Current Tier</span>
							<span className="metric-value" style={{ color: tierColors[account.tier] }}>{account.tier}</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">⭐</span>
							<span className="metric-label">Available Points</span>
							<span className="metric-value" style={{ color: "var(--color-accent-strong)" }}>{account.total_points.toLocaleString()}</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">📈</span>
							<span className="metric-label">Lifetime Earned</span>
							<span className="metric-value">{account.lifetime_earned.toLocaleString()}</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">🎁</span>
							<span className="metric-label">Lifetime Redeemed</span>
							<span className="metric-value">{account.lifetime_redeemed.toLocaleString()}</span>
						</div>
					</div>

					<div className="section-card" style={{ marginTop: "2rem" }}>
						<h2 className="section-title">Tier Progress</h2>
						<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
							<span>Bronze (0)</span>
							<span>Silver (1K)</span>
							<span>Gold (5K)</span>
							<span>Platinum (10K)</span>
						</div>
						<div className="zone-bar" style={{ height: "12px" }}>
							<div
								className="zone-bar-fill"
								style={{
									width: `${Math.min((account.lifetime_earned / 10000) * 100, 100)}%`,
									background: `linear-gradient(90deg, #cd7f32, #c0c0c0, #ffd700, #e5e4e2)`,
								}}
							/>
						</div>
					</div>

					<div className="section-card" style={{ marginTop: "2rem" }}>
						<h2 className="section-title">Redeem Points</h2>
						<div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
							<div>
								<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Points</label>
								<input
									type="number"
									className="form-input"
									placeholder="e.g. 100"
									value={redeemAmount}
									onChange={(e) => setRedeemAmount(e.target.value)}
									min={1}
									max={account.total_points}
								/>
							</div>
							<div style={{ flex: 1, minWidth: "200px" }}>
								<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Description</label>
								<input
									type="text"
									className="form-input"
									placeholder="e.g. Discount on next purchase"
									value={redeemDesc}
									onChange={(e) => setRedeemDesc(e.target.value)}
								/>
							</div>
							<button className="btn btn-primary" onClick={handleRedeem}>
								Redeem
							</button>
						</div>
					</div>

					<div className="section-card" style={{ marginTop: "2rem" }}>
						<h2 className="section-title">Transaction History</h2>
						<div className="data-table-wrapper">
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
									{transactions.map((tx) => (
										<tr key={tx.id}>
											<td>
												<span style={{
													color: tx.transaction_type === "earn" ? "var(--color-success)" : "var(--color-danger)",
													fontWeight: 600,
												}}>
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
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
