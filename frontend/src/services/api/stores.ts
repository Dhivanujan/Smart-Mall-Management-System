import { apiClient } from "./client";
export const storesApi = {
    list: (params) => apiClient.get("/api/v1/stores/", { params }),
    getMap: () => apiClient.get("/api/v1/stores/map"),
    getDetails: (storeId) => apiClient.get(`/api/v1/stores/${storeId}`),
    getProducts: (storeId, search) => apiClient.get(`/api/v1/stores/${storeId}/products`, { params: { search } }),
    // Admin product management
    addProduct: (storeId, data) => apiClient.post(`/api/v1/stores/${storeId}/products`, data),
    updateProduct: (storeId, productId, data) => apiClient.put(`/api/v1/stores/${storeId}/products/${productId}`, data),
    deleteProduct: (storeId, productId) => apiClient.delete(`/api/v1/stores/${storeId}/products/${productId}`),
    // Super admin store management
    adminCreate: (data) => apiClient.post("/api/v1/stores/admin/create", data),
    adminUpdate: (storeId, data) => apiClient.put(`/api/v1/stores/admin/${storeId}`, data),
    adminRemove: (storeId) => apiClient.delete(`/api/v1/stores/admin/${storeId}`),
};
export const queuesApi = {
    getQueue: (storeId) => apiClient.get(`/api/v1/queues/${storeId}`),
    joinQueue: (storeId) => apiClient.post(`/api/v1/queues/${storeId}/join`),
    getStatus: (storeId, token) => apiClient.get(`/api/v1/queues/${storeId}/status`, { params: { token } }),
    adminList: () => apiClient.get("/api/v1/admin/queues"),
    adminNext: (storeId) => apiClient.post(`/api/v1/admin/queues/${storeId}/next`),
    adminSkip: (storeId) => apiClient.post(`/api/v1/admin/queues/${storeId}/skip`),
    adminPause: (storeId) => apiClient.post(`/api/v1/admin/queues/${storeId}/pause`),
    adminResume: (storeId) => apiClient.post(`/api/v1/admin/queues/${storeId}/resume`),
};
