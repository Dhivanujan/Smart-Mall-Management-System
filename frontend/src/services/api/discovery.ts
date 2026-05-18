import { apiClient } from "./client";

export const discoveryApi = {
  trendingStores: (limit = 5) => apiClient.get("/api/v1/discovery/trending-stores", { params: { limit } }),
  concierge: (query) => apiClient.post("/api/v1/discovery/concierge", { query }),
};
