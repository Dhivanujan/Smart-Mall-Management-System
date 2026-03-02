import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../app/providers/AuthProvider";

export const HomePage: React.FC = () => {
	const { user, logout } = useAuth();

	return (
		<div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
			<h1>Smart Mall Management System</h1>
			<p>Welcome to the platform.</p>

			{user ? (
				<div style={{ marginTop: "1rem" }}>
					<p>
						Signed in as <strong>{user.full_name ?? user.username}</strong> ({user.role})
					</p>
					<div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
						{["admin", "super_admin"].includes(user.role) && (
							<Link to="/admin">Go to Admin Panel</Link>
						)}
						{user.role === "super_admin" && <Link to="/super-admin">Go to Super Admin Panel</Link>}
						<button type="button" onClick={logout}>
							Logout
						</button>
					</div>
				</div>
			) : (
				<div style={{ marginTop: "1rem" }}>
					<p>
						Please <Link to="/login">log in</Link> as an admin or super admin.
					</p>
				</div>
			)}
		</div>
	);
};
