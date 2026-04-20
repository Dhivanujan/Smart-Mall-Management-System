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
	return (<div className="flex h-screen bg-background text-foreground overflow-hidden w-full dashboard-root">
			<aside className="hidden md:flex w-64 border-r border-border bg-card flex-col flex-shrink-0 z-20 dashboard-sidebar">
				<div className="h-16 flex items-center px-6 border-b border-border dashboard-brand">
					<Link to="/" className="flex items-center gap-3 text-primary hover:text-primary-foreground transition-colors" style={{ textDecoration: "none" }}>
						<span className="text-2xl drop-shadow-md">🏬</span>
						<span className="font-black text-xl tracking-tight dashboard-logo">Smart Mall</span>
					</Link>
				</div>
				
				<div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 no-scrollbar">
					<div className="sidebar-section">
						<div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3 sidebar-section-label">Navigation</div>
						<nav>
							<ul className="space-y-1 dashboard-nav">
								{navItems.map((item) => (<li key={item.to}>
										<NavLink to={item.to} end={item.to === "/admin" || item.to === "/super-admin" || item.to === "/dashboard"} className={({ isActive }) => isActive
					? "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md transition-all hover:-translate-y-0.5 dashboard-nav-link dashboard-nav-link--active"
					: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground font-medium transition-all dashboard-nav-link text-sm"}>
											{item.icon && <span className="nav-icon text-lg">{item.icon}</span>}
											{item.label}
											{item.badge !== undefined && item.badge > 0 && (<span className="count-badge ml-auto bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{item.badge}</span>)}
										</NavLink>
									</li>))}
							</ul>
						</nav>
					</div>
					
					<div className="sidebar-section border-t border-border pt-6">
						<div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3 sidebar-section-label">Quick links</div>
						<nav>
							<ul className="space-y-1 dashboard-nav">
								<li>
									<Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground font-medium transition-all dashboard-nav-link text-sm">
										<span className="nav-icon text-lg">🏠</span>
										Home
									</Link>
								</li>
								<li>
									<Link to="/mall" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground font-medium transition-all dashboard-nav-link text-sm">
										<span className="nav-icon text-lg">🛍️</span>
										Mall directory
									</Link>
								</li>
							</ul>
						</nav>
					</div>
				</div>
				<div className="p-4 border-t border-border mt-auto">
					<div className="text-xs font-bold text-muted-foreground text-center bg-secondary/50 py-2 rounded-lg border border-border/50 shadow-inner">
						Smart Mall v0.1.0
					</div>
				</div>
			</aside>
			
			<div className="flex-1 flex flex-col min-w-0">
				<header className="h-16 border-b border-border bg-background/80 backdrop-blur-lg flex items-center justify-between px-4 sm:px-8 z-10 dashboard-topbar">
					<div className="flex items-center gap-2 sm:gap-4">
						<Link to="/" className="md:hidden flex items-center justify-center p-2 mr-1">
							<span className="text-xl">🏬</span>
						</Link>
						<span className="hidden sm:inline-block text-muted-foreground/40 text-2xl font-light">/</span>
						<h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight dashboard-section-title truncate max-w-[150px] sm:max-w-none">{title}</h2>
					</div>
					<div className="flex items-center gap-2 sm:gap-6">
						<div className="topbar-search flex items-center gap-3 bg-secondary/50 hover:bg-secondary border border-border px-3 sm:px-4 py-2 rounded-xl cursor-pointer text-muted-foreground hover:text-foreground transition-all shadow-sm" role="button" tabIndex={0} onClick={openCommandPalette} onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					openCommandPalette();
				}
			}}>
							<span className="text-sm">🔍</span>
							<span className="hidden sm:inline-block text-sm font-medium mr-2">Search…</span>
							<kbd className="hidden lg:inline-block bg-background border border-border px-2 rounded text-xs font-bold shadow-sm">⌘K</kbd>
						</div>
						{user && (<div className="relative">
								<button type="button" onClick={() => setShowUserMenu((v) => !v)} className="inline-flex items-center gap-2 sm:gap-3 bg-transparent hover:bg-secondary p-1.5 sm:p-2 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 border border-transparent hover:border-border active:scale-[0.98]">
									<div className="dashboard-avatar h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md ring-2 ring-background ring-offset-1 ring-offset-border">
										{(user.full_name ?? user.username)?.[0]?.toUpperCase()}
									</div>
									<div className="hidden sm:block text-left">
										<div className="text-sm font-bold text-foreground leading-tight">{user.full_name ?? user.username}</div>
										<div className="text-xs font-semibold text-muted-foreground">{roleBadge}</div>
									</div>
									<span className="hidden sm:inline-block text-xs text-muted-foreground ml-1">▼</span>
								</button>
								{showUserMenu && (<>
										<div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}/>
										<div className="animate-fade-in user-menu-dropdown absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
											<div className="p-4 border-b border-border bg-secondary/30">
												<div className="font-bold text-sm text-foreground">{user.full_name ?? user.username}</div>
												<div className="text-xs font-medium text-muted-foreground mt-0.5 truncate">{user.email ?? user.username}</div>
											</div>
											<div className="p-2 space-y-1 bg-card">
												<Link to="/" className="user-menu-item flex items-center gap-3 px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary rounded-lg transition-colors" onClick={() => setShowUserMenu(false)}>
													<span className="text-lg">🏠</span> Home
												</Link>
												<button type="button" onClick={handleLogout} className="inline-flex items-center w-full gap-3 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 border border-transparent hover:border-destructive/20 text-left active:scale-[0.98]">
													<span className="text-lg">🚪</span> Sign out
												</button>
											</div>
										</div>
									</>)}
							</div>)}
					</div>
				</header>
				<main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-secondary/20 dashboard-main no-scrollbar">{children}</main>
			</div>
		</div>);
};
