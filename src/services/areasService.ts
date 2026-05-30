import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";

export type LegalArea = {
  id: string;
  slug: string;
  name: string;
  active?: boolean;
};

export type AreasResponse = {
  areas: LegalArea[];
};

export function createAreasService(apiClient = createApiClient()) {
  return {
    listAreas: () => apiClient.request<AreasResponse>(apiContracts.areas)
  };
}

export const areasService = createAreasService();
