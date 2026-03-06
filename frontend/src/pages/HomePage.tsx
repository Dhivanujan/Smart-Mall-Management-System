import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

const FEATURES = [
	{
		icon: "📊",
		label: "Mall admins",
		title: "Store performance at a glance",
		desc: "Track revenue, footfall, and support tickets in real time.",
		tags: ["Live metrics", "Tickets", "Revenue"],
	},
	{
		icon: "🏗️",
		label: "Super admins",
		title: "Multi-mall command center",
		desc: "Manage malls, admins, and tenants from a single pane of glass.",
		tags: ["Malls", "Occupancy", "Billing"],
	},
	{
		icon: "⚡",
		label: "Operations",
		title: "Operational health in real time",
		desc: "Monitor alerts, SLA compliance, and system health at scale.",
		tags: ["Alerts", "SLAs", "Uptime"],
	},
	{
		icon: "🛍️",
		label: "Customers",
		title: "Mall directory & discovery",
		desc: "Browse stores, check live occupancy, and explore products.",
		tags: ["Directory", "Products", "Ratings"],
	},
];

const STATS = [
	{ value: "50+", label: "Active stores" },
	{ value: "10K", label: "Daily visitors" },
	{ value: "99.9%", label: "Uptime" },
	{ value: "24/7", label: "Monitoring" },
];

export const HomePage: React.FC = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	return (
		<div className="app-page" style={{ flexDirection: "column", gap: "0" }}>
			<div className="app-page-inner animate-fade-in-up">
				<section>
					<div className="app-badge" aria-label="Smart mall platform badge" style={{ marginBottom: "1rem" }}>
						<span className="app-badge-pill" style={{ color: "#4ade80" }}>●</span>
						Top-rated smart mall operations platform
					</div>
					<h1 className="app-hero-heading">
						Orchestrate your malls<br />with confidence.
					</h1>
					<p className="app-hero-subtitle">
						Smart Mall gives super admins and mall operators a live command center for stores, revenue,
						footfall, and support — all in one modern dashboard.
					</p>

					{/* Stats row */}
					<div style={{
						display: "flex",
						flexWrap: "wrap",
						gap: "1.5rem",
						marginBottom: "1.75rem",
						paddingBottom: "1.25rem",
						borderBottom: "1px solid rgba(148,163,184,0.15)",
					}}>
						{STATS.map((stat) => (
							<div key={stat.label}>
								<div style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#a5b4fc" }}>
									{stat.value}
								</div>
								<div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
									{stat.label}
								</div>
							</div>
						))}
					</div>

					<div className="app-actions">
						{user ? (
							<>
								{["admin", "super_admin"].includes(user.role) && (
									<Link to="/admin" className="btn btn-primary">
										📊 Open admin console
									</Link>
								)}
								{user.role === "super_admin" && (
									<Link to="/super-admin" className="btn btn-ghost">
										🏗️ Super admin overview
									</Link>
								)}
								<button type="button" className="btn btn-muted" onClick={() => { logout(); navigate("/"); }}>
									Sign out
								</button>
							</>
						) : (
							<>
								<Link to="/login" className="btn btn-primary">
									Sign in to dashboard
								</Link>
								<Link to="/mall" className="btn btn-ghost">
									🛍️ Browse mall directory
								</Link>
							</>
						)}
					</div>
					{!user && (
						<p className="app-note">
							Use demo credentials for instant access — no setup required.
						</p>
					)}
				</section>
				<aside>
					<div className="app-feature-grid" aria-label="Role based entry cards" style={{ marginTop: 0 }}>
						{FEATURES.map((f, i) => (
							<div key={f.label} className={`app-feature-card animate-fade-in-up stagger-${i + 1}`}>
								<div style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>{f.icon}</div>
								<div className="app-feature-label">{f.label}</div>
								<div className="app-feature-title">{f.title}</div>
								<div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "0.25rem 0 0.5rem" }}>
									{f.desc}
								</div>
								<div className="app-feature-meta">
									{f.tags.map((tag) => (
										<span key={tag} className="app-feature-tag">{tag}</span>
									))}
								</div>
							</div>
						))}
					</div>
				</aside>
			</div>
		</div>
	);
};
