import { apiClient } from "./client";
export const loyaltyApi = {
    getAccount: () => apiClient.get("/api/v1/loyalty/account"),
    getHistory: (limit = 20) => apiClient.get("/api/v1/loyalty/history", { params: { limit } }),
    earnPoints: (points, description, storeId) => apiClient.post("/api/v1/loyalty/earn", {
        points,
        description,
        store_id: storeId,
    }),
    redeemPoints: (points, description) => apiClient.post("/api/v1/loyalty/redeem", { points, description }),
};
