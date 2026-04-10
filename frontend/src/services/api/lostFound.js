import { apiClient } from "./client";

export const lostFoundApi = {
  listMyReports: () => apiClient.get("/api/v1/lost-found/reports/my"),
  createReport: (payload) => apiClient.post("/api/v1/lost-found/reports", payload),
};
