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

// ─── Parking ────────────────────────────────────────────────
export interface ParkingSlot {
	slot_id: string;
	zone: string;
	floor: number;
	status: string;
	vehicle_number: string | null;
	reserved_by: string | null;
	duration_minutes: number;
}

export interface ParkingZoneStats {
	total: number;
	available: number;
	occupied: number;
	reserved: number;
	utilization_percent: number;
}

export interface ParkingSummary {
	total_slots: number;
	available: number;
	occupied: number;
	reserved: number;
	utilization_percent: number;
	is_peak: boolean;
	zone_stats: Record<string, ParkingZoneStats>;
}

// ─── Loyalty ────────────────────────────────────────────────
export interface LoyaltyTransaction {
	id: number;
	username: string;
	transaction_type: "earn" | "redeem";
	points: number;
	description: string;
	timestamp: number;
	store_id: number | null;
}

export interface LoyaltyAccount {
	username: string;
	total_points: number;
	lifetime_earned: number;
	lifetime_redeemed: number;
	tier: string;
	recent_transactions: LoyaltyTransaction[];
}

// ─── Complaints ─────────────────────────────────────────────
export interface ComplaintLog {
	message: string;
	author: string;
	timestamp: number;
}

export interface Complaint {
	id: number;
	username: string;
	category: string;
	subject: string;
	description: string;
	status: string;
	store_id: number | null;
	assigned_to: string | null;
	created_at: number;
	updated_at: number;
	logs: ComplaintLog[];
}

// ─── Notifications ──────────────────────────────────────────
export interface Notification {
	id: number;
	username: string;
	notification_type: string;
	title: string;
	message: string;
	is_read: boolean;
	created_at: number;
}

// ─── Offers ─────────────────────────────────────────────────
export interface Offer {
	id: number;
	store_id: number;
	title: string;
	description: string;
	discount_percent: number;
	status: string;
	start_time: number;
	end_time: number | null;
	redemption_count: number;
	max_redemptions: number | null;
	is_active: boolean;
	created_at: number;
}

// ─── Analytics ──────────────────────────────────────────────
export interface HeatmapZone {
	id: string;
	name: string;
	x: number;
	y: number;
	density: number;
	visitor_count: number;
	congestion_level: string;
}

export interface QueueEfficiencyData {
	store_id: number;
	name: string;
	type: string;
	queue_length: number;
	avg_service_time_min: number;
	predicted_wait_min: number;
	abandonment_rate_percent: number;
	efficiency_score: number;
}

export interface UserAccount {
	username: string;
	full_name: string | null;
	email: string | null;
	role: string;
	is_active: boolean;
}
