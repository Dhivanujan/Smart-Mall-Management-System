// ─── User & Auth ────────────────────────────────────────────
export type UserRole = "admin" | "super_admin" | "customer" | "guest";

export interface AuthUser {
	username: string;
	full_name?: string | null;
	email?: string | null;
	role: UserRole;
}

// ─── Stores ─────────────────────────────────────────────────
export interface StoreSummary {
	id: number;
	name: string;
	category: string;
	status: string;
	average_rating: number;
	current_footfall: number;
	current_occupancy_percent: number;
}

export interface ProductSummary {
	id: number;
	name: string;
	price: number;
	category: string;
}

export interface StoreDetailsResponse {
	store: StoreSummary;
	products_sample: ProductSummary[];
	today_metrics: {
		today_revenue: number;
		today_transactions: number;
		conversion_rate_percent: number;
	};
}

export interface StoreProductsResponse {
	store: StoreSummary;
	products: ProductSummary[];
}

export interface StoresResponse {
	stores: StoreSummary[];
}

// ─── Admin ──────────────────────────────────────────────────
export interface AdminMetricsResponse {
	user: { full_name?: string | null; username: string };
	metrics: {
		total_stores: number;
		active_customers: number;
		daily_revenue: number;
		open_tickets: number;
	};
}

export interface StoreMetric {
	store_id: number;
	name: string;
	daily_revenue: number;
	footfall: number;
	open_tickets: number;
}

export interface StoreMetricsResponse {
	stores: StoreMetric[];
}

export interface MonitoringSnapshot {
	timestamp: string;
	footfall: {
		mall_total: number;
		by_zone: Record<string, number>;
	};
	alerts: { id: string; severity: string; message: string }[];
}

export interface MonitoringResponse {
	snapshot: MonitoringSnapshot;
}

// ─── Super Admin ────────────────────────────────────────────
export interface SuperMetricsResponse {
	metrics: {
		total_malls: number;
		total_stores: number;
		active_admins: number;
		system_uptime_days: number;
	};
}

export interface AdminSummary {
	username: string;
	full_name: string;
	mall: string;
}

export interface SuperAdminsResponse {
	admins: AdminSummary[];
}

export interface TenantSummary {
	mall_id: number;
	mall_name: string;
	monthly_recurring_revenue: number;
	occupancy_percent: number;
}

export interface TenantsResponse {
	tenants: TenantSummary[];
}

// ─── Navigation ─────────────────────────────────────────────
export interface NavItem {
	to: string;
	label: string;
	icon?: string;
	badge?: number;
}
