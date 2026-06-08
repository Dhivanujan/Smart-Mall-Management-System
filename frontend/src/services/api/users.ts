import { apiClient } from "./client";
export const usersApi = {
    register: (data: any) => apiClient.post("/api/v1/users/register", { ...data, role: "customer" }),
    getProfile: () => apiClient.get("/api/v1/users/profile"),
    updateProfile: (data: any) => apiClient.put("/api/v1/users/profile", data),
    // Super admin
    adminList: (role?: string) => apiClient.get("/api/v1/users/admin/list", {
        params: { role },
    }),
    adminCreate: (data: any) => apiClient.post("/api/v1/users/admin/create", data),
    adminUpdate: (username: string, data: any) => apiClient.put(`/api/v1/users/admin/${username}`, data),
    adminResetPassword: (username: string, newPassword: string) => apiClient.post(`/api/v1/users/admin/${username}/reset-password`, {
        new_password: newPassword,
    }),
    adminDelete: (username: string) => apiClient.delete(`/api/v1/users/admin/${username}`),
};
