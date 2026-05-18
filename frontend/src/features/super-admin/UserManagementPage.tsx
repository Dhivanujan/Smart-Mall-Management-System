import React, { useEffect, useState } from "react";
import { usersApi } from "@/services/api/users";
import { UserPlus, X, CheckCircle, XCircle, Trash2 } from "lucide-react";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
    customer:    { label: "Customer",    cls: "status-badge active" },
    admin:       { label: "Store Admin", cls: "status-badge pending" },
    super_admin: { label: "Super Admin", cls: "status-badge" },
};

export const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [form, setForm] = useState({ username: "", email: "", full_name: "", password: "", role: "customer" });

    const fetchUsers = async () => {
        try {
            const res = await usersApi.adminList();
            setUsers(res.data.users);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const notify = (msg: string, err = false) => { setMessage(msg); setIsError(err); setTimeout(() => setMessage(""), 4000); };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await usersApi.adminCreate(form);
            notify("User created successfully");
            setShowForm(false);
            setForm({ username: "", email: "", full_name: "", password: "", role: "customer" });
            await fetchUsers();
        } catch (err: any) { notify(err.response?.data?.detail ?? "Failed to create user", true); }
    };

    const handleToggleActive = async (user: any) => {
        try {
            await usersApi.adminUpdate(user.username, { is_active: !user.is_active });
            notify(`User ${user.is_active ? "deactivated" : "activated"}`);
            await fetchUsers();
        } catch (err: any) { notify(err.response?.data?.detail ?? "Operation failed", true); }
    };

    const handleDelete = async (username: string) => {
        if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
        try {
            await usersApi.adminDelete(username);
            notify("User deleted");
            await fetchUsers();
        } catch (err: any) { notify(err.response?.data?.detail ?? "Delete failed", true); }
    };

    if (loading) return <div className="flex justify-center py-16"><div className="loading-spinner" /></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="hero-heading">User Management</h1>
                    <p className="hero-subtitle">Manage accounts, roles, and access control · {users.length} total users</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><UserPlus className="w-4 h-4" /> Add User</>}
                </button>
            </div>

            {message && (
                <div className={isError ? "error-banner" : "message-banner"} style={{ marginBottom: "1rem" }}>
                    {message}
                </div>
            )}

            {showForm && (
                <div className="section-card" style={{ marginBottom: "1.5rem" }}>
                    <h2 className="panel-title" style={{ marginBottom: "1rem" }}>Create New User</h2>
                    <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {[
                            { label: "Username", field: "username", type: "text" },
                            { label: "Email", field: "email", type: "email" },
                            { label: "Full Name", field: "full_name", type: "text" },
                            { label: "Password", field: "password", type: "password" },
                        ].map(({ label, field, type }) => (
                            <div key={field}>
                                <label className="form-label">{label}</label>
                                <input
                                    className="form-input" type={type} required minLength={field === "password" ? 6 : undefined}
                                    value={(form as any)[field]}
                                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                />
                            </div>
                        ))}
                        <div>
                            <label className="form-label">Role</label>
                            <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                <option value="customer">Customer</option>
                                <option value="admin">Store Admin</option>
                            </select>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Create User</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr><th>Username</th><th>Email</th><th>Full Name</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {users.map((u: any) => {
                            const badge = ROLE_BADGE[u.role] ?? { label: u.role, cls: "status-badge" };
                            return (
                                <tr key={u.username}>
                                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                                    <td style={{ color: "var(--color-text-muted)" }}>{u.email}</td>
                                    <td>{u.full_name}</td>
                                    <td><span className={badge.cls}>{badge.label}</span></td>
                                    <td>
                                        <span className={`status-badge ${u.is_active ? "active" : "closed"}`}>
                                            {u.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {u.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleToggleActive(u)}>
                                                {u.is_active ? "Deactivate" : "Activate"}
                                            </button>
                                            {u.role !== "super_admin" && (
                                                <button className="btn btn-sm" style={{ color: "var(--color-danger)", borderColor: "hsl(0 84% 60% / 0.3)" }} onClick={() => handleDelete(u.username)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
