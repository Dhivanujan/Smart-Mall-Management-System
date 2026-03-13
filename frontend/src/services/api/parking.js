import { apiClient } from "./client";
export const parkingApi = {
    getSummary: () => apiClient.get("/api/v1/parking/summary"),
    getSlots: (zone, status) => apiClient.get("/api/v1/parking/slots", {
        params: { zone, status },
    }),
    getAvailable: (zone) => apiClient.get("/api/v1/parking/available", { params: { zone } }),
    reserveSlot: (zone) => apiClient.post("/api/v1/parking/reserve", { zone }),
    releaseSlot: (slotId) => apiClient.post(`/api/v1/parking/release/${slotId}`),
    getMySlots: () => apiClient.get("/api/v1/parking/my-slots"),
    getAdminOverview: () => apiClient.get("/api/v1/parking/admin/overview"),
};
