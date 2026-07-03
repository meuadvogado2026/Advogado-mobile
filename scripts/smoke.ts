import { existsSync, readFileSync } from "node:fs";
import { apiContracts } from "../src/config/contracts";

const requiredFiles = [
  "App.tsx",
  "app.config.ts",
  "src/components/AppIcon.tsx",
  "src/screens/HomeScreen.tsx",
  "src/theme/tokens.ts",
  "src/services/authService.ts",
  "src/services/clientSignupService.ts",
  "src/services/apiClient.ts",
  "src/services/areasService.ts",
  "src/services/geographyService.ts",
  "src/services/matchService.ts",
  "src/services/lawyerProfileService.ts",
  "src/services/lawyerDashboardService.ts",
  "src/services/lawyerEventService.ts",
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
if (apiContracts.lawyerEvents !== "/v1/lawyers/:id/events") {
  throw new Error("Smoke mobile falhou. Contrato de eventos do advogado divergente.");
}
if (apiContracts.prayerRequests !== "/v1/prayer-requests") {
  throw new Error("Smoke mobile falhou. Contrato de pedido de oracao divergente.");
}
if (apiContracts.partnerLogos !== "/v1/partner-logos") {
  throw new Error("Smoke mobile falhou. Contrato publico de parceiros divergente.");
}

const appConfig = readFileSync("app.config.ts", "utf8");
const packageJson = readFileSync("package.json", "utf8");
const home = readFileSync("src/screens/HomeScreen.tsx", "utf8");
const app = readFileSync("App.tsx", "utf8");
const appIcon = readFileSync("src/components/AppIcon.tsx", "utf8");
const lawyerProfile = readFileSync("src/screens/LawyerProfileScreen.tsx", "utf8");
const locationService = readFileSync("src/services/locationService.ts", "utf8");
const geographyService = readFileSync("src/services/geographyService.ts", "utf8");
const clientSignupService = readFileSync("src/services/clientSignupService.ts", "utf8");
const lawyerDashboardService = readFileSync("src/services/lawyerDashboardService.ts", "utf8");
const lawyerEventService = readFileSync("src/services/lawyerEventService.ts", "utf8");
const prayerRequestService = readFileSync("src/services/prayerRequestService.ts", "utf8");
const partnerLogoService = readFileSync("src/services/partnerLogoService.ts", "utf8");
const parsedPackageJson = JSON.parse(packageJson);

if (/SERVICE_ROLE|service_role/i.test(appConfig)) {
  throw new Error("Smoke mobile falhou. Service role nao pode aparecer na configuracao mobile.");
}

if (!home.includes("authService.signIn") || !home.includes("requestDeviceLocation") || !home.includes("requestMatch")) {
  throw new Error("Smoke mobile falhou. Fluxo de login, localizacao e match nao esta conectado na Home.");
}

if (
  !clientSignupService.includes("apiContracts.clientSignup") ||
  !home.includes("handleSignUp") ||
  !home.includes("Criar novo usuário") ||
  !home.includes("clientSignups.create")
) {
  throw new Error("Smoke mobile falhou. Opcao de cadastro cliente nao esta conectada ao backend.");
}

if (
  /EXPO_PUBLIC_ENABLE_DEV_LOCATION_FALLBACK|enableDevLocationFallback|devFallback/.test(
    `${appConfig}\n${locationService}`
  )
) {
  throw new Error("Smoke mobile falhou. Fallback sintetico de localizacao nao pode existir no app.");
}

if (!locationService.includes("Location.Accuracy.High") || locationService.includes("Location.Accuracy.Balanced")) {
  throw new Error("Smoke mobile falhou. Match deve solicitar localizacao de alta precisao, nao Balanced.");
}

if (!home.includes("Obtendo sua localização atual") || home.includes("let activeLocation = location")) {
  throw new Error("Smoke mobile falhou. Match deve solicitar localizacao real atual a cada busca.");
}

if (
  !home.includes("AppIcon") ||
  !lawyerProfile.includes("AppIcon") ||
  !appIcon.includes("react-native-svg") ||
  !appIcon.includes("iconRenderers") ||
  appIcon.includes("glyphs") ||
  /<Text|from "react-native"|logo-whatsapp": "W"|logo-instagram": "IG"|logo-linkedin": "in"/.test(appIcon) ||
  /@expo\/vector-icons|Ionicons/.test(`${home}\n${lawyerProfile}\n${appConfig}\n${packageJson}`) ||
  /expo-font/.test(`${appConfig}\n${packageJson}`) ||
  app.includes("useFonts") ||
  !appConfig.includes('assetBundlePatterns: ["assets/**/*"]') ||
  app.includes("fontFallbackReady") ||
  !app.includes("LawyerProfile") ||
  !home.includes('navigate("LawyerProfile"') ||
  !home.includes("Advogado encontrado. Abrindo perfil.") ||
  !lawyerProfile.includes("Carregando perfil profissional.") ||
  !lawyerProfile.includes("Este perfil não está disponível no momento. Busque outro advogado.") ||
  !lawyerProfile.includes("WhatsApp indisponível para este profissional.") ||
  !lawyerProfile.includes("WhatsApp VIP")
) {
  throw new Error("Smoke mobile falhou. Fluxo Home -> LawyerProfile -> WhatsApp ou estados seguros ausentes.");
}

if (
  !appConfig.includes('package: "com.advogado20.app"') ||
  !appConfig.includes("versionCode: 3") ||
  !appConfig.includes("compileSdkVersion: 36") ||
  !appConfig.includes("targetSdkVersion: 36") ||
  appConfig.includes("edgeToEdgeEnabled") ||
  appConfig.includes("newArchEnabled") ||
  !appConfig.includes('usesCleartextTraffic: !apiBaseUrl.startsWith("https://")') ||
  !appConfig.includes('"android.permission.READ_EXTERNAL_STORAGE"') ||
  !appConfig.includes('"android.permission.WRITE_EXTERNAL_STORAGE"') ||
  !appConfig.includes('"android.permission.SYSTEM_ALERT_WINDOW"') ||
  !appConfig.includes('"android.permission.VIBRATE"')
) {
  throw new Error("Smoke mobile falhou. Configuracao Android de release divergente.");
}

if (
  !parsedPackageJson.dependencies?.["react-native-svg"] ||
  parsedPackageJson.dependencies?.["@expo/vector-icons"] ||
  parsedPackageJson.dependencies?.["expo-font"] ||
  !appIcon.includes('"logo-whatsapp"') ||
  !appIcon.includes('"logo-instagram"') ||
  !appIcon.includes('"logo-linkedin"') ||
  !appIcon.includes('"logo-facebook"') ||
  !appIcon.includes('"warning-outline"') ||
  !appIcon.includes('"ribbon-outline"') ||
  !appIcon.includes('"library-outline"') ||
  !appIcon.includes('"cart-outline"')
) {
  throw new Error("Smoke mobile falhou. Padrao profissional de icones SVG standalone nao esta completo.");
}

if (
  home.includes("goldGradientLayer") ||
  home.includes("LinearGradient") ||
  home.includes("GradientLayer") ||
  !home.includes("disabledSurface") ||
  !home.includes("disabledBorder")
) {
  throw new Error("Smoke mobile falhou. Botoes oficiais devem ser solidos, sem overlay/degrade estranho.");
}

if (
  !existsSync("assets/logo-blue.png") ||
  !existsSync("assets/logo-gold.png") ||
  !existsSync("assets/logo-white.png") ||
  !existsSync("assets/mascot-lawyer.png") ||
  !appConfig.includes('icon: "./assets/logo-blue.png"') ||
  !appConfig.includes('image: "./assets/logo-blue.png"') ||
  !appConfig.includes('backgroundColor: "#071426"') ||
  !appConfig.includes('foregroundImage: "./assets/logo-blue.png"')
) {
  throw new Error("Smoke mobile falhou. Assets oficiais de logo/app icon/splash Android estao ausentes ou divergentes.");
}

if (
  !home.includes("/privacidade.html") ||
  !home.includes("/termos.html") ||
  !home.includes("/exclusao-de-dados.html")
) {
  throw new Error("Smoke mobile falhou. Links legais publicos nao estao acessiveis na Home.");
}

if (
  !home.includes("function AccountDeletionRequest") ||
  !home.includes("Solicitar exclusao de conta e dados") ||
  home.split("<AccountDeletionRequest />").length - 1 !== 2
) {
  throw new Error("Smoke mobile falhou. Caminho in-app de exclusao de conta/dados ausente nas areas autenticadas.");
}

if (
  !home.includes("PageLogo") ||
  !home.includes("pageLogo") ||
  !home.includes("logo-gold.png") ||
  home.includes("<ShellHeader") ||
  home.includes("shellHeader") ||
  home.includes("brandTitle") ||
  home.includes("Atendimento juridico proximo") ||
  !home.includes("locationFootnote") ||
  home.includes("locationBanner") ||
  !home.includes("BottomNavigation") ||
  !home.includes('label: "Home"') ||
  !home.includes('label: "Oração"') ||
  !home.includes('label: "Perfil"') ||
  home.includes('label: "Beneficios"') ||
  home.includes('label: "Cartao"') ||
  home.includes('label: "Conta"') ||
  home.includes('label: "Buscar"') ||
  home.includes("scrollTo") ||
  home.includes("Buscar por area ou problema juridico") ||
  home.includes("searchBar") ||
  home.includes("AreaCarousel") ||
  !home.includes("SpecialtyMatchOrbit") ||
  !home.includes("SPECIALTY_CENTER_SIZE") ||
  !home.includes("SPECIALTY_LINE_COLOR") ||
  !home.includes("mascot-lawyer.png") ||
  !home.includes("mascotHelpButton") ||
  !home.includes("mascotHaloOuter") ||
  !home.includes("orbitConnectorLayer") ||
  !home.includes("orbitSelectedCheck") ||
  !home.includes("orbitSpecialty") ||
  !home.includes("searchActionsPanel") ||
  !home.includes("Por localização") ||
  !home.includes("Por cidade") ||
  home.includes("Como deseja buscar?") ||
  home.includes("Buscar perto de mim") ||
  home.includes("orbitTitle") ||
  home.includes("orbitHint") ||
  home.includes("MatchActionButton") ||
  home.includes("Atualizar perfil") ||
  home.includes("Atualizar painel") ||
  home.includes("Atualizar areas") ||
  home.includes("Atualizar áreas") ||
  home.includes("Sessao restaurada") ||
  home.includes("Sessão restaurada") ||
  home.includes("Painel do advogado atualizado") ||
  !home.includes("Olá, {clientDisplayName}") ||
  !home.includes("stepIconBadge") ||
  !home.includes("bottomIconBadge") ||
  !home.includes("PrayerHomeBlock") ||
  !home.includes("prayer-bible-cross.png")
) {
  throw new Error("Smoke mobile falhou. Shell cliente/advogado, hub de areas ou oracao nao esta presente.");
}

if (/Mensagens|Agenda|Plant[aã]o|Favoritos|avalia[cç][oõ]es|24h/i.test(home)) {
  throw new Error("Smoke mobile falhou. Home nao deve criar navegacao funcional fora do MVP.");
}

if (
  !home.includes("URGENT_LAWYER_WHATSAPP") ||
  !home.includes("URGENT_LAWYER_MESSAGE") ||
  !home.includes("SPECIALTY_HELP_MESSAGE") ||
  !home.includes("SPECIALTY_HELP_ICON_SIZE") ||
  !home.includes("showSpecialtyHelp") ||
  !home.includes("mascotHelpTouchTarget") ||
  !home.includes("Alert.alert") ||
  !home.includes("Falar no WhatsApp") ||
  !home.includes("encodeURIComponent(message)") ||
  !home.includes('"5561993574056"') ||
  !home.includes("UrgentLawyerButton") ||
  !home.includes("Advogado urgente") ||
  !home.includes("warning-outline") ||
  !home.includes("urgentButton")
) {
  throw new Error("Smoke mobile falhou. CTA de advogado urgente na Home cliente ausente.");
}

if (
  !lawyerProfile.includes("LAWYER_WHATSAPP_MESSAGE") ||
  !lawyerProfile.includes("buildWhatsAppUrl") ||
  !lawyerProfile.includes("encodeURIComponent(LAWYER_WHATSAPP_MESSAGE)")
) {
  throw new Error("Smoke mobile falhou. Mensagem padrao de WhatsApp para advogados ausente.");
}

if (
  !partnerLogoService.includes("apiContracts.partnerLogos") ||
  !home.includes("createPartnerLogoService") ||
  !home.includes("PartnersFooter") ||
  !home.includes("partnerLogoImage") ||
  !home.includes('currentUser?.role !== "lawyer"') ||
  home.includes("<PartnersFooter partners={partners} />\n            </>")
) {
  throw new Error("Smoke mobile falhou. Parceiros devem ficar restritos ao painel do advogado.");
}

if (
  !lawyerDashboardService.includes("apiContracts.lawyerDashboard") ||
  !lawyerEventService.includes("apiContracts.lawyerEvents") ||
  !lawyerProfile.includes("createLawyerEventService") ||
  !lawyerProfile.includes('eventType: "profile_view"') ||
  !lawyerProfile.includes('eventType: "whatsapp_click"') ||
  !prayerRequestService.includes("apiContracts.prayerRequests") ||
  !home.includes("handleSubmitPrayer") ||
  !home.includes("Enviar como anônimo") ||
  !home.includes('tab: "prayer"') ||
  !home.includes("LawyerVipCard dashboard={lawyerDashboard}") ||
  !home.includes("Taxa de contato") ||
  !home.includes("getProfileStatus") ||
  !home.includes("benefitCards") ||
  home.includes("ciclo futuro com admin e backend")
) {
  throw new Error("Smoke mobile falhou. Parte 3 nao esta conectada aos contratos backend.");
}

if (
  home.includes("Advogado indicado") ||
  home.includes("function MatchCard") ||
  !home.includes('navigation.navigate("LawyerProfile"') ||
  !home.includes("Advogado encontrado. Abrindo perfil.")
) {
  throw new Error("Smoke mobile falhou. Home cliente deve abrir o perfil apos match sem exibir card de advogado indicado.");
}

if (
  !home.includes("isStatePickerOpen") ||
  !home.includes("isCityPickerOpen") ||
  !home.includes("geographies.listStates()") ||
  !home.includes("geographies.listCities(selectedStateId)") ||
  home.includes("geographies.listStates(selectedAreaIds)") ||
  home.includes("geographies.listCities(selectedStateId, selectedAreaIds)") ||
  geographyService.includes("areaIds=") ||
  !home.includes(">ESTADO</Text>") ||
  !home.includes(">CIDADE</Text>") ||
  !home.includes("Digite para buscar estado") ||
  !home.includes("Digite para buscar cidade") ||
  !home.includes('name={isStatePickerOpen ? "chevron-up" : "chevron-down"}') ||
  !home.includes('name={isCityPickerOpen ? "chevron-up" : "chevron-down"}') ||
  !home.includes("{selectedStateId ? (")
) {
  throw new Error("Smoke mobile falhou. Seletores progressivos de estado e cidade estao ausentes.");
}

console.log(
  "Smoke mobile OK: Expo entry, Auth, API backend, SecureStore, Location, Match direto para LawyerProfile, home por role, oracao e parceiros do advogado existem."
);
