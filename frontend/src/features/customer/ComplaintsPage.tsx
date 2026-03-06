import React, { useEffect, useState } from "react";
import { complaintsApi } from "@/services/api/complaints";
import type { Complaint } from "@/types";

export const ComplaintsPage: React.FC = () => {
	const [complaints, setComplaints] = useState<Complaint[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState({ subject: "", description: "", store_id: "", category: "service" });
	const [message, setMessage] = useState("");

	const fetchComplaints = async () => {
		try {
			const res = await complaintsApi.getMyComplaints();
			setComplaints(res.data.complaints);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchComplaints();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.subject.trim() || !form.description.trim()) {
			setMessage("Subject and description are required");
			return;
		}
		try {
			await complaintsApi.createComplaint({
				subject: form.subject,
				description: form.description,
				store_id: form.store_id ? parseInt(form.store_id, 10) : undefined,
				category: form.category,
			});
			setMessage("Complaint submitted successfully");
			setShowForm(false);
			setForm({ subject: "", description: "", store_id: "", category: "service" });
			await fetchComplaints();
		} catch (err: any) {
			setMessage(err.response?.data?.detail ?? "Failed to submit complaint");
		}
	};

	const statusColors: Record<string, string> = {
		open: "#3498db",
		in_progress: "#f39c12",
		resolved: "#27ae60",
		escalated: "#e74c3c",
		closed: "#95a5a6",
	};

	if (loading) return <div className="loading-spinner" />;

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Complaints & Feedback</h1>
				<p className="hero-subtitle">Submit and track your complaints or feedback</p>
			</div>

			{message && (
				<div className="alert-item alert-info" style={{ marginBottom: "1rem" }}>
					{message}
				</div>
			)}

			<button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginBottom: "1.5rem" }}>
				{showForm ? "Cancel" : "+ New Complaint"}
			</button>

			{showForm && (
				<div className="section-card" style={{ marginBottom: "2rem" }}>
					<h2 className="section-title">Submit Complaint</h2>
					<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Category</label>
							<select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
								<option value="service">Service</option>
								<option value="cleanliness">Cleanliness</option>
								<option value="safety">Safety</option>
								<option value="facilities">Facilities</option>
								<option value="parking">Parking</option>
								<option value="other">Other</option>
							</select>
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Store ID (optional)</label>
							<input className="form-input" placeholder="Leave blank for general complaints" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} />
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Subject</label>
							<input className="form-input" placeholder="Brief subject of your complaint" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Description</label>
							<textarea className="form-input" rows={4} placeholder="Describe the issue in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ resize: "vertical" }} />
						</div>
						<button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Submit Complaint</button>
					</form>
				</div>
			)}

			{complaints.length === 0 ? (
				<div className="section-card" style={{ textAlign: "center", padding: "3rem" }}>
					<p style={{ fontSize: "1.2rem", color: "var(--color-text-muted)" }}>No complaints submitted yet</p>
				</div>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
					{complaints.map((c) => (
						<div key={c.id} className="section-card">
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
								<h3 style={{ margin: 0 }}>{c.subject}</h3>
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
							<p style={{ margin: "0 0 0.5rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{c.description}</p>
							<div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--color-text-muted)", flexWrap: "wrap" }}>
								<span>📁 {c.category}</span>
								{c.store_id && <span>🏪 Store #{c.store_id}</span>}
								{c.assigned_to && <span>👤 Assigned: {c.assigned_to}</span>}
								<span>📅 {new Date(c.created_at * 1000).toLocaleDateString()}</span>
						{c.updated_at && <span>✅ Updated: {new Date(c.updated_at * 1000).toLocaleDateString()}</span>}
							</div>
							{c.logs && c.logs.length > 0 && (
								<div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-primary)" }}>
									<h4 style={{ margin: "0 0 0.5rem", fontSize: "0.85rem" }}>Activity Log</h4>
									{c.logs.map((log, i) => (
										<div key={i} style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
										<span style={{ fontWeight: 600 }}>{log.author}</span> — {log.message} ({new Date(log.timestamp * 1000).toLocaleString()})
										</div>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
