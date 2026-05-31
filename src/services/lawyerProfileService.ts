import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";

export type PublicLawyerProfile = {
  id: string;
  name: string;
  oabNumber: string;
  oabState: string;
  city: string | null;
  state: string | null;
  areaIds: string[];
  areas: Array<{ id: string; name: string }>;
  whatsapp?: string | null;
  verified: boolean;
};

export type LawyerProfileResponse = {
  lawyer: PublicLawyerProfile;
};

export function createLawyerProfileService(apiClient = createApiClient()) {
  return {
    getById: (lawyerId: string) =>
      apiClient.request<LawyerProfileResponse>(apiContracts.lawyerProfile.replace(":id", encodeURIComponent(lawyerId)))
  };
}

export const lawyerProfileService = createLawyerProfileService();
