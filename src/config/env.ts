export type PublicConfig = {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableDevLocationFallback: boolean;
};

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

const publicEnv = typeof process !== "undefined" ? process.env ?? {} : {};

export const publicConfig: PublicConfig = {
  apiBaseUrl: publicEnv.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:3333",
  supabaseUrl: publicEnv.EXPO_PUBLIC_SUPABASE_URL ?? "https://qpemxkiowiiklztgumqy.supabase.co",
  supabaseAnonKey: publicEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  enableDevLocationFallback: publicEnv.EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK === "true"
};

export function validatePublicConfig(config: PublicConfig = publicConfig) {
  if (!config.apiBaseUrl) {
    throw new Error("API_BASE_URL_PUBLICA_AUSENTE");
  }

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("SUPABASE_AUTH_PUBLICO_AUSENTE");
  }
}
