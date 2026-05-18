import { apiClient } from "./client";

export const favoritesApi = {
  list: () => apiClient.get("/api/v1/favorites/"),
  addStore: (storeId) => apiClient.post(`/api/v1/favorites/stores/${storeId}`),
  removeStore: (storeId) => apiClient.delete(`/api/v1/favorites/stores/${storeId}`),
  addOffer: (offerId) => apiClient.post(`/api/v1/favorites/offers/${offerId}`),
  removeOffer: (offerId) => apiClient.delete(`/api/v1/favorites/offers/${offerId}`),
};
