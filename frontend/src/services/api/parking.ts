import { apiClient } from "./client";
import type { ParkingSummary, ParkingSlot } from "@/types";

export const parkingApi = {
	getSummary: () => apiClient.get<{ parking: ParkingSummary }>("/api/v1/parking/summary"),

	getSlots: (zone?: string, status?: string) =>
		apiClient.get<{ slots: ParkingSlot[]; total: number }>("/api/v1/parking/slots", {
			params: { zone, status },
		}),

	getAvailable: (zone?: string) =>
		apiClient.get<{
			available: ParkingSlot[];
			total_available: number;
			suggested_slot: ParkingSlot | null;
			is_peak: boolean;
		}>("/api/v1/parking/available", { params: { zone } }),

	reserveSlot: (zone?: string) =>
		apiClient.post<{ message: string; slot: ParkingSlot }>("/api/v1/parking/reserve", { zone }),

	releaseSlot: (slotId: string) =>
		apiClient.post<{ message: string; slot: ParkingSlot }>(`/api/v1/parking/release/${slotId}`),

	getMySlots: () => apiClient.get<{ slots: ParkingSlot[] }>("/api/v1/parking/my-slots"),

	getAdminOverview: () =>
		apiClient.get("/api/v1/parking/admin/overview"),
};
