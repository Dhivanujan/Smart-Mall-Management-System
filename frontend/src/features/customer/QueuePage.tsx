import React, { useEffect, useState, useCallback } from "react";
import { queuesApi } from "@/services/api/stores";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiClient } from "@/services/api/client";
import { 
    Ticket, MapPin, Clock, RefreshCcw, 
    Store, Users, Check, ArrowRight, AlertTriangle 
} from "lucide-react";
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
					<AlertTriangle className="w-5 h-5" />
					<span>{error}</span>
				</div>)}

			{queueInfo && (<div className="queue-token-panel">
					<div className="panel-header" style={{ marginBottom: "1.5rem" }}>
						<h2 className="panel-title flex items-center gap-2"><Ticket className="w-5 h-5 text-primary" /> Your Queue Token</h2>
						<span className={`live-indicator ${isConnected ? "connected" : "disconnected"}`}>
							<span className="pulse-dot"/>
							{isConnected ? "Live" : "Connecting..."}
						</span>
					</div>
					<div className="stat-grid">
						<div className="stat-card animate-fade-in-up stagger-1 border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.15)] relative overflow-hidden card-hover">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
							<span className="stat-card-icon text-primary bg-primary/20 p-2.5 rounded-xl animate-pulse"><Ticket className="w-6 h-6" /></span>
							<span className="stat-card-text relative z-10">
								<span className="stat-card-label font-bold text-primary uppercase tracking-wider text-xs">Your Token</span>
								<span className="token-number text-4xl font-black text-foreground drop-shadow-sm">#{queueInfo.token_number}</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-2 relative overflow-hidden card-hover">
							<span className="stat-card-icon bg-blue-500/20 text-blue-600 p-2.5 rounded-xl"><MapPin className="w-6 h-6" /></span>
							<span className="stat-card-text">
								<span className="stat-card-label font-bold uppercase tracking-wider text-xs text-muted-foreground">Position</span>
								<span className="stat-card-value text-3xl font-black">{queueInfo.position}</span>
							</span>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
                                <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: queueInfo.position > 10 ? '10%' : `${100 - (queueInfo.position * 10)}%` }}></div>
                            </div>
						</div>
						<div className="stat-card animate-fade-in-up stagger-3 card-hover">
							<span className="stat-card-icon bg-amber-500/20 text-amber-600 p-2.5 rounded-xl"><Clock className="w-6 h-6" /></span>
							<span className="stat-card-text">
								<span className="stat-card-label font-bold uppercase tracking-wider text-xs text-muted-foreground">Est. Wait</span>
								<span className="stat-card-value text-3xl font-black">{queueInfo.estimated_wait_minutes} min</span>
							</span>
						</div>
						<div className="stat-card animate-fade-in-up stagger-4 card-hover">
							<span className="stat-card-icon bg-green-500/20 text-green-600 p-2.5 rounded-xl"><RefreshCcw className="w-6 h-6" /></span>
							<span className="stat-card-text">
								<span className="stat-card-label font-bold uppercase tracking-wider text-xs text-muted-foreground">Now Serving</span>
								<span className="stat-card-value text-3xl font-black">#{currentServing ?? "—"}</span>
							</span>
						</div>
					</div>
				</div>)}

			<div className="panel">
				<div className="panel-header">
					<div>
						<h2 className="panel-title flex items-center gap-2"><Store className="w-5 h-5 text-purple-500" /> Available Stores</h2>
						<p className="panel-subtitle">
							{waitingCount > 0 ? `${waitingCount} people waiting across queues` : "Select a store to join its queue"}
						</p>
					</div>
				</div>
				<div className="store-grid">
					{stores.map((store) => (<div key={store.id} className="store-card card-hover flex flex-col justify-between h-full">
                            <div>
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
                                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                        <Users className="w-3.5 h-3.5" /> {store.current_footfall} visitors
                                    </span>
                                </div>
                            </div>
							<button className="btn btn-primary" style={{ marginTop: "1.25rem", width: "100%", padding: "0.6rem 1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }} onClick={() => handleJoinQueue(store.id)} disabled={loading || (queueInfo?.store_id === store.id)}>
								{queueInfo?.store_id === store.id ? <><Check className="w-4 h-4" /> Already in Queue</> : <>Join Queue <ArrowRight className="w-4 h-4" /></>}
							</button>
						</div>))}
				</div>
			</div>
		</div>);
};
