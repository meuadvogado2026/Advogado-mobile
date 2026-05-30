import { apiContracts } from "../config/contracts";
import { publicConfig, type PublicConfig } from "../config/env";
import type { Session } from "./sessionStorage";

type ApiClientDependencies = {
  config?: PublicConfig;
  fetchImpl?: typeof fetch;
  getSession?: () => Promise<Session | null>;
};

export type ApiErrorCode = "API_OFFLINE" | "TOKEN_INVALIDO" | "VALIDATION_ERROR" | "API_ERROR";

export class ApiClientError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status?: number
  ) {
    super(message);
  }
}

export function createApiClient({ config = publicConfig, fetchImpl = fetch, getSession }: ApiClientDependencies = {}) {
  async function request<TResponse>(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");

    const session = getSession ? await getSession() : null;
    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }

    let response: Response;
    try {
      response = await fetchImpl(`${config.apiBaseUrl}${path}`, { ...init, headers });
    } catch {
      throw new ApiClientError("API_OFFLINE", "Nao foi possivel conectar ao backend.");
    }

    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new ApiClientError("TOKEN_INVALIDO", "Sessao expirada ou sem permissao.", response.status);
      }

      if (response.status === 422) {
        throw new ApiClientError("VALIDATION_ERROR", "Dados enviados nao passaram na validacao.", response.status);
      }

      throw new ApiClientError("API_ERROR", "A API retornou um erro inesperado.", response.status);
    }

    return body as TResponse;
  }

  return {
    health: () => request<{ status: string }>(apiContracts.health),
    request
  };
}
