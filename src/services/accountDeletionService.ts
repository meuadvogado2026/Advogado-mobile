import { apiContracts } from "../config/contracts";
import { createApiClient } from "./apiClient";
export type AccountDeletionRequestResponse = { request: { id: string; status: "requested" | "in_review" | "completed"; requestedAt: string; dueAt: string; priority: "normal" | "warning" | "overdue" } };
export function createAccountDeletionService(apiClient = createApiClient()) { return { create: () => apiClient.request<AccountDeletionRequestResponse>(apiContracts.accountDeletionRequests, { method: "POST" }) }; }
