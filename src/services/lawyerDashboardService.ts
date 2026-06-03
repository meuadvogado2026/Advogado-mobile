import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";

export type LawyerDashboardResponse = {
  lawyer: {
    id: string;
    name: string;
    oabNumber: string;
    oabState: string;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    planLabel: string;
    verified: boolean;
  };
  metrics: {
    profileViews: number;
    whatsappClicks: number;
    contacts: number;
  };
  benefits: Array<{
    id: string;
    title: string;
    description: string;
    badge?: string;
  }>;
};

export function createLawyerDashboardService(apiClient = createApiClient()) {
  return {
    getDashboard: () => apiClient.request<LawyerDashboardResponse>(apiContracts.lawyerDashboard)
  };
}

export const lawyerDashboardService = createLawyerDashboardService();
