import React, { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
		<div className="app-page" style={{ alignItems: "stretch" }}>
			<div className="app-page-inner" style={{ maxWidth: 960 }}>
				<section style={{ display: "flex", alignItems: "center" }}>
					<div>
						<div className="app-badge" aria-label="Smart mall badge">
							<span className="app-badge-pill">●</span>
							Secure admin access
						</div>
						<h1 className="app-hero-heading" style={{ marginBottom: "0.8rem", marginTop: "0.9rem" }}>
							Sign in to your control center.
						</h1>
						<p className="app-hero-subtitle">
							Use one of the demo accounts below to explore the admin and super admin experiences in
							Smart Mall.
						</p>
						<ul style={{ paddingLeft: "1.05rem", margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
							<li>Admin: admin@example.com / admin123</li>
							<li>Super admin: superadmin@example.com / super123</li>
						</ul>
						<p className="app-note">
							Want to start over? You can always <Link to="/">return to the overview</Link>.
						</p>
					</div>
				</section>
				<aside>
					<div className="app-card" aria-label="Sign in form">
						<div className="app-card-header">
							<h2 className="app-card-title">Sign in</h2>
							<p className="app-card-subtitle">Authenticate to access your mall dashboards.</p>
						</div>
						<form onSubmit={handleSubmit} className="app-form">
							<label className="app-field-label">
								<span>Email</span>
								<input
									type="email"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className="app-input"
									required
								/>
							</label>
							<label className="app-field-label">
								<span>Password</span>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="app-input"
									required
								/>
							</label>
							{error && <div className="app-error">{error}</div>}
							<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
								{isSubmitting ? "Signing you in…" : "Sign in"}
							</button>
						</form>
					</div>
				</aside>
			</div>
		</div>
	);
};
