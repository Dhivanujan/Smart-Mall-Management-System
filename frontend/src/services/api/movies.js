import { apiClient } from "./client";

export const moviesApi = {
  listBookings: () => apiClient.get("/api/v1/movies/bookings"),
  createBooking: (payload) => apiClient.post("/api/v1/movies/bookings", payload),
  cancelBooking: (bookingId) => apiClient.delete(`/api/v1/movies/bookings/${bookingId}`),
  adminListBookings: (params = {}) => apiClient.get("/api/v1/movies/admin/bookings", { params }),
  adminUpdateBookingStatus: (bookingId, bookingStatus) =>
    apiClient.put(`/api/v1/movies/admin/bookings/${bookingId}/status`, {
      booking_status: bookingStatus,
    }),
};
