import { apiClient } from "./client";
import type { Offer } from "@/types";

export const offersApi = {
	listActive: (storeId?: number) =>
		apiClient.get<{ offers: Offer[] }>("/api/v1/offers/active", {
			params: { store_id: storeId },
		}),

	storeOffers: (storeId: number) =>
		apiClient.get<{ offers: Offer[]; stats: Record<string, number> }>(
			`/api/v1/offers/store/${storeId}`
		),

	getOffer: (id: number) =>
		apiClient.get<{ offer: Offer }>(`/api/v1/offers/${id}`),

	redeemOffer: (id: number) =>
		apiClient.post<{ message: string; offer: Offer }>(`/api/v1/offers/${id}/redeem`),

	// Admin
	adminCreate: (data: {
		store_id: number;
		title: string;
		description: string;
		discount_percent: number;
		end_time?: number;
		max_redemptions?: number;
	}) => apiClient.post<{ message: string; offer: Offer }>("/api/v1/offers/admin/create", data),

	adminUpdate: (id: number, data: Record<string, unknown>) =>
		apiClient.put<{ message: string; offer: Offer }>(`/api/v1/offers/admin/${id}`, data),

	adminDelete: (id: number) =>
		apiClient.delete<{ message: string }>(`/api/v1/offers/admin/${id}`),
};
