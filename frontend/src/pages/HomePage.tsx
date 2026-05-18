import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { BarChart3, Building2, Zap, ShoppingBag, LayoutDashboard, Store, User, Compass, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
const FEATURES = [
    {
        icon: <BarChart3 className="w-8 h-8 text-primary" />,
        label: "Mall admins",
        title: "Store performance at a glance",
        desc: "Track revenue, footfall, and support tickets in real time.",
        tags: ["Live metrics", "Tickets", "Revenue"],
    },
    {
        icon: <Building2 className="w-8 h-8 text-indigo-500" />,
        label: "Super admins",
        title: "Multi-mall command center",
        desc: "Manage malls, admins, and tenants from a single pane of glass.",
        tags: ["Malls", "Occupancy", "Billing"],
    },
    {
        icon: <Zap className="w-8 h-8 text-amber-500" />,
        label: "Operations",
        title: "Operational health in real time",
        desc: "Monitor alerts, SLA compliance, and system health at scale.",
        tags: ["Alerts", "SLAs", "Uptime"],
    },
    {
        icon: <ShoppingBag className="w-8 h-8 text-rose-500" />,
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8 relative overflow-hidden font-sans">
            {/* Enhanced Animated Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
                <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-primary/5 rounded-full blur-[150px] mix-blend-normal animate-pulse duration-10000"></div>
                <div className="absolute bottom-0 left-0 w-[60vw] h-[60vh] bg-indigo-500/5 rounded-full blur-[120px] mix-blend-normal animate-pulse duration-7000" style={{ animationDelay: "2s" }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            </div>

            {/* Navbar / Header */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-7xl flex justify-between items-center py-6 relative z-10"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">SmartMall</span>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <button onClick={() => { logout(); navigate("/"); }} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Sign out
                        </button>
                    ) : (
                        <Link to="/login?role=customer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Sign In
                        </Link>
                    )}
                </div>
            </motion.header>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 mt-8 lg:mt-12 mb-20 relative z-10 flex-1"
            >
                <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold mb-8 shadow-sm backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Enterprise-Grade Mall Operations
                    </motion.div>
                    
                    <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
                        <span className="text-foreground">Orchestrate your malls</span><br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-600">with absolute precision.</span>
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
                        The intelligent command center for super admins, operators, and customers. Unify footfall, revenue, and store management in one beautiful platform.
                    </motion.p>

                    {/* Stats row */}
                    <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-8 mb-12 w-full">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center lg:items-start relative group">
                                <div className="text-4xl font-black text-foreground tracking-tighter mb-1 relative z-10">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider relative z-10">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap gap-4 w-full justify-center lg:justify-start">
                        {user ? (
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                {user.role === "customer" && (
                                    <Link to="/dashboard" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                                        <LayoutDashboard className="w-5 h-5" /> 
                                        Go to Dashboard
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                                {["admin", "super_admin"].includes(user.role) && (
                                    <Link to="/admin" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                                        <BarChart3 className="w-5 h-5" /> 
                                        Admin Console
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                                {user.role === "super_admin" && (
                                    <Link to="/super-admin" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-card-foreground border border-border/50 font-bold rounded-2xl hover:bg-secondary/50 transition-all hover:-translate-y-1 shadow-lg shadow-black/5">
                                        <Building2 className="w-5 h-5" /> Super Admin
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col w-full max-w-md gap-4">
                                <Link to="/mall" className="group w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 text-lg">
                                    <Compass className="w-6 h-6" /> Explore Mall Directory
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <div className="grid grid-cols-2 gap-4">
                                    <Link to="/login?role=admin" className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border/50 text-foreground font-semibold rounded-xl hover:bg-secondary/50 transition-all hover:-translate-y-0.5 shadow-sm">
                                        <Store className="w-4 h-4 text-primary" /> For Stores
                                    </Link>
                                    <Link to="/login?role=super_admin" className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border/50 text-foreground font-semibold rounded-xl hover:bg-secondary/50 transition-all hover:-translate-y-0.5 shadow-sm">
                                        <Building2 className="w-4 h-4 text-primary" /> For Ops
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
                
                <motion.div variants={itemVariants} className="flex-1 w-full max-w-2xl lg:mt-0 mt-12 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative z-10">
                        {FEATURES.map((f, i) => (
                            <motion.div 
                                key={f.label} 
                                whileHover={{ y: -5, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="bg-card/40 backdrop-blur-xl text-card-foreground border border-border/50 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                
                                <div className="mb-6 inline-flex p-3 rounded-2xl bg-gradient-to-br from-background to-secondary/50 border border-border/50 shadow-inner">
                                    {f.icon}
                                </div>
                                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{f.label}</div>
                                <div className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">{f.title}</div>
                                <div className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                    {f.desc}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {f.tags.map((tag) => (
                                        <span key={tag} className="px-3 py-1 bg-background/50 backdrop-blur-sm border border-border/30 text-foreground text-xs font-medium rounded-lg">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
            
            <motion.footer 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="w-full max-w-7xl py-8 mt-auto border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-medium text-muted-foreground relative z-10"
            >
                <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>&copy; {new Date().getFullYear()} Smart Mall Management System</span>
                </div>
                <div className="flex gap-6 sm:gap-8">
                    <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
                    <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
                    <Link to="#" className="hover:text-primary transition-colors">Help</Link>
                </div>
            </motion.footer>
        </div>
    );
};
