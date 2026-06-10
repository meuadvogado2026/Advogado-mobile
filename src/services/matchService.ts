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
  distanceReliable?: boolean;
  distanceNotice?: string;
  status: "stub" | "matched" | "empty";
  algorithmVersion?: string;
  message?: string;
};

export type CityMatchRequest = {
  stateId: string;
  cityId: string;
  areaIds: string[];
  page: number;
  pageSize: 5;
};

export type CityMatchLawyer = NonNullable<MatchResponse["lawyer"]>;

export type CityMatchResponse = {
  status: "matched" | "empty";
  lawyers: CityMatchLawyer[];
  pagination: { page: number; pageSize: 5; total: number; totalPages: number };
  algorithmVersion: "city-list-v1";
};

export function createMatchService(apiClient = createApiClient()) {
  return {
    requestMatch: (payload: MatchRequest) =>
      apiClient.request<MatchResponse>(apiContracts.match, {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    requestCityMatch: (payload: CityMatchRequest) =>
      apiClient.request<CityMatchResponse>(apiContracts.matchByCity, {
        method: "POST",
        body: JSON.stringify(payload)
      })
  };
}

export const matchService = createMatchService();
