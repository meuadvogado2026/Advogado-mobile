import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";

export type PrayerRequestResponse = {
  request: {
    id: string;
    status: "received";
    createdAt: string;
  };
};

export function createPrayerRequestService(apiClient = createApiClient()) {
  return {
    create: (input: { message: string; anonymous: boolean }) =>
      apiClient.request<PrayerRequestResponse>(apiContracts.prayerRequests, {
        method: "POST",
        body: JSON.stringify(input)
      })
  };
}

export const prayerRequestService = createPrayerRequestService();
