import { existsSync, readFileSync } from "node:fs";
import { apiContracts } from "../src/config/contracts";

const requiredFiles = [
  "App.tsx",
  "app.json",
  "app.config.ts",
  "src/screens/HomeScreen.tsx",
  "src/theme/tokens.ts",
  "src/services/authService.ts",
  "src/services/apiClient.ts",
  "src/services/areasService.ts",
  "src/services/matchService.ts",
  "src/services/locationService.ts",
  "src/services/sessionStorage.ts",
  "src/services/secureSessionStorage.ts"
];
const missing = requiredFiles.filter((file) => !existsSync(file));

if (missing.length > 0) {
  throw new Error(`Smoke mobile falhou. Arquivos ausentes: ${missing.join(", ")}`);
}

if (apiContracts.match !== "/v1/match") {
  throw new Error("Smoke mobile falhou. Contrato de match divergente.");
}

const appConfig = readFileSync("app.config.ts", "utf8");
const appJson = readFileSync("app.json", "utf8");
const home = readFileSync("src/screens/HomeScreen.tsx", "utf8");
const locationService = readFileSync("src/services/locationService.ts", "utf8");

if (/SERVICE_ROLE|service_role/i.test(`${appConfig}\n${appJson}`)) {
  throw new Error("Smoke mobile falhou. Service role nao pode aparecer na configuracao mobile.");
}

if (!home.includes("authService.signIn") || !home.includes("requestDeviceLocation") || !home.includes("requestMatch")) {
  throw new Error("Smoke mobile falhou. Fluxo de login, localizacao e match nao esta conectado na Home.");
}

if (
  !appConfig.includes("EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK") ||
  !locationService.includes("EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK") ||
  !locationService.includes('source: "devFallback"')
) {
  throw new Error("Smoke mobile falhou. Fallback local de desenvolvimento nao esta explicitamente flagado.");
}

console.log("Smoke mobile OK: Expo entry, Auth, API backend, SecureStore, Location e match inicial existem.");
