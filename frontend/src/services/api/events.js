import { apiClient } from "./client";

export const eventsApi = {
  listReminders: () => apiClient.get("/api/v1/events/reminders"),
  createReminder: (payload) => apiClient.post("/api/v1/events/reminders", payload),
  removeReminder: (eventId) => apiClient.delete(`/api/v1/events/reminders/${eventId}`),
};
