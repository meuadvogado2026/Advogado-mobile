import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";

export type MatchRequest = {
  lat: number;
  lng: number;
  accuracyM: number;
  areaIds: string[];
};

export type MatchResponse = {
  lawyer: null | {
    id: string;
    name: string;
    distanceKm?: number;
    whatsapp?: string;
  };
  status: "stub" | "matched" | "empty";
  algorithmVersion?: string;
  message?: string;
};

export function createMatchService(apiClient = createApiClient()) {
  return {
    requestMatch: (payload: MatchRequest) =>
      apiClient.request<MatchResponse>(apiContracts.match, {
        method: "POST",
        body: JSON.stringify(payload)
      })
  };
}

export const matchService = createMatchService();
