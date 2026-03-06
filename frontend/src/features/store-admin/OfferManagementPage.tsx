import React, { useEffect, useState } from "react";
import { offersApi } from "@/services/api/offers";
import type { Offer } from "@/types";

export const OfferManagementPage: React.FC = () => {
	const [offers, setOffers] = useState<Offer[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editId, setEditId] = useState<number | null>(null);
	const [message, setMessage] = useState("");
	const [form, setForm] = useState({
		title: "", description: "", store_id: 1,
		discount_percent: "",
		max_redemptions: "", end_time: "",
	});

	const fetchOffers = async () => {
		try {
			const res = await offersApi.listActive();
			setOffers(res.data.offers ?? res.data);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchOffers(); }, []);

	const resetForm = () => {
		setForm({ title: "", description: "", store_id: 1, discount_percent: "", max_redemptions: "", end_time: "" });
		setEditId(null);
		setShowForm(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const payload: any = {
			title: form.title,
			description: form.description,
			store_id: form.store_id,
			discount_percent: parseFloat(form.discount_percent),
		};
		if (form.max_redemptions) payload.max_redemptions = parseInt(form.max_redemptions, 10);
		if (form.end_time) payload.end_time = new Date(form.end_time).getTime() / 1000;

		try {
			if (editId) {
				await offersApi.adminUpdate(editId, payload);
				setMessage("Offer updated successfully");
			} else {
				await offersApi.adminCreate(payload);
				setMessage("Offer created successfully");
			}
			resetForm();
			await fetchOffers();
		} catch (err: any) {
			setMessage(err.response?.data?.detail ?? "Operation failed");
		}
	};

	const handleEdit = (offer: Offer) => {
		setForm({
			title: offer.title,
			description: offer.description,
			store_id: offer.store_id,
			discount_percent: offer.discount_percent.toString(),
			max_redemptions: offer.max_redemptions?.toString() ?? "",
			end_time: offer.end_time ? new Date(offer.end_time * 1000).toISOString().slice(0, 16) : "",
		});
		setEditId(offer.id);
		setShowForm(true);
	};

	const handleDelete = async (id: number) => {
		try {
			await offersApi.adminDelete(id);
			setMessage("Offer deleted");
			await fetchOffers();
		} catch (err: any) {
			setMessage(err.response?.data?.detail ?? "Delete failed");
		}
	};

	if (loading) return <div className="loading-spinner" />;

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">Offer Management</h1>
				<p className="hero-subtitle">Create and manage store promotions and deals</p>
			</div>

			{message && <div className="alert-item alert-info" style={{ marginBottom: "1rem" }}>{message}</div>}

			<button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ marginBottom: "1.5rem" }}>
				{showForm && !editId ? "Cancel" : "+ Create Offer"}
			</button>

			{showForm && (
				<div className="section-card" style={{ marginBottom: "2rem" }}>
					<h2 className="section-title">{editId ? "Edit Offer" : "Create Offer"}</h2>
					<form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Title</label>
							<input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Store</label>
							<select className="form-input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: parseInt(e.target.value, 10) })}>
								{Array.from({ length: 10 }, (_, i) => (
									<option key={i} value={i + 1}>Store {i + 1}</option>
								))}
							</select>
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Discount Percent</label>
							<input className="form-input" type="number" step="0.01" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} required />
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Max Redemptions (optional)</label>
							<input className="form-input" type="number" value={form.max_redemptions} onChange={(e) => setForm({ ...form, max_redemptions: e.target.value })} />
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>End Date (optional)</label>
							<input className="form-input" type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
						</div>
						<div style={{ gridColumn: "1 / -1" }}>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Description</label>
							<textarea className="form-input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ resize: "vertical" }} />
						</div>
						<div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.5rem" }}>
							<button type="submit" className="btn btn-primary">{editId ? "Update" : "Create"}</button>
							<button type="button" className="btn" onClick={resetForm}>Cancel</button>
						</div>
					</form>
				</div>
			)}

			<div className="data-table-wrapper">
				<table className="data-table">
					<thead>
						<tr>
							<th>Title</th>
							<th>Store</th>
							<th>Discount</th>
							<th>Redemptions</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{offers.map((o) => (
							<tr key={o.id}>
								<td style={{ fontWeight: 600 }}>{o.title}</td>
								<td>{o.store_id}</td>
							<td>{o.discount_percent}%</td>
							<td>{o.redemption_count}{o.max_redemptions ? `/${o.max_redemptions}` : ""}</td>
								<td>
									<span style={{ color: o.status === "active" ? "var(--color-success)" : "var(--color-text-muted)", fontWeight: 600 }}>
										{o.status.toUpperCase()}
									</span>
								</td>
								<td>
									<div style={{ display: "flex", gap: "0.5rem" }}>
										<button className="btn" style={{ fontSize: "0.8rem" }} onClick={() => handleEdit(o)}>Edit</button>
										<button className="btn" style={{ fontSize: "0.8rem", color: "var(--color-danger)" }} onClick={() => handleDelete(o.id)}>Delete</button>									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
