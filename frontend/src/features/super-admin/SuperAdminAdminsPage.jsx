import React, { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/services/api/client";

export const SuperAdminAdminsPage = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    
    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        username: "",
        full_name: "",
        email: "",
        password: "",
    });
    const [createError, setCreateError] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get("/api/v1/users/admin/list?role=admin");
            setAdmins(res.data.users || []);
            setError(null);
        }
        catch (err) {
            console.error(err);
            setError("Failed to load admins.");
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
    }, []);

    const filtered = useMemo(() => {
        if (!search.trim())
            return admins;
        const q = search.toLowerCase();
        return admins.filter((a) => a.username.toLowerCase().includes(q) ||
            a.full_name.toLowerCase().includes(q) ||
            (a.email && a.email.toLowerCase().includes(q)));
    }, [admins, search]);

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setCreateError(null);
        setIsCreating(true);

        try {
            await apiClient.post("/api/v1/users/admin/create", {
                username: createForm.username,
                full_name: createForm.full_name,
                email: createForm.email || createForm.username,
                password: createForm.password,
                role: "admin",
            });
            
            // Success
            setIsCreateModalOpen(false);
            setCreateForm({ username: "", full_name: "", email: "", password: "" });
            loadAdmins(); // Reload list
        } catch (err) {
            setCreateError(err?.response?.data?.detail || "Failed to create admin.");
        } finally {
            setIsCreating(false);
        }
    };

    return (<>
			{/* Header */}
			<div className="flex-between" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
				<div>
					<h1 style={{ margin: 0, fontSize: "1.5rem" }}>Store Administrators</h1>
					<p style={{ margin: "0.25rem 0 0", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
						Review and manage store administrators for your platform.
					</p>
				</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
				    <span className="count-badge">{admins.length} admin{admins.length !== 1 ? "s" : ""}</span>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{
                            background: "var(--color-primary)",
                            color: "var(--color-primary-foreground)",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.5rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontSize: "0.875rem"
                        }}
                    >
                        + Create Admin
                    </button>
                </div>
			</div>

			{/* Loading */}
			{loading && (<div style={{ marginTop: "2rem" }}>
					<div className="loading-spinner" style={{ margin: "0 auto" }}/>
				</div>)}

			{/* Error */}
			{!loading && error && (<div className="error-banner" style={{ marginTop: "1.5rem" }}>
					<span className="error-icon">⚠️</span>
					<span>{error}</span>
				</div>)}

			{!loading && !error && (<>
					{/* Summary */}
					<div className="metrics-grid animate-fade-in-up" style={{ marginTop: "1.5rem" }}>
						<div className="metric-card">
							<div className="metric-icon blue">👥</div>
							<div className="metric-body">
								<div className="metric-label">Total store admins</div>
								<div className="metric-value">{admins.length}</div>
							</div>
						</div>
					</div>

					{/* Search */}
					<div className="filter-bar animate-fade-in-up stagger-2" style={{ marginTop: "1.25rem" }}>
						<div className="search-input-wrapper">
							<span className="search-icon">🔍</span>
							<input type="text" placeholder="Search by name, email or username…" value={search} onChange={(e) => setSearch(e.target.value)}/>
						</div>
					</div>

					{/* Table */}
					<div className="section-card animate-fade-in-up stagger-3" style={{ marginTop: "1.25rem" }}>
						<div className="data-table-wrapper">
							<table className="data-table">
								<thead>
									<tr>
										<th>Username / Email</th>
										<th>Full name</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									{filtered.map((admin) => (<tr key={admin.username}>
											<td className="font-mono">{admin.username}</td>
											<td style={{ fontWeight: 500 }}>{admin.full_name}</td>
											<td>
                                                <span style={{ 
                                                    background: admin.is_active ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", 
                                                    color: admin.is_active ? "rgb(21,128,61)" : "rgb(185,28,28)",
                                                    padding: "0.25rem 0.5rem",
                                                    borderRadius: "1rem",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600
                                                }}>
                                                    {admin.is_active ? "Active" : "Disabled"}
                                                </span>
                                            </td>
										</tr>))}
									{filtered.length === 0 && (<tr>
											<td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
												No admins match your search.
											</td>
										</tr>)}
								</tbody>
							</table>
						</div>
					</div>
				</>)}

            {/* Create Admin Modal */}
            {isCreateModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(4px)"
                }}>
                    <div style={{
                        background: "var(--color-card)",
                        padding: "2rem",
                        borderRadius: "1rem",
                        width: "100%",
                        maxWidth: "400px",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.25rem" }}>Create Store Admin</h2>
                        
                        {createError && (
                            <div style={{ background: "rgba(239,68,68,0.1)", color: "rgb(220,38,38)", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1rem", fontSize: "0.875rem" }}>
                                {createError}
                            </div>
                        )}

                        <form onSubmit={handleCreateAdmin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Full Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={createForm.full_name}
                                    onChange={(e) => setCreateForm({...createForm, full_name: e.target.value})}
                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid var(--color-border)", background: "var(--color-background)", color: "var(--color-text)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Email / Username</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={createForm.username}
                                    onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid var(--color-border)", background: "var(--color-background)", color: "var(--color-text)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Temporary Password</label>
                                <input 
                                    type="text" 
                                    required 
                                    minLength={6}
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                                    style={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid var(--color-border)", background: "var(--color-background)", color: "var(--color-text)" }}
                                />
                            </div>
                            
                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsCreateModalOpen(false)}
                                    style={{ flex: 1, padding: "0.5rem", background: "var(--color-secondary)", border: "none", borderRadius: "0.375rem", cursor: "pointer", color: "var(--color-text)" }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isCreating}
                                    style={{ flex: 1, padding: "0.5rem", background: "var(--color-primary)", color: "var(--color-primary-foreground)", border: "none", borderRadius: "0.375rem", cursor: "pointer", opacity: isCreating ? 0.7 : 1 }}
                                >
                                    {isCreating ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
		</>
);
};