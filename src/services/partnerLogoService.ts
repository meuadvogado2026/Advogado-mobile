import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";

export type PartnerLogo = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PartnerLogosResponse = {
  partners: PartnerLogo[];
  persistence: string;
};

export function createPartnerLogoService(apiClient = createApiClient()) {
  return {
    listPublic: () => apiClient.request<PartnerLogosResponse>(apiContracts.partnerLogos)
  };
}

export const partnerLogoService = createPartnerLogoService();
