import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";

export type LawyerEventPayload = {
  eventType: "profile_view" | "whatsapp_click";
  source: "mobile";
  dedupeKey?: string;
};

export type LawyerEventResponse = {
  recorded: boolean;
  duplicate?: boolean;
};

export function createLawyerEventService(apiClient = createApiClient()) {
  return {
    record: (lawyerId: string, payload: LawyerEventPayload) =>
      apiClient.request<LawyerEventResponse>(
        apiContracts.lawyerEvents.replace(":id", encodeURIComponent(lawyerId)),
        {
          method: "POST",
          body: JSON.stringify(payload)
        }
      )
  };
}

export const lawyerEventService = createLawyerEventService();
