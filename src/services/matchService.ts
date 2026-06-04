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
    whatsapp?: string;
    city?: string | null;
    state?: string | null;
    areaIds?: string[];
    avatarUrl?: string | null;
    coverUrl?: string | null;
  };
  // distanceKm vem no nivel raiz da resposta do backend (irmao de lawyer).
  distanceKm?: number;
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
