import React, { useCallback, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";

interface NavItem {
	to: string;
	label: string;
	icon?: string;
	badge?: number;
}

interface DashboardLayoutProps {
	title: string;
	navItems: NavItem[];
	children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, navItems, children }) => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [showUserMenu, setShowUserMenu] = useState(false);

	const handleLogout = useCallback(() => {
		logout();
		navigate("/");
	}, [logout, navigate]);

	const roleBadge = user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Admin" : user?.role ?? "";

	return (
		<div className="dashboard-root">
			<header className="dashboard-topbar">
				<div className="dashboard-brand">
					<Link to="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "0.5rem" }}>
						<span style={{ fontSize: "1.2rem" }}>🏬</span>
						<span className="dashboard-logo">Smart&nbsp;Mall</span>
					</Link>
					<span style={{ color: "rgba(148,163,184,0.4)", fontSize: "0.9rem" }}>/</span>
					<span className="dashboard-section-title">{title}</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
					<div className="topbar-search" role="button" tabIndex={0}>
						<span style={{ fontSize: "0.82rem" }}>🔍</span>
						<span>Search…</span>
						<kbd>⌘K</kbd>
					</div>
					{user && (
						<div style={{ position: "relative" }}>
							<button
								type="button"
								onClick={() => setShowUserMenu((v) => !v)}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.6rem",
									background: "none",
									border: "1px solid transparent",
									borderRadius: "var(--radius-md)",
									color: "var(--color-text-primary)",
									cursor: "pointer",
									padding: "0.3rem 0.6rem",
									fontSize: "0.85rem",
									transition: "border-color 180ms",
								}}
								onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(148,163,184,0.3)"}
								onMouseLeave={(e) => { if (!showUserMenu) e.currentTarget.style.borderColor = "transparent"; }}
							>
								<div className="dashboard-avatar">
									{(user.full_name ?? user.username)?.[0]?.toUpperCase()}
								</div>
								<div style={{ textAlign: "left" }}>
									<div style={{ fontWeight: 550, fontSize: "0.82rem", lineHeight: 1.2 }}>{user.full_name ?? user.username}</div>
									<div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>{roleBadge}</div>
								</div>
								<span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", marginLeft: "0.15rem" }}>▼</span>
							</button>
							{showUserMenu && (
								<>
									<div
										style={{ position: "fixed", inset: 0, zIndex: 15 }}
										onClick={() => setShowUserMenu(false)}
									/>
									<div
										className="animate-fade-in"
										style={{
											position: "absolute",
											right: 0,
											top: "calc(100% + 6px)",
											minWidth: "180px",
											background: "rgba(15, 23, 42, 0.98)",
											border: "1px solid rgba(148,163,184,0.3)",
											borderRadius: "var(--radius-lg)",
											boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
											zIndex: 20,
											padding: "0.35rem",
											fontSize: "0.85rem",
										}}
									>
										<div style={{ padding: "0.5rem 0.6rem", borderBottom: "1px solid rgba(148,163,184,0.12)", marginBottom: "0.25rem" }}>
											<div style={{ fontWeight: 550, fontSize: "0.82rem" }}>{user.full_name ?? user.username}</div>
											<div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{user.email ?? user.username}</div>
										</div>
										<Link
											to="/"
											style={{ display: "block", padding: "0.4rem 0.6rem", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--color-text-primary)" }}
											onClick={() => setShowUserMenu(false)}
											onMouseEnter={(e) => e.currentTarget.style.background = "rgba(148,163,184,0.1)"}
											onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
										>
											🏠 Home
										</Link>
										<button
											type="button"
											onClick={handleLogout}
											style={{
												display: "block",
												width: "100%",
												padding: "0.4rem 0.6rem",
												borderRadius: "var(--radius-sm)",
												border: "none",
												background: "transparent",
												color: "#f87171",
												cursor: "pointer",
												fontSize: "0.85rem",
												textAlign: "left",
											}}
											onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
											onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
										>
											🚪 Sign out
										</button>
									</div>
								</>
							)}
						</div>
					)}
				</div>
			</header>
			<aside className="dashboard-sidebar">
				<div className="sidebar-section">
					<div className="sidebar-section-label">Navigation</div>
					<nav>
						<ul className="dashboard-nav">
							{navItems.map((item) => (
								<li key={item.to}>
									<NavLink
										to={item.to}
										end={item.to === "/admin" || item.to === "/super-admin"}
										className={({ isActive }) =>
												isActive
													? "dashboard-nav-link dashboard-nav-link--active"
													: "dashboard-nav-link"
										}
									>
										{item.icon && <span className="nav-icon">{item.icon}</span>}
										{item.label}
										{item.badge !== undefined && item.badge > 0 && (
											<span className="count-badge" style={{ marginLeft: "auto" }}>{item.badge}</span>
										)}
									</NavLink>
								</li>
							))}
						</ul>
					</nav>
				</div>
				<div className="sidebar-divider" />
				<div className="sidebar-section">
					<div className="sidebar-section-label">Quick links</div>
					<nav>
						<ul className="dashboard-nav">
							<li>
								<Link to="/" className="dashboard-nav-link">
									<span className="nav-icon">🏠</span>
									Home
								</Link>
							</li>
							<li>
								<Link to="/mall" className="dashboard-nav-link">
									<span className="nav-icon">🛍️</span>
									Mall directory
								</Link>
							</li>
						</ul>
					</nav>
				</div>
				<div style={{ marginTop: "auto", padding: "0.6rem 0.8rem", fontSize: "0.7rem", color: "rgba(148,163,184,0.4)" }}>
					Smart Mall v0.1.0
				</div>
			</aside>
			<main className="dashboard-main">{children}</main>
		</div>
	);
};
