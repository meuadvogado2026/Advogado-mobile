import { apiContracts } from "../config/contracts";
import type { createApiClient } from "./apiClient";

type ApiClient = ReturnType<typeof createApiClient>;

export type ClientSignupInput = {
  name: string;
  email: string;
  password: string;
};

export type ClientSignupResponse = {
  user: {
    id: string;
    email: string;
    role: "client";
  };
  persistence: "memory" | "supabase";
};

export function createClientSignupService(apiClient: ApiClient) {
  return {
    create(input: ClientSignupInput) {
      return apiClient.request<ClientSignupResponse>(apiContracts.clientSignup, {
        method: "POST",
        body: JSON.stringify(input)
      });
    }
  };
}
