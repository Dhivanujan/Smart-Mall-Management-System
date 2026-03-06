import { apiClient } from "./client";

export const storesApi = {
	list: (params?: { search?: string; category?: string; status?: string }) =>
		apiClient.get("/api/v1/stores/", { params }),

	getMap: () => apiClient.get("/api/v1/stores/map"),

	getDetails: (storeId: number) => apiClient.get(`/api/v1/stores/${storeId}`),

	getProducts: (storeId: number, search?: string) =>
		apiClient.get(`/api/v1/stores/${storeId}/products`, { params: { search } }),

	// Admin product management
	addProduct: (storeId: number, data: { name: string; price: number; category: string }) =>
		apiClient.post(`/api/v1/stores/${storeId}/products`, data),

	updateProduct: (storeId: number, productId: number, data: Record<string, unknown>) =>
		apiClient.put(`/api/v1/stores/${storeId}/products/${productId}`, data),

	deleteProduct: (storeId: number, productId: number) =>
		apiClient.delete(`/api/v1/stores/${storeId}/products/${productId}`),

	// Super admin store management
	adminCreate: (data: {
		name: string;
		category: string;
		address?: string;
		working_hours?: string;
		description?: string;
	}) => apiClient.post("/api/v1/stores/admin/create", data),

	adminUpdate: (storeId: number, data: Record<string, unknown>) =>
		apiClient.put(`/api/v1/stores/admin/${storeId}`, data),

	adminRemove: (storeId: number) =>
		apiClient.delete(`/api/v1/stores/admin/${storeId}`),
};

export const queuesApi = {
	getQueue: (storeId: number) => apiClient.get(`/api/v1/queues/${storeId}`),

	joinQueue: (storeId: number) => apiClient.post(`/api/v1/queues/${storeId}/join`),

	getStatus: (storeId: number, token?: number) =>
		apiClient.get(`/api/v1/queues/${storeId}/status`, { params: { token } }),
};
