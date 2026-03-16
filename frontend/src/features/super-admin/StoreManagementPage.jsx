import React, { useEffect, useState } from "react";
import { storesApi } from "@/services/api/stores";

export const StoreManagementPage = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");
    const [form, setForm] = useState({ 
        name: "", 
        category: "", 
        description: "",
        address: "",
        working_hours: "10:00 AM - 9:00 PM",
        floor: 1
    });

    const [editingId, setEditingId] = useState(null);

    const fetchStores = async () => {
        try {
            const res = await storesApi.list();
            setStores(res.data.stores || res.data || []);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const resetForm = () => {
        setForm({ 
            name: "", 
            category: "", 
            description: "",
            address: "",
            working_hours: "10:00 AM - 9:00 PM",
            floor: 1
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (store) => {
        setForm({
            name: store.name,
            category: store.category,
            description: store.description,
            address: store.address,
            working_hours: store.working_hours,
            floor: store.floor
        });
        setEditingId(store.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await storesApi.adminUpdate(editingId, form);
                setMessage("Store updated successfully!");
            } else {
                await storesApi.adminCreate(form);
                setMessage("Store created successfully!");
            }
            resetForm();
            await fetchStores();
        } catch (err) {
            setMessage(err.response?.data?.detail || "Failed to save store");
        }
    };

    const handleDelete = async (storeId) => {
        if (!window.confirm("Are you sure you want to delete this store?")) return;
        try {
            await storesApi.adminRemove(storeId);
            setMessage("Store deleted successfully");
            await fetchStores();
        } catch (err) {
            setMessage(err.response?.data?.detail || "Failed to delete store");
        }
    };

    if (loading) return <div className="loading-spinner" />;

    return (
        <div className="panel-page">
            <div className="page-header">
                <h1 className="hero-heading">Store Management</h1>
                <p className="hero-subtitle">Manage all mall stores — create, update, and remove tenants</p>
            </div>

            {message && <div className="alert-item alert-info" style={{ marginBottom: "1rem" }}>{message}</div>}

            <button 
                className="btn btn-primary" 
                onClick={() => {
                    if (showForm && !editingId) setShowForm(false);
                    else { resetForm(); setShowForm(true); }
                }} 
                style={{ marginBottom: "1.5rem" }}
            >
                {showForm && !editingId ? "Cancel" : "+ Add New Store"}
            </button>

            {showForm && (
                <div className="section-card" style={{ marginBottom: "2rem" }}>
                    <h2 className="section-title">{editingId ? "Edit Store" : "Create New Store"}</h2>
                    <form onSubmit={handleSave} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Store Name</label>
                            <input 
                                className="form-input" 
                                value={form.name} 
                                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                                required 
                                placeholder="e.g. Zara, Apple Store"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Category</label>
                            <input 
                                className="form-input" 
                                value={form.category} 
                                onChange={(e) => setForm({ ...form, category: e.target.value })} 
                                required 
                                placeholder="e.g. Fashion, Electronics"
                            />
                        </div>

                         <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Floor Level</label>
                            <input 
                                type="number"
                                className="form-input" 
                                value={form.floor} 
                                onChange={(e) => setForm({ ...form, floor: parseInt(e.target.value) || 1 })} 
                                required 
                                min="1"
                                max="5"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Unit Address</label>
                            <input 
                                className="form-input" 
                                value={form.address} 
                                onChange={(e) => setForm({ ...form, address: e.target.value })} 
                                placeholder="e.g. Unit 101, Zone A"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Working Hours</label>
                            <input 
                                className="form-input" 
                                value={form.working_hours} 
                                onChange={(e) => setForm({ ...form, working_hours: e.target.value })} 
                                placeholder="e.g. 10:00 AM - 9:00 PM"
                            />
                        </div>

                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Description</label>
                            <textarea 
                                className="form-input" 
                                rows={3} 
                                value={form.description} 
                                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                required 
                                style={{ resize: "vertical" }}
                                placeholder="Brief description of the store..."
                            />
                        </div>

                        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
                            <button type="submit" className="btn btn-primary">
                                {editingId ? "Update Store" : "Create Store"}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-ghost" onClick={resetForm}>
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stores.map((s) => (
                            <tr key={s.id}>
                                <td style={{ fontFamily: "monospace", color: "var(--color-text-muted)" }}>#{s.id}</td>
                                <td style={{ fontWeight: 600 }}>{s.name}</td>
                                <td>
                                    <span className="status-badge" style={{ background: "var(--color-bg-tertiary)", color: "var(--color-text)" }}>
                                        {s.category}
                                    </span>
                                </td>
                                <td style={{ fontSize: "0.9rem" }}>
                                    Floor {s.floor || 1} • {s.address || "N/A"}
                                </td>
                                <td>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <span style={{ color: "#fbbf24", marginRight: "0.25rem" }}>★</span>
                                        <span>{s.average_rating ? s.average_rating.toFixed(1) : "N/A"}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button 
                                            className="btn btn-sm" 
                                            style={{ 
                                                background: "var(--color-bg-tertiary)", 
                                                color: "var(--color-text)",
                                                border: "none",
                                                padding: "0.25rem 0.75rem"
                                            }} 
                                            onClick={() => handleEdit(s)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="btn btn-sm" 
                                            style={{ 
                                                background: "rgba(239, 68, 68, 0.1)", 
                                                color: "var(--color-danger)",
                                                border: "none",
                                                padding: "0.25rem 0.75rem"
                                            }} 
                                            onClick={() => handleDelete(s.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
