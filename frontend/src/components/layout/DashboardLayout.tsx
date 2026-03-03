import React from "react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";

interface NavItem {
	to: string;
	label: string;
}

interface DashboardLayoutProps {
	title: string;
	navItems: NavItem[];
	children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, navItems, children }) => {
	const { user, logout } = useAuth();

	return (
		<div className="dashboard-root">
			<header className="dashboard-topbar">
				<div className="dashboard-brand">
					<Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
						<span className="dashboard-logo">Smart&nbsp;Mall</span>
					</Link>
					<span className="dashboard-section-title">{title}</span>
				</div>
				{user && (
					<div className="dashboard-user">
						<div className="dashboard-avatar">
							{(user.full_name ?? user.username)?.[0]?.toUpperCase()}
						</div>
						<span>
							{user.full_name ?? user.username} ({user.role})
						</span>
						<button type="button" className="btn btn-muted" onClick={logout}>
							Logout
						</button>
					</div>
				)}
			</header>
			<aside className="dashboard-sidebar">
				<nav>
					<ul className="dashboard-nav">
						{navItems.map((item) => (
							<li key={item.to}>
								<NavLink
									to={item.to}
									className={({ isActive }) =>
											isActive
												? "dashboard-nav-link dashboard-nav-link--active"
												: "dashboard-nav-link"
									}
								>
									{item.label}
								</NavLink>
							</li>
						))}
					</ul>
				</nav>
			</aside>
			<main className="dashboard-main">{children}</main>
		</div>
	);
};
