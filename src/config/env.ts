import Constants from "expo-constants";

export type PublicConfig = {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

declare const process: {
  env: Record<string, string | undefined>;
};
declare const __DEV__: boolean | undefined;

type ExtraConfig = {
  apiBaseUrl?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

/**
 * Fonte primaria: `expo-constants` (`expoConfig.extra`), gravado de forma
 * DETERMINISTICA no manifesto durante o build (preenchido por app.config.ts a
 * partir das envs EXPO_PUBLIC_* do perfil EAS). Fallback: `process.env`
 * (inline do Metro em dev/Expo Go). Ler do manifesto evita a fragilidade do
 * inline de `process.env.EXPO_PUBLIC_*`, que ja causou a anon key chegar vazia
 * no APK de release.
 */
const extra: ExtraConfig =
  ((Constants.expoConfig?.extra ?? (Constants as { manifest2?: { extra?: { expoClient?: { extra?: ExtraConfig } } } }).manifest2?.extra?.expoClient?.extra) as ExtraConfig | undefined) ?? {};

const DEFAULT_API_BASE_URL = "http://10.0.2.2:3333";
const DEFAULT_SUPABASE_URL = "https://qpemxkiowiiklztgumqy.supabase.co";
const isProductionRuntime = typeof __DEV__ === "undefined" ? process.env.NODE_ENV === "production" : !__DEV__;

export const publicConfig: PublicConfig = {
  apiBaseUrl: extra.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL,
  supabaseUrl: extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  supabaseAnonKey: extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ""
};

export function validateApiBaseUrl(config: Pick<PublicConfig, "apiBaseUrl"> = publicConfig) {
  if (!config.apiBaseUrl) {
    throw new Error("API_BASE_URL_PUBLICA_AUSENTE");
  }

  if (isProductionRuntime && !config.apiBaseUrl.startsWith("https://")) {
    throw new Error("API_BASE_URL_PRODUCAO_DEVE_USAR_HTTPS");
  }
}

export function validatePublicConfig(config: PublicConfig = publicConfig) {
  validateApiBaseUrl(config);

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("SUPABASE_AUTH_PUBLICO_AUSENTE");
  }
}
