import { apiClient } from "./client";
export const complaintsApi = {
    getMyComplaints: () => apiClient.get("/api/v1/complaints/my"),
    createComplaint: (data) => apiClient.post("/api/v1/complaints/", data),
    getComplaint: (id) => apiClient.get(`/api/v1/complaints/${id}`),
    // Admin
    adminListAll: (status) => apiClient.get("/api/v1/complaints/admin/all", { params: { status } }),
    adminUpdateStatus: (id, status) => apiClient.put(`/api/v1/complaints/admin/${id}/status`, { status }),
    adminAssign: (id, assignee) => apiClient.put(`/api/v1/complaints/admin/${id}/assign`, { assignee }),
    adminEscalate: (id) => apiClient.post(`/api/v1/complaints/admin/${id}/escalate`),
    adminAddLog: (id, message) => apiClient.post(`/api/v1/complaints/admin/${id}/log`, { message }),
};
