const isProductionBuild = process.env.EAS_BUILD_PROFILE === "production";
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:3333";
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://qpemxkiowiiklztgumqy.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (isProductionBuild && !apiBaseUrl.startsWith("https://")) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL deve usar HTTPS no build production.");
}

if (isProductionBuild && (!supabaseUrl.startsWith("https://") || !supabaseAnonKey)) {
  throw new Error("Configuracao publica do Supabase e obrigatoria no build production.");
}

export default {
  expo: {
    name: "Advogado 2.0",
    slug: "meu-advogado-20",
    version: "0.1.0",
    orientation: "portrait",
    platforms: ["android"],
    scheme: "advogado20",
    icon: "./assets/logo-blue.png",
    assetBundlePatterns: ["assets/**/*"],
    splash: {
      image: "./assets/logo-blue.png",
      resizeMode: "contain",
      backgroundColor: "#071426"
    },
    userInterfaceStyle: "dark",
    owner: "advogado2.0",
    plugins: [
      "expo-asset",
      "expo-secure-store",
      "expo-status-bar",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            usesCleartextTraffic: !apiBaseUrl.startsWith("https://")
          }
        }
      ]
    ],
    android: {
      package: "com.advogado20.app",
      versionCode: 3,
      adaptiveIcon: {
        foregroundImage: "./assets/logo-blue.png",
        backgroundColor: "#071426"
      },
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
      blockedPermissions: [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.VIBRATE"
      ]
    },
    extra: {
      apiBaseUrl,
      supabaseUrl,
      supabaseAnonKey,
      eas: {
        projectId: "089e477d-8af2-4c3b-a9f6-47fe25886860"
      }
    }
  }
};
