export type PublicConfig = {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableDevLocationFallback: boolean;
};

declare const process: {
  env: Record<string, string | undefined>;
};

/**
 * IMPORTANTE: acessar `process.env.EXPO_PUBLIC_*` DIRETAMENTE (sem aliasar
 * `process.env` numa variavel e sem destructuring). So assim o Expo/Metro faz o
 * inline do valor no bundle em tempo de build. Qualquer indirecao
 * (ex.: `const e = process.env; e.EXPO_PUBLIC_X`) quebra o inline e o valor
 * chega VAZIO no APK de release.
 */
export const publicConfig: PublicConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:3333",
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://qpemxkiowiiklztgumqy.supabase.co",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  enableDevLocationFallback: process.env.EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK === "true"
};

export function validatePublicConfig(config: PublicConfig = publicConfig) {
  if (!config.apiBaseUrl) {
    throw new Error("API_BASE_URL_PUBLICA_AUSENTE");
  }

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("SUPABASE_AUTH_PUBLICO_AUSENTE");
  }
}
