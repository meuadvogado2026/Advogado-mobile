import appJson from "./app.json";

const expo = appJson.expo;
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? expo.extra.apiBaseUrl;

if (process.env.EAS_BUILD_PROFILE === "production" && !apiBaseUrl.startsWith("https://")) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL deve usar HTTPS no build production.");
}

export default {
  expo: {
    ...expo,
    owner: "advogado2.0",
    plugins: ["expo-asset", "expo-secure-store"],
    extra: {
      ...expo.extra,
      apiBaseUrl,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? expo.extra.supabaseUrl,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? expo.extra.supabaseAnonKey,
      eas: {
        projectId: "089e477d-8af2-4c3b-a9f6-47fe25886860"
      }
    }
  }
};
