import { apiClient } from "./client";
export const offersApi = {
    listActive: (storeId) => apiClient.get("/api/v1/offers/active", {
        params: { store_id: storeId },
    }),
    storeOffers: (storeId) => apiClient.get(`/api/v1/offers/store/${storeId}`),
    getOffer: (id) => apiClient.get(`/api/v1/offers/${id}`),
    redeemOffer: (id) => apiClient.post(`/api/v1/offers/${id}/redeem`),
    // Admin
    adminCreate: (data) => apiClient.post("/api/v1/offers/admin/create", data),
    adminUpdate: (id, data) => apiClient.put(`/api/v1/offers/admin/${id}`, data),
    adminDelete: (id) => apiClient.delete(`/api/v1/offers/admin/${id}`),
};
