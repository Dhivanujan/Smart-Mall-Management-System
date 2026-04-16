import React, { useCallback, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
export const DashboardLayout = ({ title, navItems, children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
	const openCommandPalette = useCallback(() => {
		window.dispatchEvent(new Event("smartmall:open-command-palette"));
	}, []);
    const handleLogout = useCallback(() => {
        logout();
        navigate("/");
    }, [logout, navigate]);
    const roleBadge = user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Admin" : user?.role ?? "";
    return (<div className="dashboard-root">
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
					<div className="topbar-search" role="button" tabIndex={0} onClick={openCommandPalette} onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openCommandPalette();
            }
        }}>
						<span style={{ fontSize: "0.82rem" }}>🔍</span>
						<span>Search…</span>
						<kbd>⌘K</kbd>
					</div>
					{user && (<div style={{ position: "relative" }}>
							<button type="button" onClick={() => setShowUserMenu((v) => !v)} className="user-menu-button">
								<div className="dashboard-avatar">
									{(user.full_name ?? user.username)?.[0]?.toUpperCase()}
								</div>
								<div style={{ textAlign: "left" }}>
									<div style={{ fontWeight: 550, fontSize: "0.82rem", lineHeight: 1.2 }}>{user.full_name ?? user.username}</div>
									<div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>{roleBadge}</div>
								</div>
								<span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", marginLeft: "0.15rem" }}>▼</span>
							</button>
							{showUserMenu && (<>
									<div style={{ position: "fixed", inset: 0, zIndex: 15 }} onClick={() => setShowUserMenu(false)}/>
									<div className="animate-fade-in user-menu-dropdown">
										<div style={{ padding: "0.5rem 0.6rem", borderBottom: "1px solid rgba(148,163,184,0.12)", marginBottom: "0.25rem" }}>
											<div style={{ fontWeight: 550, fontSize: "0.82rem" }}>{user.full_name ?? user.username}</div>
											<div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{user.email ?? user.username}</div>
										</div>
										<Link to="/" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
											🏠 Home
										</Link>
										<button type="button" onClick={handleLogout} className="user-menu-item danger">
											🚪 Sign out
										</button>
									</div>
								</>)}
						</div>)}
				</div>
			</header>
			<aside className="dashboard-sidebar">
				<div className="sidebar-section">
					<div className="sidebar-section-label">Navigation</div>
					<nav>
						<ul className="dashboard-nav">
							{navItems.map((item) => (<li key={item.to}>
									<NavLink to={item.to} end={item.to === "/admin" || item.to === "/super-admin" || item.to === "/dashboard"} className={({ isActive }) => isActive
                ? "dashboard-nav-link dashboard-nav-link--active"
                : "dashboard-nav-link"}>
										{item.icon && <span className="nav-icon">{item.icon}</span>}
										{item.label}
										{item.badge !== undefined && item.badge > 0 && (<span className="count-badge" style={{ marginLeft: "auto" }}>{item.badge}</span>)}
									</NavLink>
								</li>))}
						</ul>
					</nav>
				</div>
				<div className="sidebar-divider"/>
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
		</div>);
};
