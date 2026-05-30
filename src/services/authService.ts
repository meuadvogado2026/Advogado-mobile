import { publicConfig, validatePublicConfig, type PublicConfig } from "../config/env";
import { isExpired, type Session, type SessionStorage } from "./sessionStorage";

type AuthDependencies = {
  config?: PublicConfig;
  fetchImpl?: typeof fetch;
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

function authError(message: string) {
  return new Error(message);
}

export function createAuthService({
  config = publicConfig,
  fetchImpl = fetch,
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

  return { signIn, getSession, signOut };
}
