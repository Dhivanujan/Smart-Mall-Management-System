import { apiClient } from "./client";
import type { LoyaltyAccount, LoyaltyTransaction } from "@/types";

export const loyaltyApi = {
	getAccount: () =>
		apiClient.get<{ account: LoyaltyAccount }>("/api/v1/loyalty/account"),

	getHistory: (limit = 20) =>
		apiClient.get<{ transactions: LoyaltyTransaction[]; total_transactions: number }>(
			"/api/v1/loyalty/history",
			{ params: { limit } }
		),

	earnPoints: (points: number, description: string, storeId?: number) =>
		apiClient.post("/api/v1/loyalty/earn", {
			points,
			description,
			store_id: storeId,
		}),

	redeemPoints: (points: number, description: string) =>
		apiClient.post("/api/v1/loyalty/redeem", { points, description }),
};
