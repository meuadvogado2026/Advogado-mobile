import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";

export type PublicState = { id: string; code: string; name: string; active: true };
export type PublicCity = { id: string; stateId: string; stateCode: string; name: string; active: true };

function withAreaQuery(path: string, areaIds: string[] = []) {
  if (areaIds.length === 0) return path;
  return `${path}?areaIds=${encodeURIComponent(areaIds.join(","))}`;
}

export function createGeographyService(apiClient = createApiClient()) {
  return {
    listStates: (areaIds: string[] = []) =>
      apiClient.request<{ states: PublicState[] }>(withAreaQuery(apiContracts.states, areaIds)),
    listCities: (stateId: string, areaIds: string[] = []) =>
      apiClient.request<{ cities: PublicCity[] }>(
        withAreaQuery(apiContracts.stateCities.replace(":stateId", encodeURIComponent(stateId)), areaIds)
      )
  };
}

export const geographyService = createGeographyService();
