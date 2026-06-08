import { apiClient } from "./client";
export const offersApi = {
    listActive: (storeId?: number) => apiClient.get("/api/v1/offers/active", {
        params: { store_id: storeId },
    }),
    storeOffers: (storeId: number) => apiClient.get(`/api/v1/offers/store/${storeId}`),
    getOffer: (id: number) => apiClient.get(`/api/v1/offers/${id}`),
    redeemOffer: (id: number) => apiClient.post(`/api/v1/offers/${id}/redeem`),
    // Admin
    adminCreate: (data: any) => apiClient.post("/api/v1/offers/admin/create", data),
    adminUpdate: (id: number, data: any) => apiClient.put(`/api/v1/offers/admin/${id}`, data),
    adminDelete: (id: number) => apiClient.delete(`/api/v1/offers/admin/${id}`),
};
