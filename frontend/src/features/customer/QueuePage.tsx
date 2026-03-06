import React, { useEffect, useState, useCallback } from "react";
import { queuesApi } from "@/services/api/stores";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { StoreSummary } from "@/types";
import { apiClient } from "@/services/api/client";

interface QueueInfo {
	store_id: number;
	token_number: number;
	position: number;
	estimated_wait_minutes: number;
}

export const QueuePage: React.FC = () => {
	const [stores, setStores] = useState<StoreSummary[]>([]);
	const [selectedStore, setSelectedStore] = useState<number | null>(null);
	const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
	const [queueState, setQueueState] = useState<Record<string, unknown> | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		apiClient.get("/api/v1/stores/").then((res) => {
			setStores(res.data.stores.filter((s: StoreSummary) => s.status === "open"));
		});
	}, []);

	const handleWsMessage = useCallback((data: unknown) => {
		setQueueState(data as Record<string, unknown>);
	}, []);

	const { isConnected } = useWebSocket({
		url: selectedStore ? `/ws/queues/${selectedStore}` : "",
		onMessage: handleWsMessage,
		autoConnect: !!selectedStore,
	});

	const refreshStatus = useCallback(async () => {
		if (!selectedStore) return;
		try {
			const params = queueInfo ? { token: queueInfo.token_number } : {};
			const res = await queuesApi.getStatus(selectedStore, params.token);
			setQueueState(res.data);
		} catch {
			// ignore
		}
	}, [selectedStore, queueInfo]);

	useEffect(() => {
		if (selectedStore) refreshStatus();
	}, [selectedStore, refreshStatus]);

	const handleJoinQueue = async (storeId: number) => {
		setLoading(true);
		setError("");
		try {
			const res = await queuesApi.joinQueue(storeId);
			setQueueInfo(res.data);
			setSelectedStore(storeId);
		} catch (err: any) {
			setError(err.response?.data?.detail ?? "Failed to join queue");
		} finally {
			setLoading(false);
		}
	};

	const currentServing = (queueState as any)?.current_token ?? (queueState as any)?.state?.current_token;
	const waitingCount = (queueState as any)?.state?.tokens?.filter((t: any) => t.status === "waiting")?.length ?? 0;

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Queue Management</h1>
				<p className="hero-subtitle">Join digital queues and track your position in real-time</p>
			</div>

			{error && (
				<div className="alert-item alert-critical" style={{ marginBottom: "1rem" }}>
					{error}
				</div>
			)}

			{queueInfo && (
				<div className="section-card" style={{ marginBottom: "2rem", borderColor: "var(--color-accent)" }}>
					<h2 className="section-title">Your Queue Token</h2>
					<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
						<div className="metric-card">
							<span className="metric-icon">🎫</span>
							<span className="metric-label">Your Token</span>
							<span className="metric-value" style={{ fontSize: "2rem", color: "var(--color-accent-strong)" }}>
								#{queueInfo.token_number}
							</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">📍</span>
							<span className="metric-label">Position</span>
							<span className="metric-value">{queueInfo.position}</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">⏱️</span>
							<span className="metric-label">Est. Wait</span>
							<span className="metric-value">{queueInfo.estimated_wait_minutes} min</span>
						</div>
						<div className="metric-card">
							<span className="metric-icon">🔄</span>
							<span className="metric-label">Now Serving</span>
							<span className="metric-value">#{currentServing ?? "—"}</span>
						</div>
					</div>
					<div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
						<span
							className={isConnected ? "live-dot" : ""}
							style={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								backgroundColor: isConnected ? "var(--color-success)" : "var(--color-danger)",
								display: "inline-block",
							}}
						/>
						<span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
							{isConnected ? "Live updates connected" : "Connecting..."}
						</span>
					</div>
				</div>
			)}

			<div className="section-card">
				<h2 className="section-title">Available Stores</h2>
				<p style={{ color: "var(--color-text-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
					{waitingCount > 0 ? `${waitingCount} people waiting across queues` : "Select a store to join its queue"}
				</p>
				<div className="store-grid">
					{stores.map((store) => (
						<div key={store.id} className="store-card">
							<div className="store-card-header">
								<h3>{store.name}</h3>
								<span className={`status-badge status-${store.status}`}>{store.status}</span>
							</div>
							<span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{store.category}</span>
							<div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
								<span style={{ fontSize: "0.85rem" }}>👥 Footfall: {store.current_footfall}</span>
							</div>
							<button
								className="btn btn-primary"
								style={{ marginTop: "0.75rem", width: "100%" }}
								onClick={() => handleJoinQueue(store.id)}
								disabled={loading || (queueInfo?.store_id === store.id)}
							>
								{queueInfo?.store_id === store.id ? "Already in Queue" : "Join Queue"}
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
