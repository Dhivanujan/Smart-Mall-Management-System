import { apiClient } from "./client";
export const usersApi = {
    register: (data) => apiClient.post("/api/v1/users/register", { ...data, role: "customer" }),
    getProfile: () => apiClient.get("/api/v1/users/profile"),
    updateProfile: (data) => apiClient.put("/api/v1/users/profile", data),
    // Super admin
    adminList: (role) => apiClient.get("/api/v1/users/admin/list", {
        params: { role },
    }),
    adminCreate: (data) => apiClient.post("/api/v1/users/admin/create", data),
    adminUpdate: (username, data) => apiClient.put(`/api/v1/users/admin/${username}`, data),
    adminResetPassword: (username, newPassword) => apiClient.post(`/api/v1/users/admin/${username}/reset-password`, {
        new_password: newPassword,
    }),
    adminDelete: (username) => apiClient.delete(`/api/v1/users/admin/${username}`),
};
