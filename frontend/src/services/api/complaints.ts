import { apiClient } from "./client";
import type { Complaint } from "@/types";

export const complaintsApi = {
	getMyComplaints: () =>
		apiClient.get<{ complaints: Complaint[]; total: number }>("/api/v1/complaints/my"),

	createComplaint: (data: {
		category: string;
		subject: string;
		description: string;
		store_id?: number;
	}) => apiClient.post<{ message: string; complaint: Complaint }>("/api/v1/complaints/", data),

	getComplaint: (id: number) =>
		apiClient.get<{ complaint: Complaint }>(`/api/v1/complaints/${id}`),

	// Admin
	adminListAll: (status?: string) =>
		apiClient.get("/api/v1/complaints/admin/all", { params: { status } }),

	adminUpdateStatus: (id: number, status: string) =>
		apiClient.put(`/api/v1/complaints/admin/${id}/status`, { status }),

	adminAssign: (id: number, assignee: string) =>
		apiClient.put(`/api/v1/complaints/admin/${id}/assign`, { assignee }),

	adminEscalate: (id: number) =>
		apiClient.post(`/api/v1/complaints/admin/${id}/escalate`),

	adminAddLog: (id: number, message: string) =>
		apiClient.post(`/api/v1/complaints/admin/${id}/log`, { message }),
};
