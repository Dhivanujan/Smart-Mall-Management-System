import type { NavItem } from "@/types";

export const ADMIN_NAV: NavItem[] = [
	{ to: "/admin", label: "Dashboard", icon: "📊" },
	{ to: "/admin/stores", label: "Stores", icon: "🏪" },
];

export const SUPER_ADMIN_NAV: NavItem[] = [
	{ to: "/super-admin", label: "Dashboard", icon: "📊" },
	{ to: "/super-admin/admins", label: "Admins", icon: "👥" },
	{ to: "/super-admin/tenants", label: "Tenants & Billing", icon: "💰" },
];
