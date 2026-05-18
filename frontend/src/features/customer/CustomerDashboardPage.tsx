import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/services/api/client";
import { useAuth } from "@/app/providers/AuthProvider";
import { favoritesApi } from "@/services/api/favorites";
import { discoveryApi } from "@/services/api/discovery";
import {
    Store, Ticket, ParkingCircle, Star,
    Tag, Calendar, Clapperboard, Bot, Map, Info, Search, Bell, ClipboardList,
    Heart, Zap, Sparkles, Flame, ArrowRight, Users, TrendingUp
} from "lucide-react";

const ACTIONS = [
    { to: "/mall",    icon: Store,         label: "Browse Stores", color: "blue" },
    { to: "/queue",   icon: Ticket,        label: "Join Queue",    color: "purple" },
    { to: "/parking", icon: ParkingCircle, label: "Parking",       color: "green" },
    { to: "/loyalty", icon: Star,          label: "Loyalty",       color: "amber" },
];

const QUICK_LINKS = [
    { to: "/offers",        icon: Tag,           label: "Active Offers" },
    { to: "/events",        icon: Calendar,      label: "Events" },
    { to: "/movies",        icon: Clapperboard,  label: "Cinema" },
    { to: "/ai-concierge",  icon: Bot,           label: "AI Concierge" },
    { to: "/map",           icon: Map,           label: "Mall Map" },
    { to: "/services",      icon: Info,          label: "Services" },
    { to: "/lost-found",    icon: Search,        label: "Lost & Found" },
    { to: "/notifications", icon: Bell,          label: "Notifications" },
    { to: "/complaints",    icon: ClipboardList, label: "Complaints" },
];

export const CustomerDashboardPage = () => {
    const { user } = useAuth();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favoriteStores, setFavoriteStores] = useState([]);
    const [trendingStores, setTrendingStores] = useState([]);
    const [greeting, setGreeting] = useState("Good morning");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 18) setGreeting("Good evening");
        else if (hour >= 12) setGreeting("Good afternoon");
    }, []);

    useEffect(() => {
        Promise.all([
            apiClient.get("/api/v1/stores/"),
            favoritesApi.list(),
            discoveryApi.trendingStores(3),
        ]).then(([storesRes, favoritesRes, trendingRes]) => {
            setStores(storesRes.data.stores);
            setFavoriteStores(favoritesRes.data.stores ?? []);
            setTrendingStores(trendingRes.data.stores ?? []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const openStores = stores.filter((s: any) => s.status === "open");

    return (
        <div style={{ display: "grid", gap: "1.5rem" }}>
            {/* Welcome */}
            <div className="welcome-section">
                <h1 className="welcome-greeting">
                    {greeting}, <span className="name">{user?.full_name ?? "Customer"}</span>
                </h1>
                <p className="welcome-subtitle">Your smart mall companion — explore stores, manage queues, and earn rewards.</p>
            </div>

            {/* Main actions */}
            <div className="action-grid">
                {ACTIONS.map((a) => {
                    const Icon = a.icon;
                    return (
                        <Link key={a.to} to={a.to} className="action-card animate-fade-in-up">
                            <span className="action-card-icon"><Icon className="w-5 h-5" /></span>
                            <span className="action-card-text">
                                <span className="action-card-label">{a.label}</span>
                                <span className="action-card-value flex items-center gap-1">
                                    {a.to === "/mall" ? `${openStores.length} Open` : <>Open <ArrowRight className="w-3 h-3" /></>}
                                </span>
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Quick access */}
            <div className="panel">
                <div className="panel-header">
                    <h2 className="panel-title"><Zap className="w-5 h-5 text-amber-500" /> Quick Access</h2>
                </div>
                <div className="action-grid" style={{ marginBottom: 0 }}>
                    {QUICK_LINKS.map((l) => {
                        const Icon = l.icon;
                        return (
                            <Link key={l.to} to={l.to} className="action-card">
                                <span className="action-card-icon"><Icon className="w-4 h-4" /></span>
                                <span className="action-card-text">
                                    <span className="action-card-label">{l.label}</span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* For You */}
            {!loading && (
                <div className="panel animate-fade-in-up stagger-5">
                    <div className="panel-header">
                        <h2 className="panel-title"><Sparkles className="w-5 h-5 text-indigo-500" /> For You</h2>
                        <Link to="/ai-concierge" className="btn btn-ghost btn-sm">AI Concierge</Link>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                        <div className="store-card">
                            <div className="store-card-header"><h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}><Heart className="w-3.5 h-3.5 inline mr-1 text-rose-500" />Favorite Stores</h3></div>
                            {favoriteStores.length ? favoriteStores.slice(0, 3).map((s: any) => (
                                <div key={s.id} style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", padding: "0.25rem 0" }}>{s.name}</div>
                            )) : <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>No favorites yet.</div>}
                        </div>
                        <div className="store-card">
                            <div className="store-card-header"><h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}><TrendingUp className="w-3.5 h-3.5 inline mr-1 text-blue-500" />Trending Stores</h3></div>
                            {trendingStores.length ? trendingStores.map((s: any) => (
                                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "0.25rem 0" }}>
                                    <span style={{ color: "var(--color-text-muted)" }}>{s.name}</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Users className="w-3 h-3" /> {s.current_footfall}</span>
                                </div>
                            )) : <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>No trends right now.</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* Popular Stores */}
            {!loading && openStores.length > 0 && (
                <div className="panel animate-fade-in-up stagger-6">
                    <div className="panel-header">
                        <h2 className="panel-title"><Flame className="w-5 h-5 text-rose-500" /> Popular Stores</h2>
                        <Link to="/mall" className="btn btn-ghost btn-sm">View all</Link>
                    </div>
                    <div className="store-grid">
                        {openStores.slice(0, 4).map((store: any) => (
                            <Link key={store.id} to={`/mall/stores/${store.id}`} className="store-card" style={{ textDecoration: "none" }}>
                                <div className="store-card-header">
                                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{store.name}</h3>
                                    <span className="status-badge open"><span className="dot" />{store.status}</span>
                                </div>
                                <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-dim)", marginBottom: "0.75rem" }}>{store.category}</div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                        <span style={{ fontWeight: 700 }}>{store.average_rating.toFixed(1)}</span>
                                    </span>
                                    <span style={{ color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                        <Users className="w-3.5 h-3.5" /> {store.current_footfall}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
