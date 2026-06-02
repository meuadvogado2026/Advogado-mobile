import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";

export type CurrentUserRole = "admin" | "client" | "lawyer";

export type CurrentUser = {
  id: string;
  email?: string;
  role: CurrentUserRole;
};

export type CurrentUserResponse = {
  user: CurrentUser;
};

export function createMeService(apiClient = createApiClient()) {
  return {
    getCurrentUser: () => apiClient.request<CurrentUserResponse>(apiContracts.me)
  };
}

export const meService = createMeService();
