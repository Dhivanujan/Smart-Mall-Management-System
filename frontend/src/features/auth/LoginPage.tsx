import React, { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";

export const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();

	const [username, setUsername] = useState("admin@example.com");
	const [password, setPassword] = useState("admin123");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);
		try {
			await login({ username, password });
			const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";
			navigate(from, { replace: true });
		} catch (err) {
			console.error(err);
			setError("Login failed. Check your credentials.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 400 }}>
			<h1>Sign in</h1>
			<p>Use one of the demo accounts:</p>
			<ul>
				<li>Admin: admin@example.com / admin123</li>
				<li>Super Admin: superadmin@example.com / super123</li>
			</ul>
			<form onSubmit={handleSubmit} style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
				<label>
					Email
					<input
						type="email"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						style={{ width: "100%" }}
						required
					/>
				</label>
				<label>
					Password
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						style={{ width: "100%" }}
						required
					/>
				</label>
				{error && (
					<div style={{ color: "red" }}>
						{error}
					</div>
				)}
				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Signing in..." : "Sign in"}
				</button>
			</form>
		</div>
	);
};
