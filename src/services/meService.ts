import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";

export type CurrentUserRole = "admin" | "client" | "lawyer";

export type CurrentUser = {
  id: string;
  email?: string;
  role: CurrentUserRole;
  mustChangePassword?: boolean;
  firstLoginCompletedAt?: string | null;
};

export type CurrentUserResponse = {
  user: CurrentUser;
};

export function createMeService(apiClient = createApiClient()) {
  return {
    getCurrentUser: () => apiClient.request<CurrentUserResponse>(apiContracts.me),
    changePassword: (newPassword: string) =>
      apiClient.request<CurrentUserResponse>(apiContracts.changePassword, {
        method: "POST",
        body: JSON.stringify({ newPassword })
      })
  };
}

export const meService = createMeService();
