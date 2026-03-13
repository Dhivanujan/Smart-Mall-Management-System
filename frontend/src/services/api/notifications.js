import { apiClient } from "./client";
export const notificationsApi = {
    list: (unreadOnly = false) => apiClient.get("/api/v1/notifications/", { params: { unread_only: unreadOnly } }),
    markRead: (id) => apiClient.post(`/api/v1/notifications/${id}/read`),
    markAllRead: () => apiClient.post("/api/v1/notifications/read-all"),
};
