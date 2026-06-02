import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { appCopy } from "../config/contracts";
import { createApiClient } from "../services/apiClient";
import { createAreasService, type LegalArea } from "../services/areasService";
import { createAuthService } from "../services/authService";
import { requestDeviceLocation, type DeviceLocation } from "../services/locationService";
import { createMatchService, type MatchResponse } from "../services/matchService";
import { createMeService, type CurrentUser } from "../services/meService";
import { secureSessionStorage } from "../services/secureSessionStorage";
import type { Session } from "../services/sessionStorage";
import { colors, spacing } from "../theme/tokens";

type ViewStatus = "idle" | "loading" | "error";
type ClientTab = "home" | "search" | "prayer" | "account";
type LawyerTab = "dashboard" | "card" | "profile" | "account";
type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const logo = require("../../assets/logo-blue.png");
const legalUrls = {
  privacy: "https://meuadvogado2026.github.io/meu-advogado-legal/privacidade.html",
  terms: "https://meuadvogado2026.github.io/meu-advogado-legal/termos.html",
  deletion: "https://meuadvogado2026.github.io/meu-advogado-legal/exclusao-de-dados.html"
};

function describeMatch(match: MatchResponse | null): string {
  if (!match) {
    return "Selecione uma area, permita a localizacao e toque em Buscar match.";
  }
  if (match.status === "empty" || !match.lawyer) {
    return "Nenhum advogado proximo encontrado para esta area. Tente outra area ou tente novamente.";
  }
  const place = match.lawyer.city
    ? ` em ${match.lawyer.city}${match.lawyer.state ? "/" + match.lawyer.state : ""}`
    : "";
  const distance = typeof match.distanceKm === "number" ? ` a ${match.distanceKm.toFixed(1)} km de voce` : "";
  return `Advogado mais proximo${place}${distance}.`;
}

function openWhatsApp(rawNumber: string) {
  const digits = rawNumber.replace(/\D/g, "");
  const intl = digits.startsWith("55") ? digits : `55${digits}`;
  return Linking.openURL(`https://wa.me/${intl}`);
}

function getFriendlyError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "SUPABASE_AUTH_PUBLICO_AUSENTE") {
      return "Configure a anon key publica do Supabase para entrar.";
    }
    return error.message;
  }
  return "Nao foi possivel concluir a acao.";
}

function LegalLinks() {
  return (
    <View style={styles.legalLinks}>
      <Text style={styles.legalText} onPress={() => Linking.openURL(legalUrls.privacy)}>
        Privacidade
      </Text>
      <Text style={styles.legalText} onPress={() => Linking.openURL(legalUrls.terms)}>
        Termos
      </Text>
      <Text style={styles.legalText} onPress={() => Linking.openURL(legalUrls.deletion)}>
        Excluir dados
      </Text>
    </View>
  );
}

function ShellHeader({ email, role }: { email: string; role: CurrentUser["role"] }) {
  return (
    <View style={styles.shellHeader}>
      <View style={styles.brandRow}>
        <Image accessibilityIgnoresInvertColors source={logo} style={styles.headerLogo} />
        <View style={styles.brandTextBlock}>
          <Text style={styles.brandTitle}>{appCopy.brand}</Text>
          <Text style={styles.brandSubtitle}>
            {role === "lawyer" ? "Painel do advogado" : "Atendimento juridico proximo"}
          </Text>
        </View>
      </View>
      <Text style={styles.sessionHint} numberOfLines={1}>
        {email}
      </Text>
    </View>
  );
}

function BottomNavigation<TTab extends string>({
  activeTab,
  items,
  onSelect
}: {
  activeTab: TTab;
  items: Array<{ label: string; tab: TTab; icon: keyof typeof Ionicons.glyphMap }>;
  onSelect: (tab: TTab) => void;
}) {
  return (
    <View style={styles.bottomNavigation}>
      {items.map((item) => {
        const selected = activeTab === item.tab;
        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={item.tab}
            onPress={() => onSelect(item.tab)}
            style={styles.bottomNavItem}
          >
            <Ionicons color={selected ? colors.gold : colors.textMuted} name={item.icon} size={23} />
            <Text style={[styles.bottomNavText, selected && styles.bottomNavTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const clientNavItems: Array<{ label: string; tab: ClientTab; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: "Inicio", tab: "home", icon: "home-outline" },
  { label: "Buscar", tab: "search", icon: "search-outline" },
  { label: "Oracao", tab: "prayer", icon: "heart-outline" },
  { label: "Conta", tab: "account", icon: "person-outline" }
];

const lawyerNavItems: Array<{ label: string; tab: LawyerTab; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: "Inicio", tab: "dashboard", icon: "grid-outline" },
  { label: "Cartao", tab: "card", icon: "card-outline" },
  { label: "Perfil", tab: "profile", icon: "ribbon-outline" },
  { label: "Conta", tab: "account", icon: "settings-outline" }
];

function StatusBox({ status, message }: { status: ViewStatus; message: string }) {
  return (
    <View style={[styles.statusBox, status === "error" && styles.statusBoxError]}>
      {status === "loading" && <ActivityIndicator color={colors.gold} />}
      <Text style={styles.statusText}>{message}</Text>
    </View>
  );
}

function AreaGrid({
  areas,
  selectedAreaIds,
  onToggle
}: {
  areas: LegalArea[];
  selectedAreaIds: string[];
  onToggle: (areaId: string) => void;
}) {
  if (areas.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Areas juridicas</Text>
        <Text style={styles.sectionAction}>fluxo real</Text>
      </View>
      <View style={styles.areaGrid}>
        {areas.map((area) => {
          const selected = selectedAreaIds.includes(area.id);
          return (
            <TouchableOpacity
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              key={area.id}
              onPress={() => onToggle(area.id)}
              style={[styles.areaPill, selected && styles.areaPillSelected]}
            >
              <Ionicons color={selected ? colors.surfaceDeep : colors.gold} name="briefcase-outline" size={18} />
              <Text style={[styles.areaText, selected && styles.areaTextSelected]}>{area.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

function MatchCard({
  match,
  selectedAreaIds,
  status,
  onMatch,
  onOpenProfile
}: {
  match: MatchResponse | null;
  selectedAreaIds: string[];
  status: ViewStatus;
  onMatch: () => void;
  onOpenProfile: () => void;
}) {
  return (
    <View style={styles.lawyerCard}>
      <Text style={styles.cardLabel}>Advogado Indicado</Text>
      <Text style={styles.cardTitle}>{match?.lawyer?.name ?? "Aguardando match"}</Text>
      <Text style={styles.panelText}>{match?.message ?? describeMatch(match)}</Text>
      {match?.lawyer?.city ? (
        <Text style={styles.matchMeta}>
          {match.lawyer.city}
          {match.lawyer.state ? `/${match.lawyer.state}` : ""}
          {typeof match.distanceKm === "number" ? ` - ${match.distanceKm.toFixed(1)} km` : ""}
        </Text>
      ) : null}
      <TouchableOpacity
        disabled={selectedAreaIds.length === 0 || status === "loading"}
        style={[styles.primaryButton, (selectedAreaIds.length === 0 || status === "loading") && styles.disabledButton]}
        accessibilityRole="button"
        onPress={onMatch}
      >
        <Text style={styles.primaryButtonText}>Buscar match</Text>
      </TouchableOpacity>
      <View style={styles.cardActions}>
        {match?.lawyer ? (
          <TouchableOpacity style={styles.secondaryButton} accessibilityRole="button" onPress={onOpenProfile}>
            <Ionicons color={colors.gold} name="person-outline" size={18} />
            <Text style={styles.secondaryButtonText}>Ver perfil</Text>
          </TouchableOpacity>
        ) : null}
        {match?.lawyer?.whatsapp ? (
          <TouchableOpacity
            style={styles.whatsButton}
            accessibilityRole="button"
            onPress={() => openWhatsApp(match.lawyer!.whatsapp!)}
          >
            <Ionicons color={colors.surfaceDeep} name="logo-whatsapp" size={18} />
            <Text style={styles.whatsButtonText}>Falar no WhatsApp</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export function HomeScreen({ navigation }: Props) {
  const [clientTab, setClientTab] = useState<ClientTab>("home");
  const [lawyerTab, setLawyerTab] = useState<LawyerTab>("dashboard");
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [email, setEmail] = useState("usuario@advogado20.com");
  const [password, setPassword] = useState("");
  const [areas, setAreas] = useState<LegalArea[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [match, setMatch] = useState<MatchResponse | null>(null);
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [message, setMessage] = useState("Carregando sessao segura.");

  const authService = useMemo(() => createAuthService({ storage: secureSessionStorage }), []);
  const apiClient = useMemo(() => createApiClient({ getSession: authService.getSession }), [authService]);
  const legalAreas = useMemo(() => createAreasService(apiClient), [apiClient]);
  const matches = useMemo(() => createMatchService(apiClient), [apiClient]);
  const me = useMemo(() => createMeService(apiClient), [apiClient]);

  async function hydrateUser(restoredSession: Session) {
    const response = await me.getCurrentUser();
    setCurrentUser(response.user);
    setSession(restoredSession);
    setMessage(response.user.role === "lawyer" ? "Painel do advogado carregado." : "Sessao restaurada.");
  }

  useEffect(() => {
    let mounted = true;
    authService
      .getSession()
      .then(async (restoredSession) => {
        if (!mounted) return;
        if (!restoredSession) {
          setStatus("idle");
          setMessage("Entre com um usuario de teste.");
          return;
        }
        await hydrateUser(restoredSession);
        setStatus("idle");
      })
      .catch(() => {
        if (!mounted) return;
        setStatus("idle");
        setMessage("Entre com um usuario de teste.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session || currentUser?.role !== "client") {
      return;
    }

    let active = true;
    legalAreas
      .listAreas()
      .then((response) => {
        if (!active) return;
        setAreas(response.areas);
        setSelectedAreaIds((current) =>
          current.length > 0 ? current : response.areas[0] ? [response.areas[0].id] : []
        );
      })
      .catch(() => {
        // O botao de atualizar areas segue disponivel como fallback manual.
      });

    return () => {
      active = false;
    };
  }, [session, currentUser, legalAreas]);

  async function handleSignIn() {
    setStatus("loading");
    setMessage("Entrando com Supabase Auth.");
    try {
      const signedSession = await authService.signIn(email, password);
      await hydrateUser(signedSession);
      setPassword("");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(getFriendlyError(error));
    }
  }

  async function handleSignOut() {
    await authService.signOut();
    setSession(null);
    setCurrentUser(null);
    setAreas([]);
    setSelectedAreaIds([]);
    setLocation(null);
    setMatch(null);
    setClientTab("home");
    setLawyerTab("dashboard");
    setMessage("Sessao encerrada.");
  }

  async function handleLoadAreas() {
    setStatus("loading");
    setMessage("Buscando areas no backend.");
    try {
      const response = await legalAreas.listAreas();
      setAreas(response.areas);
      setSelectedAreaIds(response.areas[0] ? [response.areas[0].id] : []);
      setStatus("idle");
      setMessage(response.areas.length > 0 ? "Areas carregadas." : "Nenhuma area ativa encontrada.");
    } catch (error) {
      setStatus("error");
      setMessage(getFriendlyError(error));
    }
  }

  async function handleMatch() {
    if (selectedAreaIds.length === 0) {
      setStatus("error");
      setMessage("Selecione pelo menos uma area juridica antes de buscar.");
      return;
    }

    let activeLocation = location;
    if (!activeLocation) {
      setStatus("loading");
      setMessage("Obtendo sua localizacao para a busca.");
      const result = await requestDeviceLocation();
      if (result.status === "denied") {
        setStatus("error");
        setMessage("Localizacao negada. Permita o acesso para encontrar um advogado proximo.");
        return;
      }
      if (result.status === "unavailable") {
        setStatus("error");
        setMessage("Nao foi possivel obter sua localizacao agora. Tente novamente.");
        return;
      }
      activeLocation = result.location;
      setLocation(result.location);
    }

    setStatus("loading");
    setMessage("Consultando match no backend.");
    try {
      const response = await matches.requestMatch({
        lat: activeLocation.lat,
        lng: activeLocation.lng,
        accuracyM: activeLocation.accuracyM,
        areaIds: selectedAreaIds
      });
      setMatch(response);
      setStatus("idle");
      setMessage(response.lawyer ? "Advogado indicado." : "Ainda nao ha advogado compativel para este teste.");
    } catch (error) {
      setStatus("error");
      setMessage(getFriendlyError(error));
    }
  }

  function toggleArea(areaId: string) {
    setSelectedAreaIds((current) =>
      current.includes(areaId) ? current.filter((id) => id !== areaId) : [...current, areaId]
    );
  }

  function openMatchedProfile() {
    if (!match?.lawyer) return;
    navigation.navigate("LawyerProfile", {
      lawyerId: match.lawyer.id,
      distanceKm: match.distanceKm
    });
  }

  if (!session || !currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.loginContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.loginHeader}>
            <Image accessibilityIgnoresInvertColors source={logo} style={styles.loginLogo} />
            <Text style={styles.subtitle}>{appCopy.subtitle}</Text>
          </View>

          <View style={styles.loginPanel}>
            <Text style={styles.loginTitle}>Entrar</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="email"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={email}
            />
            <TextInput
              onChangeText={setPassword}
              placeholder="senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
              value={password}
            />
            <TouchableOpacity
              disabled={status === "loading"}
              style={[styles.primaryButton, status === "loading" && styles.disabledButton]}
              accessibilityRole="button"
              onPress={handleSignIn}
            >
              <Text style={styles.primaryButtonText}>Entrar</Text>
            </TouchableOpacity>
          </View>

          <StatusBox status={status} message={message} />
          <LegalLinks />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentUser.role === "lawyer") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.authenticatedShell}>
          <ShellHeader email={session.email} role={currentUser.role} />
          <ScrollView contentContainerStyle={styles.container}>
            {lawyerTab === "dashboard" ? (
              <>
                <View style={styles.heroPanel}>
                  <Text style={styles.heroTitle}>Painel do advogado</Text>
                  <Text style={styles.panelText}>
                    Acompanhe sua presenca profissional no Meu Advogado 2.0 sem misturar com a jornada do cliente.
                  </Text>
                </View>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Text style={styles.cardLabel}>Perfil</Text>
                    <Text style={styles.metricValue}>Ativo</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.cardLabel}>WhatsApp</Text>
                    <Text style={styles.metricValue}>Externo</Text>
                  </View>
                </View>
              </>
            ) : null}

            {lawyerTab === "card" ? (
              <View style={styles.vipCard}>
                <Text style={styles.cardLabel}>Cartao digital</Text>
                <Text style={styles.cardTitle}>{currentUser.email ?? "Advogado 2.0"}</Text>
                <Text style={styles.panelText}>
                  O cartao de beneficios sera conectado ao backend na Parte 3. Esta view ja separa o ambiente do
                  advogado.
                </Text>
                <View style={styles.benefitRow}>
                  <Ionicons color={colors.gold} name="shield-checkmark-outline" size={22} />
                  <Text style={styles.panelText}>Beneficios seguros e sem pagamento nesta etapa.</Text>
                </View>
              </View>
            ) : null}

            {lawyerTab === "profile" ? (
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Perfil publico</Text>
                <Text style={styles.panelText}>
                  Foto, capa e bio ficam bloqueadas ate a validacao de seguranca da Parte 2.
                </Text>
              </View>
            ) : null}

            {lawyerTab === "account" ? (
              <View style={styles.accountPanel}>
                <Text style={styles.panelTitle}>Conta do advogado</Text>
                <Text style={styles.panelText}>Conectado como {session.email}.</Text>
                <TouchableOpacity style={styles.signOutButton} accessibilityRole="button" onPress={handleSignOut}>
                  <Ionicons color={colors.gold} name="log-out-outline" size={18} />
                  <Text style={styles.secondaryButtonText}>Sair</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>
          <BottomNavigation activeTab={lawyerTab} items={lawyerNavItems} onSelect={setLawyerTab} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.authenticatedShell}>
        <ShellHeader email={session.email} role={currentUser.role} />
        <ScrollView contentContainerStyle={styles.container}>
          {clientTab === "home" ? (
            <>
              <View style={styles.heroPanel}>
                <Text style={styles.heroTitle}>A justica ao alcance de um toque</Text>
                <View style={styles.locationBanner}>
                  <Ionicons color={colors.gold} name="location-outline" size={22} />
                  <Text style={styles.locationText}>{appCopy.location}</Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => setClientTab("search")}
                  style={styles.searchShortcut}
                >
                  <Ionicons color={colors.surfaceDeep} name="search-outline" size={22} />
                  <Text style={styles.searchShortcutText}>Buscar por area juridica</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.howItWorks}>
                <Text style={styles.sectionTitle}>Como funciona?</Text>
                <View style={styles.stepsRow}>
                  <View style={styles.stepItem}>
                    <Ionicons color={colors.gold} name="search-outline" size={20} />
                    <Text style={styles.stepText}>Buscar</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <Ionicons color={colors.gold} name="shield-checkmark-outline" size={20} />
                    <Text style={styles.stepText}>Conferir</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <Ionicons color={colors.gold} name="logo-whatsapp" size={20} />
                    <Text style={styles.stepText}>Conversar</Text>
                  </View>
                </View>
              </View>
              <MatchCard
                match={match}
                selectedAreaIds={selectedAreaIds}
                status={status}
                onMatch={handleMatch}
                onOpenProfile={openMatchedProfile}
              />
            </>
          ) : null}

          {clientTab === "search" ? (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Encontre o advogado certo</Text>
                <Text style={styles.panelText}>
                  Escolha uma area e use sua localizacao somente no momento da busca.
                </Text>
                <TouchableOpacity style={styles.secondaryButton} accessibilityRole="button" onPress={handleLoadAreas}>
                  <Ionicons color={colors.gold} name="refresh-outline" size={18} />
                  <Text style={styles.secondaryButtonText}>Atualizar areas</Text>
                </TouchableOpacity>
              </View>
              <AreaGrid areas={areas} selectedAreaIds={selectedAreaIds} onToggle={toggleArea} />
              <MatchCard
                match={match}
                selectedAreaIds={selectedAreaIds}
                status={status}
                onMatch={handleMatch}
                onOpenProfile={openMatchedProfile}
              />
              <StatusBox status={status} message={message} />
            </>
          ) : null}

          {clientTab === "prayer" ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Pedido de oracao</Text>
              <Text style={styles.panelText}>
                Esta tela ja tem rota propria. O envio sera liberado na Parte 3, depois da validacao de seguranca para
                texto livre e LGPD.
              </Text>
              <View style={styles.noticeRow}>
                <Ionicons color={colors.gold} name="lock-closed-outline" size={20} />
                <Text style={styles.panelText}>Sem envio, persistencia ou logs nesta etapa.</Text>
              </View>
            </View>
          ) : null}

          {clientTab === "account" ? (
            <View style={styles.accountPanel}>
              <Text style={styles.panelTitle}>Conta</Text>
              <Text style={styles.panelText}>Conectado como {session.email}.</Text>
              <LegalLinks />
              <TouchableOpacity style={styles.signOutButton} accessibilityRole="button" onPress={handleSignOut}>
                <Ionicons color={colors.gold} name="log-out-outline" size={18} />
                <Text style={styles.secondaryButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
        <BottomNavigation activeTab={clientTab} items={clientNavItems} onSelect={setClientTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  loginContainer: {
    flexGrow: 1,
    gap: spacing.lg,
    justifyContent: "center",
    padding: 20,
    paddingBottom: spacing.xl
  },
  container: {
    gap: spacing.lg,
    padding: 20,
    paddingBottom: 112
  },
  loginHeader: {
    alignItems: "center",
    gap: spacing.sm
  },
  loginLogo: {
    aspectRatio: 1,
    borderRadius: 16,
    height: 180,
    width: 180
  },
  subtitle: {
    color: colors.textMuted,
    textAlign: "center"
  },
  loginPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  loginTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800"
  },
  authenticatedShell: {
    flex: 1
  },
  shellHeader: {
    backgroundColor: colors.surfaceDeep,
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    gap: spacing.xs,
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  headerLogo: {
    borderRadius: 12,
    height: 48,
    width: 48
  },
  brandTextBlock: {
    flex: 1
  },
  brandTitle: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: "900"
  },
  brandSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16
  },
  sessionHint: {
    color: colors.textMuted,
    fontSize: 12,
    paddingLeft: 64
  },
  heroPanel: {
    gap: spacing.md
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 32
  },
  locationBanner: {
    alignItems: "center",
    backgroundColor: colors.surfaceDeep,
    borderRadius: 16,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md
  },
  locationText: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  },
  searchShortcut: {
    alignItems: "center",
    backgroundColor: colors.textPrimary,
    borderRadius: 16,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg
  },
  searchShortcutText: {
    color: colors.surfaceDeep,
    fontSize: 16,
    fontWeight: "700"
  },
  panelTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800"
  },
  panelText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  input: {
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.textPrimary,
    minHeight: 44,
    paddingHorizontal: spacing.md
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.goldContainer,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  primaryButtonText: {
    color: colors.surfaceDeep,
    fontWeight: "800"
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800"
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionAction: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  areaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  areaPill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  areaPillSelected: {
    backgroundColor: colors.goldContainer
  },
  areaText: {
    color: colors.gold,
    fontWeight: "700"
  },
  areaTextSelected: {
    color: colors.surfaceDeep
  },
  lawyerCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  accountPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  vipCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  cardLabel: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800"
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "900"
  },
  matchMeta: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800"
  },
  cardActions: {
    gap: spacing.sm
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.gold,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  secondaryButtonText: {
    color: colors.gold,
    fontWeight: "800"
  },
  whatsButton: {
    alignItems: "center",
    backgroundColor: colors.whatsapp,
    borderRadius: 8,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  whatsButtonText: {
    color: colors.surfaceDeep,
    fontWeight: "800"
  },
  disabledButton: {
    opacity: 0.45
  },
  legalLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "center",
    paddingVertical: spacing.sm
  },
  legalText: {
    color: colors.textMuted,
    fontSize: 13,
    textDecorationLine: "underline"
  },
  howItWorks: {
    gap: spacing.md
  },
  stepsRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  stepItem: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    minHeight: 88,
    justifyContent: "center",
    padding: spacing.sm
  },
  stepText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  },
  signOutButton: {
    alignItems: "center",
    borderColor: colors.gold,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  bottomNavigation: {
    alignItems: "center",
    backgroundColor: colors.surfaceDeep,
    borderColor: colors.borderSubtle,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    left: 0,
    minHeight: 76,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    position: "absolute",
    right: 0
  },
  bottomNavItem: {
    alignItems: "center",
    flex: 1,
    gap: spacing.xs,
    minHeight: 56,
    justifyContent: "center"
  },
  bottomNavText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  bottomNavTextActive: {
    color: colors.gold
  },
  statusBox: {
    alignItems: "center",
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md
  },
  statusBoxError: {
    borderColor: colors.danger
  },
  statusText: {
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20
  },
  noticeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  benefitRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  metricsGrid: {
    flexDirection: "row",
    gap: spacing.md
  }
});
