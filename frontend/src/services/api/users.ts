import { apiClient } from "./client";
import type { UserAccount } from "@/types";

export const usersApi = {
	register: (data: {
		username: string;
		password: string;
		full_name: string;
		email?: string;
	}) => apiClient.post("/api/v1/users/register", { ...data, role: "customer" }),

	getProfile: () => apiClient.get("/api/v1/users/profile"),

	updateProfile: (data: { full_name?: string; email?: string }) =>
		apiClient.put("/api/v1/users/profile", data),

	// Super admin
	adminList: (role?: string) =>
		apiClient.get<{ users: UserAccount[]; total: number }>("/api/v1/users/admin/list", {
			params: { role },
		}),

	adminCreate: (data: {
		username: string;
		password: string;
		full_name: string;
		email?: string;
		role: string;
	}) => apiClient.post("/api/v1/users/admin/create", data),

	adminUpdate: (username: string, data: Record<string, unknown>) =>
		apiClient.put(`/api/v1/users/admin/${username}`, data),

	adminResetPassword: (username: string, newPassword: string) =>
		apiClient.post(`/api/v1/users/admin/${username}/reset-password`, {
			new_password: newPassword,
		}),

	adminDelete: (username: string) =>
		apiClient.delete(`/api/v1/users/admin/${username}`),
};
