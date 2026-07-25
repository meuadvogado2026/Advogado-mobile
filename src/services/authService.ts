import * as WebBrowser from "expo-web-browser";
import { apiContracts } from "../config/contracts";
import { publicConfig, validatePublicConfig, type PublicConfig } from "../config/env";
import { isExpired, type Session, type SessionStorage } from "./sessionStorage";

type AuthDependencies = {
  config?: PublicConfig;
  fetchImpl?: typeof fetch;
  openAuthSessionAsync?: typeof WebBrowser.openAuthSessionAsync;
  storage?: SessionStorage;
};

type SupabasePasswordResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  user?: {
    email?: string;
  };
  error_description?: string;
  msg?: string;
};

type OAuthCompleteResponse = {
  user?: {
    email?: string;
  };
  error?: {
    code?: string;
    message?: string;
  };
};

type SupabaseOAuthParams = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  expires_in?: string;
  error?: string;
  error_description?: string;
};

const GOOGLE_REDIRECT_URI = "advogado20://auth/callback";

function parseParamsFromUrl(url: string): SupabaseOAuthParams {
  const pieces: string[] = [];
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");

  if (queryIndex >= 0) {
    pieces.push(url.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined));
  }
  if (hashIndex >= 0) {
    pieces.push(url.slice(hashIndex + 1));
  }

  const params = new URLSearchParams(pieces.filter(Boolean).join("&"));
  return {
    access_token: params.get("access_token") ?? undefined,
    refresh_token: params.get("refresh_token") ?? undefined,
    expires_at: params.get("expires_at") ?? undefined,
    expires_in: params.get("expires_in") ?? undefined,
    error: params.get("error") ?? undefined,
    error_description: params.get("error_description") ?? undefined
  };
}

function authError(message: string) {
  return new Error(message);
}

export function createAuthService({
  config = publicConfig,
  fetchImpl = fetch,
  openAuthSessionAsync = WebBrowser.openAuthSessionAsync,
  storage
}: AuthDependencies = {}) {
  if (!storage) {
    throw authError("SESSION_STORAGE_AUSENTE");
  }
  const sessionStorage = storage;

  async function signIn(email: string, password: string) {
    validatePublicConfig(config);

    const response = await fetchImpl(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: config.supabaseAnonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: email.trim(), password })
    });

    const body = (await response.json()) as SupabasePasswordResponse;
    if (!response.ok || !body.access_token) {
      throw authError(body.error_description ?? body.msg ?? "LOGIN_INVALIDO");
    }

    const session: Session = {
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      expiresAt: body.expires_at ?? Math.floor(Date.now() / 1000) + (body.expires_in ?? 3600),
      email: body.user?.email ?? email.trim()
    };

    await sessionStorage.set(session);
    return session;
  }

  async function signInWithGoogle() {
    validatePublicConfig(config);

    const authorizeUrl = new URL(`${config.supabaseUrl}/auth/v1/authorize`);
    authorizeUrl.searchParams.set("provider", "google");
    authorizeUrl.searchParams.set("redirect_to", GOOGLE_REDIRECT_URI);

    const result = await openAuthSessionAsync(authorizeUrl.toString(), GOOGLE_REDIRECT_URI);
    if (result.type !== "success" || !("url" in result)) {
      throw authError("LOGIN_GOOGLE_CANCELADO");
    }

    const params = parseParamsFromUrl(result.url);
    if (params.error) {
      throw authError(params.error_description ?? params.error);
    }
    if (!params.access_token) {
      throw authError("LOGIN_GOOGLE_SEM_SESSAO");
    }

    const response = await fetchImpl(`${config.apiBaseUrl}${apiContracts.oauthClientComplete}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    const body = (await response.json()) as OAuthCompleteResponse;
    if (!response.ok && body.error?.code === "PROFILE_NOT_FOUND") {
      throw authError("LOGIN_GOOGLE_CADASTRO_NAO_ENCONTRADO");
    }
    if (!response.ok || !body.user?.email) {
      throw authError("LOGIN_GOOGLE_PERFIL_INDISPONIVEL");
    }

    const session: Session = {
      accessToken: params.access_token,
      refreshToken: params.refresh_token,
      expiresAt: params.expires_at
        ? Number(params.expires_at)
        : Math.floor(Date.now() / 1000) + Number(params.expires_in ?? 3600),
      email: body.user.email
    };

    await sessionStorage.set(session);
    return session;
  }

  async function getSession() {
    const session = await sessionStorage.get();
    if (!session) {
      return null;
    }

    if (isExpired(session)) {
      await sessionStorage.clear();
      return null;
    }

    return session;
  }

  async function signOut() {
    await sessionStorage.clear();
  }

  return { signIn, signInWithGoogle, getSession, signOut };
}
