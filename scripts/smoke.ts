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
  "src/services/lawyerProfileService.ts",
  "src/screens/LawyerProfileScreen.tsx",
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
if (apiContracts.lawyerProfile !== "/v1/lawyers/:id") {
  throw new Error("Smoke mobile falhou. Contrato de perfil divergente.");
}

const appConfig = readFileSync("app.config.ts", "utf8");
const appJson = readFileSync("app.json", "utf8");
const home = readFileSync("src/screens/HomeScreen.tsx", "utf8");
const app = readFileSync("App.tsx", "utf8");
const lawyerProfile = readFileSync("src/screens/LawyerProfileScreen.tsx", "utf8");
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

if (
  !app.includes("LawyerProfile") ||
  !home.includes("Ver perfil") ||
  !home.includes('navigate("LawyerProfile"') ||
  !lawyerProfile.includes("Carregando perfil profissional.") ||
  !lawyerProfile.includes("Este perfil nao esta disponivel no momento. Busque outro advogado.") ||
  !lawyerProfile.includes("Este profissional ainda nao tem WhatsApp disponivel.") ||
  !lawyerProfile.includes("Falar no WhatsApp")
) {
  throw new Error("Smoke mobile falhou. Fluxo Home -> LawyerProfile -> WhatsApp ou estados seguros ausentes.");
}

if (
  !home.includes("/privacidade.html") ||
  !home.includes("/termos.html") ||
  !home.includes("/exclusao-de-dados.html")
) {
  throw new Error("Smoke mobile falhou. Links legais publicos nao estao acessiveis na Home.");
}

if (
  !home.includes("ShellHeader") ||
  !home.includes("BottomNavigation") ||
  !home.includes('label: "Inicio"') ||
  !home.includes('label: "Buscar"') ||
  !home.includes('label: "Conta"') ||
  !home.includes('onSelect: (tab: ShellTab) => void') ||
  !home.includes("Buscar por area juridica")
) {
  throw new Error("Smoke mobile falhou. Shell autenticado com Inicio/Buscar/Conta nao esta presente.");
}

if (/Mensagens|Agenda|Plant[aã]o|Favoritos|avalia[cç][oõ]es|24h/i.test(home)) {
  throw new Error("Smoke mobile falhou. Home nao deve criar navegacao funcional fora do MVP.");
}

console.log(
  "Smoke mobile OK: Expo entry, Auth, API backend, SecureStore, Location, Match, LawyerProfile, shell Inicio/Buscar/Conta e links legais existem."
);
