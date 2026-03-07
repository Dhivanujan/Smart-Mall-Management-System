import React, { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

const DEMO_ACCOUNTS = [
	{ label: "Customer", email: "customer@example.com", password: "customer123", icon: "🛍️", desc: "Browse stores, join queues, parking & loyalty" },
	{ label: "Mall Admin", email: "admin@example.com", password: "admin123", icon: "📊", desc: "Manage stores, view metrics, handle tickets" },
	{ label: "Super Admin", email: "superadmin@example.com", password: "super123", icon: "🏗️", desc: "Full platform access, manage admins & tenants" },
];

export const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
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
			setError("Login failed. Please check your credentials and try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const fillDemo = (email: string, pw: string) => {
		setUsername(email);
		setPassword(pw);
		setError(null);
	};

	return (
		<div className="app-page" style={{ alignItems: "stretch" }}>
			<div className="app-page-inner animate-fade-in-up" style={{ maxWidth: 1000 }}>
				<section style={{ display: "flex", alignItems: "center" }}>
					<div>
						<Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--color-text-muted)", textDecoration: "none", marginBottom: "1rem" }}>
							← Back to home
						</Link>
						<div className="app-badge" aria-label="Smart mall badge" style={{ marginBottom: "0.75rem" }}>
							<span className="app-badge-pill" style={{ color: "#818cf8" }}>🔒</span>
							Secure admin access
						</div>
						<h1 className="app-hero-heading" style={{ marginBottom: "0.8rem" }}>
							Sign in to your<br />control center.
						</h1>
						<p className="app-hero-subtitle">
							Access the admin dashboard to manage stores, track performance, and oversee mall operations.
						</p>

						{/* Demo account cards */}
						<div style={{ marginTop: "1.25rem" }}>
							<div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.6rem" }}>
								Quick demo access
							</div>
							<div style={{ display: "grid", gap: "0.6rem" }}>
								{DEMO_ACCOUNTS.map((acct) => (
									<button
										key={acct.email}
										type="button"
										onClick={() => fillDemo(acct.email, acct.password)}
										style={{
											display: "flex",
											alignItems: "flex-start",
											gap: "0.65rem",
											padding: "0.7rem 0.85rem",
											borderRadius: "var(--radius-lg)",
											border: username === acct.email ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(148,163,184,0.2)",
											background: username === acct.email ? "rgba(99,102,241,0.08)" : "rgba(15,23,42,0.6)",
											color: "var(--color-text-primary)",
											cursor: "pointer",
											textAlign: "left",
											transition: "border-color 180ms, background 180ms",
											fontSize: "0.85rem",
										}}
									>
										<span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{acct.icon}</span>
										<div>
											<div style={{ fontWeight: 550, marginBottom: "0.1rem" }}>{acct.label}</div>
											<div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{acct.desc}</div>
											<div style={{ fontSize: "0.72rem", color: "var(--color-accent-strong)", marginTop: "0.25rem", fontFamily: "monospace" }}>
												{acct.email}
											</div>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>
				</section>
				<aside>
					<div className="app-card animate-fade-in-up stagger-2" aria-label="Sign in form">
						<div className="app-card-header">
							<h2 className="app-card-title">Sign in</h2>
							<p className="app-card-subtitle">Authenticate to access your mall dashboards.</p>
						</div>
						<form onSubmit={handleSubmit} className="app-form">
							<label className="app-field-label">
								<span>Username or email</span>
								<input
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className="app-input"
									placeholder="your username or email"
									required
									autoFocus
								/>
							</label>
							<label className="app-field-label">
								<span>Password</span>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="app-input"
									placeholder="Enter your password"
									required
								/>
							</label>
							{error && (
								<div className="error-banner" style={{ marginBottom: 0 }}>
									<span className="error-icon">⚠️</span>
									<span>{error}</span>
								</div>
							)}
							<button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: "100%", marginTop: "0.25rem" }}>
								{isSubmitting ? (
									<span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
										<span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "999px", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
										Signing in…
									</span>
								) : "Sign in →"}
							</button>
						</form>
						<div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
							Don&apos;t have an account?{" "}
							<Link to="/register" style={{ color: "var(--color-accent-strong)" }}>Create one</Link>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
};
