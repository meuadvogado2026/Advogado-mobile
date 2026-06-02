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
  avatarUrl?: string | null;
  coverUrl?: string | null;
  miniBio?: string | null;
  fullBio?: string | null;
  yearsExperience?: number | null;
  planLabel?: string | null;
  emergencyAvailable?: boolean;
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
