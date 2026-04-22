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
export const HomePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    return (<div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-8" style={{ gap: "0" }}>
			<div className="w-full max-w-7xl animate-fade-in-up flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 mb-16 mt-8">
				<section className="flex-1 text-center lg:text-left">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold mb-8 shadow-sm">
						<span className="text-green-500 animate-pulse">●</span>
						Top-rated smart mall operations platform
					</div>
					<h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-primary leading-tight tracking-tight mb-6">
						Orchestrate your malls<br /><span className="text-foreground">with confidence.</span>
					</h1>
					<p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0">
						Smart Mall gives super admins and mall operators a live command center for stores, revenue,
						footfall, and support — all in one modern dashboard.
					</p>

					{/* Stats row */}
					<div className="flex flex-wrap justify-center lg:justify-start gap-8 sm:gap-12 mb-10 pb-8 border-b border-border">
						{STATS.map((stat) => (<div key={stat.label} className="text-center lg:text-left">
								<div className="text-4xl font-black text-primary tracking-tighter">
									{stat.value}
								</div>
								<div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">
									{stat.label}
								</div>
							</div>))}
					</div>

					<div className="flex flex-wrap justify-center lg:justify-start gap-4">
						{user ? (<>
								{user.role === "customer" && (<Link to="/dashboard" className="inline-flex items-center justify-center whitespace-nowrap px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-[0_4px_14px_0_rgba(var(--primary),0.39)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.23)] hover:bg-primary/95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
										🛍️ My Dashboard
									</Link>)}
								{["admin", "super_admin"].includes(user.role) && (<Link to="/admin" className="inline-flex items-center justify-center whitespace-nowrap px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-[0_4px_14px_0_rgba(var(--primary),0.39)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.23)] hover:bg-primary/95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
										📊 Open admin console
									</Link>)}
								{user.role === "super_admin" && (<Link to="/super-admin" className="inline-flex items-center justify-center whitespace-nowrap px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 border border-transparent shadow-sm active:scale-[0.98]">
										🏗️ Super admin overview
									</Link>)}
								<button type="button" className="inline-flex items-center justify-center whitespace-nowrap px-6 py-3 border border-border text-foreground font-bold rounded-lg hover:bg-secondary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]" onClick={() => { logout(); navigate("/"); }}>
									Sign out
								</button>
							</>) : (<>
								<Link to="/login" className="inline-flex items-center justify-center whitespace-nowrap px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-[0_4px_14px_0_rgba(var(--primary),0.39)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.23)] hover:bg-primary/95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
									Sign in to dashboard
								</Link>
								<Link to="/register" className="inline-flex items-center justify-center whitespace-nowrap px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 border border-transparent shadow-sm active:scale-[0.98]">
									Create account
								</Link>
								<Link to="/mall" className="inline-flex items-center justify-center whitespace-nowrap px-6 py-3 border border-border text-foreground font-bold rounded-xl hover:bg-secondary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]">
									🛍️ Browse mall directory
								</Link>
							</>)}
					</div>
				</section>
				
				<aside className="flex-1 w-full max-w-2xl">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6" aria-label="Role based entry cards">
						{FEATURES.map((f, i) => (<div key={f.label} className={`bg-card text-card-foreground border border-border p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up stagger-${i + 1}`}>
								<div className="text-4xl mb-4 bg-secondary/50 h-16 w-16 rounded-xl flex items-center justify-center border border-border">{f.icon}</div>
								<div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{f.label}</div>
								<div className="text-xl font-bold mb-2 leading-tight">{f.title}</div>
								<div className="text-sm text-muted-foreground mb-6 h-10">
									{f.desc}
								</div>
								<div className="flex flex-wrap gap-2">
									{f.tags.map((tag) => (<span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded shrink-0">{tag}</span>))}
								</div>
							</div>))}
					</div>
				</aside>
			</div>
			
			<footer className="w-full max-w-7xl py-8 mt-auto border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-medium text-muted-foreground">
				<div>&copy; {new Date().getFullYear()} Smart Mall Management System</div>
				<div className="flex gap-8">
					<Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
					<Link to="#" className="hover:text-primary transition-colors">Terms</Link>
					<Link to="#" className="hover:text-primary transition-colors">Help</Link>
				</div>
			</footer>
		</div>);
};
