import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../app/providers/AuthProvider";

export const HomePage: React.FC = () => {
	const { user, logout } = useAuth();

	return (
		<div className="app-page">
			<div className="app-page-inner">
				<section>
					<div className="app-badge" aria-label="Smart mall platform badge">
						<span className="app-badge-pill">●</span>
						Top-rated smart mall operations platform
					</div>
					<h1 className="app-hero-heading">Orchestrate your malls with confidence.</h1>
					<p className="app-hero-subtitle">
						Smart Mall gives super admins and mall operators a live command center for stores, revenue,
						footfall, and support — all in one modern dashboard.
					</p>
					<div className="app-actions">
						{user ? (
							<>
								{["admin", "super_admin"].includes(user.role) && (
									<Link to="/admin" className="btn btn-primary">
										Open admin console
									</Link>
								)}
								{user.role === "super_admin" && (
									<Link to="/super-admin" className="btn btn-ghost">
										Super admin overview
									</Link>
								)}
								<button type="button" className="btn btn-muted" onClick={logout}>
									Sign out
								</button>
							</>
						) : (
							<>
								<Link to="/login" className="btn btn-primary">
									Sign in to dashboard
								</Link>
								<Link to="/login" className="btn btn-ghost">
									Preview demo accounts
								</Link>
							</>
						)}
					</div>
					<div className="app-actions" style={{ marginTop: "0.75rem" }}>
						<Link to="/mall" className="btn btn-ghost">
							Browse mall directory
						</Link>
					</div>
					<p className="app-note">
						Use demo credentials for instant access — no setup required.
					</p>
				</section>
				<aside>
					<div className="app-feature-grid" aria-label="Role based entry cards">
						<div className="app-feature-card">
							<div className="app-feature-label">Mall admins</div>
							<div className="app-feature-title">Store performance at a glance</div>
							<div className="app-feature-meta">
								<span className="app-feature-tag">Live metrics</span>
								<span className="app-feature-tag">Tickets</span>
							</div>
						</div>
						<div className="app-feature-card">
							<div className="app-feature-label">Super admins</div>
							<div className="app-feature-title">Multi-mall command center</div>
							<div className="app-feature-meta">
								<span className="app-feature-tag">Malls</span>
								<span className="app-feature-tag">Occupancy</span>
							</div>
						</div>
						<div className="app-feature-card">
							<div className="app-feature-label">Operators</div>
							<div className="app-feature-title">Operational health in real time</div>
							<div className="app-feature-meta">
								<span className="app-feature-tag">Alerts</span>
								<span className="app-feature-tag">SLAs</span>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
};
