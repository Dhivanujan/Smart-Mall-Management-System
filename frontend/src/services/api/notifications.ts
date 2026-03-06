import { apiClient } from "./client";
import type { Notification } from "@/types";

export const notificationsApi = {
	list: (unreadOnly = false) =>
		apiClient.get<{ notifications: Notification[]; total: number; unread_count: number }>(
			"/api/v1/notifications/",
			{ params: { unread_only: unreadOnly } }
		),

	markRead: (id: number) =>
		apiClient.post<{ success: boolean; unread_count: number }>(
			`/api/v1/notifications/${id}/read`
		),

	markAllRead: () =>
		apiClient.post<{ marked_read: number; unread_count: number }>(
			"/api/v1/notifications/read-all"
		),
};
