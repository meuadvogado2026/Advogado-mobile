import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";

export type PublicState = { id: string; code: string; name: string; active: true };
export type PublicCity = { id: string; stateId: string; stateCode: string; name: string; active: true };

export function createGeographyService(apiClient = createApiClient()) {
  return {
    listStates: () => apiClient.request<{ states: PublicState[] }>(apiContracts.states),
    listCities: (stateId: string) =>
      apiClient.request<{ cities: PublicCity[] }>(
        apiContracts.stateCities.replace(":stateId", encodeURIComponent(stateId))
      )
  };
}

export const geographyService = createGeographyService();
