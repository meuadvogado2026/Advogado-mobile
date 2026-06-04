import { existsSync, readFileSync } from "node:fs";
import { apiContracts } from "../src/config/contracts";

const requiredFiles = [
  "App.tsx",
  "app.json",
  "app.config.ts",
  "src/components/AppIcon.tsx",
  "src/screens/HomeScreen.tsx",
  "src/theme/tokens.ts",
  "src/services/authService.ts",
  "src/services/clientSignupService.ts",
  "src/services/apiClient.ts",
  "src/services/areasService.ts",
  "src/services/matchService.ts",
  "src/services/lawyerProfileService.ts",
  "src/services/lawyerDashboardService.ts",
  "src/services/prayerRequestService.ts",
  "src/services/partnerLogoService.ts",
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
if (apiContracts.clientSignup !== "/v1/auth/signup-client") {
  throw new Error("Smoke mobile falhou. Contrato de cadastro cliente divergente.");
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
if (apiContracts.partnerLogos !== "/v1/partner-logos") {
  throw new Error("Smoke mobile falhou. Contrato publico de parceiros divergente.");
}

const appConfig = readFileSync("app.config.ts", "utf8");
const appJson = readFileSync("app.json", "utf8");
const home = readFileSync("src/screens/HomeScreen.tsx", "utf8");
const app = readFileSync("App.tsx", "utf8");
const appIcon = readFileSync("src/components/AppIcon.tsx", "utf8");
const lawyerProfile = readFileSync("src/screens/LawyerProfileScreen.tsx", "utf8");
const locationService = readFileSync("src/services/locationService.ts", "utf8");
const clientSignupService = readFileSync("src/services/clientSignupService.ts", "utf8");
const lawyerDashboardService = readFileSync("src/services/lawyerDashboardService.ts", "utf8");
const prayerRequestService = readFileSync("src/services/prayerRequestService.ts", "utf8");
const partnerLogoService = readFileSync("src/services/partnerLogoService.ts", "utf8");

if (/SERVICE_ROLE|service_role/i.test(`${appConfig}\n${appJson}`)) {
  throw new Error("Smoke mobile falhou. Service role nao pode aparecer na configuracao mobile.");
}

if (!home.includes("authService.signIn") || !home.includes("requestDeviceLocation") || !home.includes("requestMatch")) {
  throw new Error("Smoke mobile falhou. Fluxo de login, localizacao e match nao esta conectado na Home.");
}

if (
  !clientSignupService.includes("apiContracts.clientSignup") ||
  !home.includes("handleSignUp") ||
  !home.includes("Criar novo usuario") ||
  !home.includes("clientSignups.create")
) {
  throw new Error("Smoke mobile falhou. Opcao de cadastro cliente nao esta conectada ao backend.");
}

if (
  !appConfig.includes("EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK") ||
  !locationService.includes("EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK") ||
  !locationService.includes('source: "devFallback"')
) {
  throw new Error("Smoke mobile falhou. Fallback local de desenvolvimento nao esta explicitamente flagado.");
}

if (
  !home.includes("AppIcon") ||
  !lawyerProfile.includes("AppIcon") ||
  !appIcon.includes("glyphs") ||
  /@expo\/vector-icons|Ionicons/.test(`${home}\n${lawyerProfile}`) ||
  app.includes("useFonts") ||
  !appJson.includes('"assetBundlePatterns"') ||
  !appJson.includes('"assets/**/*"') ||
  app.includes("fontFallbackReady") ||
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
  !home.includes("PageLogo") ||
  !home.includes("pageLogo") ||
  home.includes("<ShellHeader") ||
  home.includes("shellHeader") ||
  home.includes("brandTitle") ||
  home.includes("Atendimento juridico proximo") ||
  !home.includes("locationFootnote") ||
  home.includes("locationBanner") ||
  !home.includes("BottomNavigation") ||
  !home.includes('label: "Home"') ||
  !home.includes('label: "Beneficios"') ||
  !home.includes('label: "Perfil"') ||
  home.includes('label: "Cartao"') ||
  home.includes('label: "Conta"') ||
  home.includes('label: "Oracao"') ||
  home.includes('label: "Buscar"') ||
  home.includes("scrollTo") ||
  !home.includes("Buscar por area ou problema juridico") ||
  !home.includes("AreaCarousel") ||
  !home.includes("areaIconBadge") ||
  !home.includes("stepIconBadge") ||
  !home.includes("bottomIconBadge") ||
  !home.includes("PrayerHomeBlock") ||
  !home.includes("prayer-bible-cross.png")
) {
  throw new Error("Smoke mobile falhou. Shell cliente Home/Perfil, areas horizontais ou oracao na Home nao esta presente.");
}

if (/Mensagens|Agenda|Plant[aã]o|Favoritos|avalia[cç][oõ]es|24h/i.test(home)) {
  throw new Error("Smoke mobile falhou. Home nao deve criar navegacao funcional fora do MVP.");
}

if (
  !home.includes("URGENT_LAWYER_WHATSAPP") ||
  !home.includes('"5561993574056"') ||
  !home.includes("UrgentLawyerButton") ||
  !home.includes("Advogado urgente") ||
  !home.includes("warning-outline") ||
  !home.includes("urgentButton")
) {
  throw new Error("Smoke mobile falhou. CTA de advogado urgente na Home cliente ausente.");
}

if (
  !partnerLogoService.includes("apiContracts.partnerLogos") ||
  !home.includes("createPartnerLogoService") ||
  !home.includes("PartnersFooter") ||
  !home.includes("partnerLogoImage") ||
  !home.includes("avatarUrl") ||
  !home.includes("coverUrl") ||
  !home.includes("lawyerCoverImage") ||
  !home.includes("matchAvatarImage")
) {
  throw new Error("Smoke mobile falhou. Match com foto/capa ou rodape publico de parceiros ausente.");
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
