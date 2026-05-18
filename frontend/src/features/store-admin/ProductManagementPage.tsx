import React, { useEffect, useState } from "react";
import { storesApi } from "@/services/api/stores";
export const ProductManagementPage = () => {
    const [products, setProducts] = useState([]);
    const [storeId, setStoreId] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: "", price: "", category: "" });
    const [message, setMessage] = useState("");
    const fetchProducts = async () => {
        try {
            const res = await storesApi.getProducts(storeId);
            setProducts(res.data.products ?? []);
        }
        catch {
            setProducts([]);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        setLoading(true);
        fetchProducts();
    }, [storeId]);
    const resetForm = () => {
        setForm({ name: "", price: "", category: "" });
        setEditId(null);
        setShowForm(false);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: form.name,
            price: parseFloat(form.price),
            category: form.category,
        };
        try {
            if (editId) {
                await storesApi.updateProduct(storeId, editId, payload);
                setMessage("Product updated");
            }
            else {
                await storesApi.addProduct(storeId, payload);
                setMessage("Product added");
            }
            resetForm();
            await fetchProducts();
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Operation failed");
        }
    };
    const handleEdit = (p) => {
        setForm({ name: p.name, price: p.price.toString(), category: p.category });
        setEditId(p.id);
        setShowForm(true);
    };
    const handleDelete = async (productId) => {
        try {
            await storesApi.deleteProduct(storeId, productId);
            setMessage("Product deleted");
            await fetchProducts();
        }
        catch (err) {
            setMessage(err.response?.data?.detail ?? "Delete failed");
        }
    };
    if (loading)
        return <div className="loading-spinner"/>;
    return (<div className="panel-page">
			<div className="page-header">
				<h1 className="hero-heading">Product Management</h1>
				<p className="hero-subtitle">Manage products and inventory for your store</p>
			</div>

			{message && <div className="alert-item alert-info" style={{ marginBottom: "1rem" }}>{message}</div>}

			<div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
				<label style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Store:</label>
				<select className="form-input" value={storeId} onChange={(e) => setStoreId(parseInt(e.target.value, 10))} style={{ width: "auto" }}>
					{Array.from({ length: 10 }, (_, i) => (<option key={i} value={i + 1}>Store {i + 1}</option>))}
				</select>
				<button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ marginLeft: "auto" }}>
					{showForm && !editId ? "Cancel" : "+ Add Product"}
				</button>
			</div>

			{showForm && (<div className="section-card" style={{ marginBottom: "2rem" }}>
					<h2 className="section-title">{editId ? "Edit Product" : "Add Product"}</h2>
					<form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Name</label>
							<input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required/>
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Price</label>
							<input className="form-input" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required/>
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Category</label>
							<input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required/>
						</div>
						<div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.5rem" }}>
							<button type="submit" className="btn btn-primary">{editId ? "Update" : "Add"}</button>
							<button type="button" className="btn" onClick={resetForm}>Cancel</button>
						</div>
					</form>
				</div>)}

			<div className="data-table-wrapper">
				<table className="data-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Category</th>
							<th>Price</th>
							<th>Stock</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{products.map((p) => (<tr key={p.id}>
								<td style={{ fontWeight: 600 }}>{p.name}</td>
								<td>{p.category}</td>
								<td>${p.price.toFixed(2)}</td>
								<td>
									<span style={{ color: "var(--color-success)", fontWeight: 600 }}>
										Active
									</span>
								</td>
								<td>
									<div style={{ display: "flex", gap: "0.5rem" }}>
										<button className="btn" style={{ fontSize: "0.8rem" }} onClick={() => handleEdit(p)}>Edit</button>
									<button className="btn" style={{ fontSize: "0.8rem", color: "var(--color-danger)" }} onClick={() => handleDelete(p.id)}>Delete</button>
									</div>
								</td>
							</tr>))}
					</tbody>
				</table>
			</div>
		</div>);
};
