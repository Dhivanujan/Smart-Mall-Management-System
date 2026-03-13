import React, { useEffect, useState, useCallback } from "react";
import { queuesApi } from "@/services/api/stores";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiClient } from "@/services/api/client";
export const QueuePage = () => {
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [queueInfo, setQueueInfo] = useState(null);
    const [queueState, setQueueState] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        apiClient.get("/api/v1/stores/").then((res) => {
            setStores(res.data.stores.filter((s) => s.status === "open"));
        });
    }, []);
    const handleWsMessage = useCallback((data) => {
        setQueueState(data);
    }, []);
    const { isConnected } = useWebSocket({
        url: selectedStore ? `/ws/queues/${selectedStore}` : "",
        onMessage: handleWsMessage,
        autoConnect: !!selectedStore,
    });
    const refreshStatus = useCallback(async () => {
        if (!selectedStore)
            return;
        try {
            const params = queueInfo ? { token: queueInfo.token_number } : {};
            const res = await queuesApi.getStatus(selectedStore, params.token);
            setQueueState(res.data);
        }
        catch {
            // ignore
        }
    }, [selectedStore, queueInfo]);
    useEffect(() => {
        if (selectedStore)
            refreshStatus();
    }, [selectedStore, refreshStatus]);
    const handleJoinQueue = async (storeId) => {
        setLoading(true);
        setError("");
        try {
            const res = await queuesApi.joinQueue(storeId);
            setQueueInfo(res.data);
            setSelectedStore(storeId);
        }
        catch (err) {
            setError(err.response?.data?.detail ?? "Failed to join queue");
        }
        finally {
            setLoading(false);
        }
    };
    const currentServing = queueState?.current_token ?? queueState?.state?.current_token;
    const waitingCount = queueState?.state?.tokens?.filter((t) => t.status === "waiting")?.length ?? 0;
    return (<div className="customer-page">
			<div className="page-header">
				<h1 className="hero-heading">Queue Management</h1>
				<p className="hero-subtitle">Join digital queues and track your position in real-time</p>
			</div>

			{error && (<div className="message-banner error">
					<span>⚠️</span>
					<span>{error}</span>
				</div>)}

			{queueInfo && (<div className="queue-token-panel">
					<div className="panel-header" style={{ marginBottom: "1.5rem" }}>
						<h2 className="panel-title">🎫 Your Queue Token</h2>
						<span className={`live-indicator ${isConnected ? "connected" : "disconnected"}`}>
							<span className="pulse-dot"/>
							{isConnected ? "Live" : "Connecting..."}
						</span>
					</div>
					<div className="stat-grid">
						<div className="stat-card animate-fade-in-up stagger-1">
							<span className="stat-card-icon purple">🎫</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Your Token</span>
								<span className="token-number">#{queueInfo.token_number}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-2">
							<span className="stat-card-icon blue">📍</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Position</span>
								<span className="stat-card-value">{queueInfo.position}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-3">
							<span className="stat-card-icon amber">⏱️</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Est. Wait</span>
								<span className="stat-card-value">{queueInfo.estimated_wait_minutes} min</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-4">
							<span className="stat-card-icon green">🔄</span>
							<span className="stat-card-text">
								<span className="stat-card-label">Now Serving</span>
								<span className="stat-card-value">#{currentServing ?? "—"}</span>
							</span>
						</div>
					</div>
				</div>)}

			<div className="panel">
				<div className="panel-header">
					<div>
						<h2 className="panel-title">🏪 Available Stores</h2>
						<p className="panel-subtitle">
							{waitingCount > 0 ? `${waitingCount} people waiting across queues` : "Select a store to join its queue"}
						</p>
					</div>
				</div>
				<div className="store-grid">
					{stores.map((store) => (<div key={store.id} className="store-card">
							<div className="store-card-header">
								<h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{store.name}</h3>
								<span className={`status-badge ${store.status}`}>
									<span className="dot"/>
									{store.status}
								</span>
							</div>
							<span style={{ color: "var(--color-text-dim)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
								{store.category}
							</span>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
								<span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>👥 {store.current_footfall} visitors</span>
							</div>
							<button className="btn btn-primary" style={{ marginTop: "1rem", width: "100%" }} onClick={() => handleJoinQueue(store.id)} disabled={loading || (queueInfo?.store_id === store.id)}>
								{queueInfo?.store_id === store.id ? "✓ Already in Queue" : "Join Queue →"}
							</button>
						</div>))}
				</div>
			</div>
		</div>);
};
