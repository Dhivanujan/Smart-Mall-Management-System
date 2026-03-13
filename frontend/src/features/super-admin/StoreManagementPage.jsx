import React, { useEffect, useState } from "react";
import { storesApi } from "@/services/api/stores";
export const StoreManagementPage = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");
    const [form, setForm] = useState({ name: "", category: "", description: "" });
    const fetchStores = async () => {
        try {
            const res = await storesApi.list();
            setStores(res.data.stores ?? res.data);
        }
        catch {
            // ignore
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchStores(); }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await storesApi.adminCreate(form);
            setMessage("Store created successfully");
            setShowForm(false);
            setForm({ name: "", category: "", description: "" });
            await fetchStores();
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Failed to create store");
        }
    };
    const handleDelete = async (storeId) => {
        try {
            await storesApi.adminRemove(storeId);
            setMessage("Store deleted");
            await fetchStores();
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Failed to delete store");
        }
    };
    if (loading)
        return <div className="loading-spinner"/>;
    return (<div className="panel-page">
			<div className="page-header">
				<h1 className="hero-heading">Store Management</h1>
				<p className="hero-subtitle">Manage all mall stores — create, update, and remove tenants</p>
			</div>

			{message && <div className="alert-item alert-info" style={{ marginBottom: "1rem" }}>{message}</div>}

			<button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginBottom: "1.5rem" }}>
				{showForm ? "Cancel" : "+ Add Store"}
			</button>

			{showForm && (<div className="section-card" style={{ marginBottom: "2rem" }}>
					<h2 className="section-title">Create New Store</h2>
					<form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Name</label>
							<input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required/>
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Category</label>
							<input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required/>
						</div>
						<div style={{ gridColumn: "1 / -1" }}>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Description</label>
							<textarea className="form-input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ resize: "vertical" }}/>
						</div>
						<button type="submit" className="btn btn-primary" style={{ gridColumn: "1 / -1", justifySelf: "start" }}>Create Store</button>
					</form>
				</div>)}

			<div className="data-table-wrapper">
				<table className="data-table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Name</th>
							<th>Category</th>
							<th>Rating</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{stores.map((s) => (<tr key={s.id}>
								<td style={{ fontFamily: "monospace", color: "var(--color-text-muted)" }}>{s.id}</td>
								<td style={{ fontWeight: 600 }}>{s.name}</td>
								<td>{s.category}</td>
								<td>
									<span style={{ color: "#f39c12" }}>{"★".repeat(Math.max(Math.round(s.average_rating), 1))}</span>
									<span style={{ color: "var(--color-text-muted)", marginLeft: "0.25rem", fontSize: "0.85rem" }}>{s.average_rating.toFixed(1)}</span>
								</td>
								<td>
									<button className="btn" style={{ fontSize: "0.8rem", color: "var(--color-danger)" }} onClick={() => handleDelete(s.id)}>
										Delete
									</button>
								</td>
							</tr>))}
					</tbody>
				</table>
			</div>
		</div>);
};
