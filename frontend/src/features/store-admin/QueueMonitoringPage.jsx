import React, { useEffect, useState, useCallback } from "react";
import { queuesApi } from "@/services/api/stores";
import { useWebSocket } from "@/hooks/useWebSocket";
export const QueueMonitoringPage = () => {
    const [storeId, setStoreId] = useState(1);
    const [queue, setQueue] = useState([]);
    const [currentServing, setCurrentServing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const wsUrl = `/ws/queues/${storeId}`;
    const { lastMessage, isConnected } = useWebSocket({ url: wsUrl });
    const fetchQueue = useCallback(async () => {
        try {
            const res = await queuesApi.getQueue(storeId);
            const state = res.data.queue;
            setQueue(state?.tokens ?? []);
            setCurrentServing(state?.current_token ?? null);
        }
        catch {
            setQueue([]);
        }
        finally {
            setLoading(false);
        }
    }, [storeId]);
    useEffect(() => {
        setLoading(true);
        fetchQueue();
    }, [storeId, fetchQueue]);
    useEffect(() => {
        if (lastMessage) {
            fetchQueue();
        }
    }, [lastMessage, fetchQueue]);
    const handleServeNext = async () => {
        try {
            const res = await queuesApi.adminNext(storeId);
            const state = res.data.queue;
            setQueue(state?.tokens ?? []);
            setCurrentServing(state?.current_token ?? null);
            setMessage("Moved to next customer");
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Failed to advance queue");
        }
    };
    const handleSkip = async () => {
        try {
            const res = await queuesApi.adminSkip(storeId);
            const state = res.data.queue;
            setQueue(state?.tokens ?? []);
            setCurrentServing(state?.current_token ?? null);
            setMessage("Current token skipped");
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Failed to skip token");
        }
    };
    if (loading)
        return <div className="loading-spinner"/>;
    const waiting = queue.filter((e) => e.status === "waiting");
    const waitingCount = waiting.length;
    const avgWait = waitingCount > 0 ? Math.round(waitingCount * 2.5) : 0;
    return (<div className="panel-page">
			<div className="page-header">
				<h1 className="hero-heading">Queue Monitoring</h1>
				<p className="hero-subtitle">Monitor and control your store's queue in real-time</p>
			</div>

			{message && <div className="alert-item alert-info" style={{ marginBottom: "1rem" }}>{message}</div>}

			<div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
				<label style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Store:</label>
				<select className="form-input" value={storeId} onChange={(e) => setStoreId(parseInt(e.target.value, 10))} style={{ width: "auto" }}>
					{Array.from({ length: 10 }, (_, i) => (<option key={i} value={i + 1}>Store {i + 1}</option>))}
				</select>
				<span style={{
            marginLeft: "auto",
            display: "flex", alignItems: "center", gap: "0.5rem",
            fontSize: "0.85rem", color: isConnected ? "var(--color-success)" : "var(--color-danger)",
        }}>
					<span style={{ width: 8, height: 8, borderRadius: "50%", background: isConnected ? "var(--color-success)" : "var(--color-danger)" }}/>
					{isConnected ? "Live" : "Disconnected"}
				</span>
			</div>

			<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: "2rem" }}>
				<div className="metric-card">
					<span className="metric-icon">🎫</span>
					<span className="metric-label">Now Serving</span>
					<span className="metric-value" style={{ color: "var(--color-accent-strong)" }}>
						{currentServing ? `#${currentServing}` : "—"}
					</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">👥</span>
					<span className="metric-label">In Queue</span>
					<span className="metric-value">{waitingCount}</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">⏱️</span>
					<span className="metric-label">Avg Wait</span>
					<span className="metric-value">{avgWait}m</span>
				</div>
				<div className="metric-card">
					<span className="metric-icon">📊</span>
					<span className="metric-label">Total Served</span>
					<span className="metric-value">{queue.filter((e) => e.status === "served").length}</span>
				</div>
			</div>

			<div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
				<button className="btn btn-primary" onClick={handleServeNext}>
					Serve Next ➡️
				</button>
				<button className="btn btn-ghost" onClick={handleSkip}>
					Skip Token
				</button>
				<button className="btn" onClick={fetchQueue}>
					Refresh
				</button>
			</div>

			<div className="data-table-wrapper">
				<table className="data-table">
					<thead>
						<tr>
							<th>Token</th>
							<th>Customer</th>
							<th>Position</th>
							<th>Est. Wait</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{queue.map((entry) => (<tr key={entry.token_number} style={{
                background: entry.status === "serving" ? "rgba(46, 204, 113, 0.1)" : undefined,
            }}>
								<td style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--color-accent-strong)" }}>
									#{entry.token_number}
								</td>
								<td>Customer #{entry.token_number}</td>
								<td>{entry.status === "waiting" ? "Waiting" : entry.status === "serving" ? "Now" : "Done"}</td>
								<td>{entry.status === "waiting" ? `~${Math.max((waiting.findIndex((w) => w.token_number === entry.token_number) + 1), 1) * 5}m` : "-"}</td>
								<td>
									<span style={{
                color: entry.status === "serving" ? "var(--color-success)" :
                    entry.status === "served" ? "var(--color-text-muted)" : "var(--color-accent-strong)",
                fontWeight: 600,
                textTransform: "uppercase",
            }}>
										{entry.status}
									</span>
								</td>
							</tr>))}
					</tbody>
				</table>
			</div>
		</div>);
};
