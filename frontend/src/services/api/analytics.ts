import { apiClient } from "./client";

export const analyticsApi = {
	// Store admin
	storeSales: (period = "weekly") =>
		apiClient.get("/api/v1/analytics/store/sales", { params: { period } }),

	storeCustomers: () =>
		apiClient.get("/api/v1/analytics/store/customers"),

	// Super admin
	mallOverview: () =>
		apiClient.get("/api/v1/analytics/mall/overview"),

	mallCrowd: () =>
		apiClient.get("/api/v1/analytics/mall/crowd"),

	mallQueueEfficiency: () =>
		apiClient.get("/api/v1/analytics/mall/queue-efficiency"),

	mallParking: () =>
		apiClient.get("/api/v1/analytics/mall/parking"),
};
