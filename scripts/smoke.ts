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
  "src/services/lawyerDashboardService.ts",
  "src/services/prayerRequestService.ts",
  "src/services/meService.ts",
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
if (apiContracts.me !== "/v1/me") {
  throw new Error("Smoke mobile falhou. Contrato de sessao/role divergente.");
}
if (apiContracts.lawyerProfile !== "/v1/lawyers/:id") {
  throw new Error("Smoke mobile falhou. Contrato de perfil divergente.");
}
if (apiContracts.lawyerDashboard !== "/v1/lawyer/me/dashboard") {
  throw new Error("Smoke mobile falhou. Contrato de dashboard do advogado divergente.");
}
if (apiContracts.prayerRequests !== "/v1/prayer-requests") {
  throw new Error("Smoke mobile falhou. Contrato de pedido de oracao divergente.");
}

const appConfig = readFileSync("app.config.ts", "utf8");
const appJson = readFileSync("app.json", "utf8");
const home = readFileSync("src/screens/HomeScreen.tsx", "utf8");
const app = readFileSync("App.tsx", "utf8");
const lawyerProfile = readFileSync("src/screens/LawyerProfileScreen.tsx", "utf8");
const locationService = readFileSync("src/services/locationService.ts", "utf8");
const lawyerDashboardService = readFileSync("src/services/lawyerDashboardService.ts", "utf8");
const prayerRequestService = readFileSync("src/services/prayerRequestService.ts", "utf8");

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
  !home.includes("openMatchedProfile") ||
  !home.includes('navigate("LawyerProfile"') ||
  !lawyerProfile.includes("Carregando perfil profissional.") ||
  !lawyerProfile.includes("Este perfil nao esta disponivel no momento. Busque outro advogado.") ||
  !lawyerProfile.includes("WhatsApp indisponivel para este profissional.") ||
  !lawyerProfile.includes("WhatsApp VIP")
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
  !home.includes('label: "Home"') ||
  !home.includes('label: "Cartao"') ||
  !home.includes('label: "Perfil"') ||
  !home.includes('label: "Conta"') ||
  home.includes('label: "Oracao"') ||
  home.includes('label: "Buscar"') ||
  home.includes("scrollTo") ||
  !home.includes("Buscar por area ou problema juridico") ||
  !home.includes("AreaCarousel") ||
  !home.includes("PrayerHomeBlock") ||
  !home.includes("prayer-bible-cross.png")
) {
  throw new Error("Smoke mobile falhou. Shell cliente Home/Perfil, areas horizontais ou oracao na Home nao esta presente.");
}

if (/Mensagens|Agenda|Plant[aã]o|Favoritos|avalia[cç][oõ]es|24h/i.test(home)) {
  throw new Error("Smoke mobile falhou. Home nao deve criar navegacao funcional fora do MVP.");
}

if (
  !lawyerDashboardService.includes("apiContracts.lawyerDashboard") ||
  !prayerRequestService.includes("apiContracts.prayerRequests") ||
  !home.includes("handleSubmitPrayer") ||
  !home.includes("Enviar como anonimo") ||
  !home.includes("handleLoadLawyerDashboard")
) {
  throw new Error("Smoke mobile falhou. Parte 3 nao esta conectada aos contratos backend.");
}

console.log(
  "Smoke mobile OK: Expo entry, Auth, API backend, SecureStore, Location, Match, LawyerProfile, Spec 008 Parte 3, role shell cliente/advogado e links legais existem."
);
