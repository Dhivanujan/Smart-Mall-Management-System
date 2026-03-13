import React, { useEffect, useState } from "react";
import { complaintsApi } from "@/services/api/complaints";
export const ComplaintManagementPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [filter, setFilter] = useState("all");
    const fetchComplaints = async () => {
        try {
            const res = await complaintsApi.adminListAll(filter === "all" ? undefined : filter);
            setComplaints(res.data.complaints);
        }
        catch {
            // ignore
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        setLoading(true);
        fetchComplaints();
    }, [filter]);
    const handleStatusChange = async (id, status) => {
        try {
            await complaintsApi.adminUpdateStatus(id, status);
            setMessage(`Complaint status updated to ${status}`);
            await fetchComplaints();
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Update failed");
        }
    };
    const handleEscalate = async (id) => {
        try {
            await complaintsApi.adminEscalate(id);
            setMessage("Complaint escalated");
            await fetchComplaints();
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Escalation failed");
        }
    };
    const statusColors = {
        open: "#3498db",
        in_progress: "#f39c12",
        resolved: "#27ae60",
        escalated: "#e74c3c",
        closed: "#95a5a6",
    };
    if (loading)
        return <div className="loading-spinner"/>;
    const statusCounts = complaints.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {});
    return (<div className="panel-page">
			<div className="page-header">
				<h1 className="hero-heading">Complaint Management</h1>
				<p className="hero-subtitle">Review, assign, and resolve customer complaints across the mall</p>
			</div>

			{message && <div className="alert-item alert-info" style={{ marginBottom: "1rem" }}>{message}</div>}

			<div className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginBottom: "1.5rem" }}>
				{Object.entries(statusColors).map(([status, color]) => (<div key={status} className="metric-card" style={{ cursor: "pointer", borderColor: filter === status ? color : undefined }} onClick={() => setFilter(filter === status ? "all" : status)}>
						<span className="metric-label" style={{ textTransform: "capitalize" }}>{status.replace("_", " ")}</span>
						<span className="metric-value" style={{ color }}>{statusCounts[status] || 0}</span>
					</div>))}
			</div>

			<div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
				<button className={`btn ${filter === "all" ? "btn-primary" : ""}`} onClick={() => setFilter("all")}>All</button>
				{Object.keys(statusColors).map((s) => (<button key={s} className={`btn ${filter === s ? "btn-primary" : ""}`} onClick={() => setFilter(s)} style={{ textTransform: "capitalize" }}>
						{s.replace("_", " ")}
					</button>))}
			</div>

			{complaints.length === 0 ? (<div className="section-card" style={{ textAlign: "center", padding: "3rem" }}>
					<p style={{ color: "var(--color-text-muted)" }}>No complaints found for this filter</p>
				</div>) : (<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
					{complaints.map((c) => (<div key={c.id} className="section-card">
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
								<div>
									<h3 style={{ margin: 0 }}>{c.subject}</h3>
									<span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
										by {c.username} • {c.category} • {new Date(c.created_at * 1000).toLocaleDateString()}
									</span>
								</div>
								<span style={{
                    background: statusColors[c.status] || "#95a5a6",
                    color: "#fff",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                }}>
									{c.status.replace("_", " ")}
								</span>
							</div>
							<p style={{ margin: "0 0 0.75rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{c.description}</p>
							<div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
								{c.status === "open" && (<button className="btn" style={{ fontSize: "0.8rem" }} onClick={() => handleStatusChange(c.id, "in_progress")}>
										Start Working
									</button>)}
								{(c.status === "in_progress" || c.status === "open") && (<>
										<button className="btn" style={{ fontSize: "0.8rem", color: "var(--color-success)" }} onClick={() => handleStatusChange(c.id, "resolved")}>
											Resolve
										</button>
										<button className="btn" style={{ fontSize: "0.8rem", color: "var(--color-danger)" }} onClick={() => handleEscalate(c.id)}>
											Escalate
										</button>
									</>)}
								{c.status === "resolved" && (<button className="btn" style={{ fontSize: "0.8rem" }} onClick={() => handleStatusChange(c.id, "closed")}>
										Close
									</button>)}
							</div>
						</div>))}
				</div>)}
		</div>);
};
