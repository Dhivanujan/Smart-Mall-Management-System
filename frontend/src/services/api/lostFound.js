import { apiClient } from "./client";

export const lostFoundApi = {
  listMyReports: () => apiClient.get("/api/v1/lost-found/reports/my"),
  createReport: (payload) => apiClient.post("/api/v1/lost-found/reports", payload),
  adminListReports: (params = {}) => apiClient.get("/api/v1/lost-found/admin/reports", { params }),
  adminUpdateReportStatus: (reportId, status) =>
    apiClient.put(`/api/v1/lost-found/admin/reports/${reportId}/status`, { status }),
};
