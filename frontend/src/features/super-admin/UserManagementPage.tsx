import React, { useEffect, useState } from "react";
import { usersApi } from "@/services/api/users";
import type { UserAccount } from "@/types";

export const UserManagementPage: React.FC = () => {
	const [users, setUsers] = useState<UserAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [message, setMessage] = useState("");
	const [form, setForm] = useState({ username: "", email: "", full_name: "", password: "", role: "customer" });

	const fetchUsers = async () => {
		try {
			const res = await usersApi.adminList();
			setUsers(res.data.users);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchUsers(); }, []);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await usersApi.adminCreate(form);
			setMessage("User created successfully");
			setShowForm(false);
			setForm({ username: "", email: "", full_name: "", password: "", role: "customer" });
			await fetchUsers();
		} catch (err: any) {
			setMessage(err.response?.data?.detail ?? "Failed to create user");
		}
	};

	const handleToggleActive = async (user: UserAccount) => {
		try {
			await usersApi.adminUpdate(user.username, { is_active: !user.is_active });
			setMessage(`User ${user.is_active ? "deactivated" : "activated"}`);
			await fetchUsers();
		} catch (err: any) {
			setMessage(err.response?.data?.detail ?? "Operation failed");
		}
	};

	const handleDelete = async (username: string) => {
		try {
			await usersApi.adminDelete(username);
			setMessage("User deleted");
			await fetchUsers();
		} catch (err: any) {
			setMessage(err.response?.data?.detail ?? "Delete failed");
		}
	};

	const roleColors: Record<string, string> = {
		customer: "#3498db",
		admin: "#f39c12",
		super_admin: "#e74c3c",
	};

	if (loading) return <div className="loading-spinner" />;

	return (
		<div className="app-page">
			<div className="page-header">
				<h1 className="hero-heading">User Management</h1>
				<p className="hero-subtitle">Manage user accounts, roles, and access control</p>
			</div>

			{message && <div className="alert-item alert-info" style={{ marginBottom: "1rem" }}>{message}</div>}

			<div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
				<button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
					{showForm ? "Cancel" : "+ Add User"}
				</button>
				<div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
					Total: {users.length} users
				</div>
			</div>

			{showForm && (
				<div className="section-card" style={{ marginBottom: "2rem" }}>
					<h2 className="section-title">Create User</h2>
					<form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Username</label>
							<input className="form-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Email</label>
							<input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Full Name</label>
							<input className="form-input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Password</label>
							<input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
						</div>
						<div>
							<label style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Role</label>
							<select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
								<option value="customer">Customer</option>
								<option value="admin">Store Admin</option>
								<option value="super_admin">Super Admin</option>
							</select>
						</div>
						<div style={{ display: "flex", alignItems: "flex-end" }}>
							<button type="submit" className="btn btn-primary">Create User</button>
						</div>
					</form>
				</div>
			)}

			<div className="data-table-wrapper">
				<table className="data-table">
					<thead>
						<tr>
							<th>Username</th>
							<th>Email</th>
							<th>Full Name</th>
							<th>Role</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((u) => (
							<tr key={u.username}>
								<td style={{ fontWeight: 600 }}>{u.username}</td>
								<td>{u.email}</td>
								<td>{u.full_name}</td>
								<td>
									<span style={{
										background: roleColors[u.role] ?? "#95a5a6",
										color: "#fff",
										padding: "0.15rem 0.5rem",
										borderRadius: "4px",
										fontSize: "0.75rem",
										fontWeight: 600,
										textTransform: "uppercase",
									}}>
										{u.role.replace("_", " ")}
									</span>
								</td>
								<td>
									<span style={{ color: u.is_active ? "var(--color-success)" : "var(--color-danger)", fontWeight: 600, fontSize: "0.85rem" }}>
										{u.is_active ? "Active" : "Inactive"}
									</span>
								</td>
								<td>
									<div style={{ display: "flex", gap: "0.5rem" }}>
										<button className="btn" style={{ fontSize: "0.8rem" }} onClick={() => handleToggleActive(u)}>
											{u.is_active ? "Deactivate" : "Activate"}
										</button>
										<button className="btn" style={{ fontSize: "0.8rem", color: "var(--color-danger)" }} onClick={() => handleDelete(u.username)}>
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
