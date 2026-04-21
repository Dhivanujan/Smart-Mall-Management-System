import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
const DEMO_ACCOUNTS = [
    { label: "Customer", email: "customer@example.com", password: "customer123", icon: "🛍️", desc: "Browse stores, join queues, parking & loyalty" },
    { label: "Mall Admin", email: "admin@example.com", password: "admin123", icon: "📊", desc: "Manage stores, view metrics, handle tickets" },
    { label: "Super Admin", email: "superadmin@example.com", password: "super123", icon: "🏗️", desc: "Full platform access, manage admins & tenants" },
];
export const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await login({ username, password });
            const from = location.state?.from?.pathname ?? "/";
            navigate(from, { replace: true });
        }
        catch (err) {
            console.error(err);
            setError("Login failed. Please check your credentials and try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const fillDemo = (email, pw) => {
        setUsername(email);
        setPassword(pw);
        setError(null);
    };
    return (<div className="app-page auth-page">
			<div className="app-page-inner auth-page-inner animate-fade-in-up">
				<section className="auth-hero-panel">
					<div>
						<Link to="/" className="auth-back-link">
							← Back to home
						</Link>
						<div className="app-badge auth-badge" aria-label="Smart mall badge">
							<span className="app-badge-pill auth-badge-pill">🔒</span>
							Secure access
						</div>
						<h1 className="app-hero-heading auth-title">
							Welcome back to<br />Smart Mall Control.
						</h1>
						<p className="app-hero-subtitle auth-subtitle">
							Sign in to manage operations, monitor analytics, and keep customer experiences running smoothly.
						</p>
						<div className="auth-quick-access">
							<p className="auth-kicker">Quick demo access</p>
							<div className="auth-demo-grid">
								{DEMO_ACCOUNTS.map((acct) => (
									<button
										key={acct.email}
										type="button"
										onClick={() => fillDemo(acct.email, acct.password)}
										className={`demo-account-btn ${username === acct.email ? "active" : ""}`}
									>
										<span className="auth-account-icon">{acct.icon}</span>
										<div>
											<div className="auth-account-role">{acct.label}</div>
											<div className="auth-account-desc">{acct.desc}</div>
											<div className="auth-account-email">{acct.email}</div>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>
				</section>
				<aside className="auth-form-column">
					<div className="app-card auth-card animate-fade-in-up stagger-2" aria-label="Sign in form">
						<div className="app-card-header">
							<h2 className="app-card-title">Sign in</h2>
							<p className="app-card-subtitle">Use your account to access dashboard tools and workflows.</p>
						</div>
						<form onSubmit={handleSubmit} className="app-form">
							<label className="app-field-label">
								<span>Username or email</span>
								<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="app-input" placeholder="you@example.com" required autoFocus/>
							</label>
							<label className="app-field-label">
								<span>Password</span>
								<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="app-input" placeholder="Enter your password" required/>
							</label>
							{error && (<div className="error-banner">
									<span className="error-icon">⚠️</span>
									<span>{error}</span>
								</div>)}
							<button type="submit" className="btn btn-primary auth-submit-btn" disabled={isSubmitting}>
								{isSubmitting ? (<span className="auth-loading-content">
										<span className="auth-spinner"/>
										Signing in...
									</span>) : "Sign in"}
							</button>
						</form>
						<div className="auth-footer-text">
							Don&apos;t have an account? <Link to="/register" className="auth-inline-link">Create one</Link>
						</div>
					</div>
				</aside>
			</div>
		</div>);
};
