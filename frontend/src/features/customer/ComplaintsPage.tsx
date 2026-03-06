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

	if (loading) return <div className="loading-center"><div className="spinner" /><span className="spinner-text">Loading complaints…</span></div>;

	return (
		<div className="customer-page">
			<div className="page-header">
				<h1 className="hero-heading">Complaints & Feedback</h1>
				<p className="hero-subtitle">Submit and track your complaints or feedback</p>
			</div>

			{message && (
				<div className="message-banner info">
					<span>ℹ️</span>
					<span>{message}</span>
				</div>
			)}

			<button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginBottom: "1.5rem" }}>
				{showForm ? "✕ Cancel" : "+ New Complaint"}
			</button>

			{showForm && (
				<div className="panel" style={{ marginBottom: "2rem" }}>
					<h2 className="panel-title">📝 Submit Complaint</h2>
					<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
						<div className="form-group">
							<label className="form-label">Category</label>
							<select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
								<option value="service">Service</option>
								<option value="cleanliness">Cleanliness</option>
								<option value="safety">Safety</option>
								<option value="facilities">Facilities</option>
								<option value="parking">Parking</option>
								<option value="other">Other</option>
							</select>
						</div>
						<div className="form-group">
							<label className="form-label">Store ID (optional)</label>
							<input className="form-control" placeholder="Leave blank for general complaints" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} />
						</div>
						<div className="form-group">
							<label className="form-label">Subject</label>
							<input className="form-control" placeholder="Brief subject of your complaint" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
						</div>
						<div className="form-group">
							<label className="form-label">Description</label>
							<textarea className="form-control" rows={4} placeholder="Describe the issue in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ resize: "vertical" }} />
						</div>
						<button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Submit Complaint →</button>
					</form>
				</div>
			)}

			{complaints.length === 0 ? (
				<div className="empty-panel">
					<span className="empty-panel-icon">📭</span>
					<p>No complaints submitted yet</p>
				</div>
			) : (
				<div className="complaint-list">
					{complaints.map((c) => (
						<div key={c.id} className="complaint-item animate-fade-in-up">
							<div className="complaint-item-header">
								<h3 className="complaint-item-subject">{c.subject}</h3>
								<span className={`complaint-status-badge ${c.status.replace("_", "-")}`}>
									{c.status.replace("_", " ")}
								</span>
							</div>
							<p className="complaint-item-desc">{c.description}</p>
							<div className="complaint-meta">
								<span>📁 {c.category}</span>
								{c.store_id && <span>🏪 Store #{c.store_id}</span>}
								{c.assigned_to && <span>👤 {c.assigned_to}</span>}
								<span>📅 {new Date(c.created_at * 1000).toLocaleDateString()}</span>
								{c.updated_at && <span>🔄 {new Date(c.updated_at * 1000).toLocaleDateString()}</span>}
							</div>
							{c.logs && c.logs.length > 0 && (
								<div className="complaint-logs">
									<h4 className="complaint-logs-title">Activity Log</h4>
									{c.logs.map((log, i) => (
										<div key={i} className="complaint-log-entry">
											<span className="complaint-log-author">{log.author}</span>
											<span className="complaint-log-message">{log.message}</span>
											<span className="complaint-log-time">{new Date(log.timestamp * 1000).toLocaleString()}</span>
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
