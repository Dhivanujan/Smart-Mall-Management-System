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
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "240px 1fr",
				gridTemplateRows: "56px 1fr",
				gridTemplateAreas: '"topbar topbar" "sidebar main"',
				height: "100vh",
				fontFamily: "system-ui, sans-serif",
			}}
		>
			<header
				style={{
					gridArea: "topbar",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "0 1.5rem",
					borderBottom: "1px solid #e5e7eb",
					backgroundColor: "#ffffff",
					position: "sticky",
					top: 0,
					zIndex: 10,
				}}
			>
				<div>
					<Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
						<strong>Smart Mall</strong>
					</Link>
					<span style={{ marginLeft: "0.75rem", color: "#6b7280", fontSize: 14 }}>{title}</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: 14 }}>
					{user && (
						<>
							<span>
								{user.full_name ?? user.username} ({user.role})
							</span>
							<button type="button" onClick={logout} style={{ fontSize: 14 }}>
								Logout
							</button>
						</>
					)}
				</div>
			</header>
			<aside
				style={{
					gridArea: "sidebar",
					borderRight: "1px solid #e5e7eb",
					padding: "1rem 0.75rem",
					backgroundColor: "#f9fafb",
				}}
			>
				<nav>
					<ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
						{navItems.map((item) => (
							<li key={item.to}>
								<NavLink
									to={item.to}
									style={({ isActive }) => ({
											display: "block",
											padding: "0.4rem 0.75rem",
											borderRadius: 6,
											textDecoration: "none",
											fontSize: 14,
											color: isActive ? "#111827" : "#374151",
											backgroundColor: isActive ? "#e5e7eb" : "transparent",
										})}
								>
									{item.label}
								</NavLink>
							</li>
						))}
					</ul>
				</nav>
			</aside>
			<main
				style={{
					gridArea: "main",
					padding: "1.5rem 2rem",
					overflowY: "auto",
					backgroundColor: "#ffffff",
				}}
			>
				{children}
			</main>
		</div>
	);
};
