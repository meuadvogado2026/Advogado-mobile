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
import { ApiClientError, createApiClient } from "../services/apiClient";
import { createAreasService, type LegalArea } from "../services/areasService";
import { createAuthService } from "../services/authService";
import { createClientSignupService } from "../services/clientSignupService";
import { createLawyerDashboardService, type LawyerDashboardResponse } from "../services/lawyerDashboardService";
import { requestDeviceLocation, type DeviceLocation } from "../services/locationService";
import { createMatchService, type MatchResponse } from "../services/matchService";
import { createMeService, type CurrentUser } from "../services/meService";
import { createPartnerLogoService, type PartnerLogo } from "../services/partnerLogoService";
import { createPrayerRequestService } from "../services/prayerRequestService";
import { secureSessionStorage } from "../services/secureSessionStorage";
import type { Session } from "../services/sessionStorage";
import { colors, spacing } from "../theme/tokens";

type ViewStatus = "idle" | "loading" | "error";
type AuthMode = "signIn" | "signUp";
type ClientTab = "home" | "profile";
type LawyerTab = "dashboard" | "card" | "profile" | "account";
type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const logo = require("../../assets/logo-blue.png");
const prayerArt = require("../../assets/prayer-bible-cross.png");
const legalUrls = {
  privacy: "https://meuadvogado2026.github.io/meu-advogado-legal/privacidade.html",
  terms: "https://meuadvogado2026.github.io/meu-advogado-legal/termos.html",
  deletion: "https://meuadvogado2026.github.io/meu-advogado-legal/exclusao-de-dados.html"
};
const URGENT_LAWYER_WHATSAPP = "5561993574056";

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
  if (error instanceof ApiClientError) {
    if (error.status === 404) {
      return "Cadastro ainda indisponivel nesta versao do backend.";
    }
    if (error.status === 422) {
      return "Revise os dados enviados e tente novamente.";
    }
  }
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

function PageLogo() {
  return (
    <View style={styles.pageLogoWrap}>
      <Image accessibilityIgnoresInvertColors source={logo} style={styles.pageLogo} />
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
            <View style={[styles.bottomIconBadge, selected && styles.bottomIconBadgeActive]}>
              <Ionicons color={selected ? colors.surfaceDeep : colors.goldBright} name={item.icon} size={22} />
            </View>
            <Text style={[styles.bottomNavText, selected && styles.bottomNavTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const clientNavItems: Array<{ label: string; tab: ClientTab; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: "Home", tab: "home", icon: "home-outline" },
  { label: "Perfil", tab: "profile", icon: "person-outline" }
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

function AreaCarousel({
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
        <Text style={styles.sectionAction}>selecionar</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.areaCarousel}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {areas.map((area) => {
          const selected = selectedAreaIds.includes(area.id);
          return (
            <TouchableOpacity
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              key={area.id}
              onPress={() => onToggle(area.id)}
              style={[styles.areaTile, selected && styles.areaTileSelected]}
            >
              <View style={[styles.areaIconBadge, selected && styles.areaIconBadgeSelected]}>
                <Ionicons color={selected ? colors.surfaceDeep : colors.goldBright} name={getAreaIcon(area.name)} size={31} />
              </View>
              <Text numberOfLines={2} style={[styles.areaTileText, selected && styles.areaTileTextSelected]}>
                {getAreaLabel(area.name)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
}

function getAreaIcon(areaName: string): keyof typeof Ionicons.glyphMap {
  const normalized = areaName.toLowerCase();
  if (normalized.includes("trabalh")) return "briefcase-outline";
  if (normalized.includes("famil")) return "people-outline";
  if (normalized.includes("consum")) return "cart-outline";
  if (normalized.includes("imob")) return "business-outline";
  if (normalized.includes("criminal")) return "scale-outline";
  if (normalized.includes("previd")) return "shield-checkmark-outline";
  if (normalized.includes("civil") || normalized.includes("civel")) return "document-text-outline";
  return "library-outline";
}

function getAreaLabel(areaName: string): string {
  return areaName.replace(/^direito\s+(de|da|do|das|dos)?\s*/i, "").trim();
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
  const hasLawyer = Boolean(match?.lawyer);
  const lawyerInitial = match?.lawyer?.name?.slice(0, 1).toUpperCase() ?? "A";
  const coverUrl = match?.lawyer?.coverUrl ?? null;
  const avatarUrl = match?.lawyer?.avatarUrl ?? null;

  return (
    <View style={styles.lawyerCard}>
      <View style={styles.lawyerCover}>
        {coverUrl ? (
          <Image accessibilityIgnoresInvertColors source={{ uri: coverUrl }} style={styles.lawyerCoverImage} />
        ) : null}
      </View>
      <View style={styles.lawyerContent}>
        <View style={styles.lawyerIdentityRow}>
          <View style={styles.matchAvatar}>
            {avatarUrl ? (
              <Image accessibilityIgnoresInvertColors source={{ uri: avatarUrl }} style={styles.matchAvatarImage} />
            ) : (
              <Text style={styles.matchAvatarText}>{lawyerInitial}</Text>
            )}
            {hasLawyer ? (
              <View style={styles.verifiedDot}>
                <Ionicons color={colors.textPrimary} name="checkmark" size={12} />
              </View>
            ) : null}
          </View>
          <View style={styles.lawyerNameBlock}>
            <Text style={styles.cardTitle}>{match?.lawyer?.name ?? "Advogado indicado"}</Text>
            {match?.lawyer ? (
              <View style={styles.oabBadge}>
                <Text style={styles.oabBadgeText}>Perfil verificado</Text>
              </View>
            ) : (
              <Text style={styles.panelText}>Selecione uma area para iniciar o match.</Text>
            )}
          </View>
        </View>
        <Text style={styles.panelText}>{match?.message ?? describeMatch(match)}</Text>
        {match?.lawyer?.city ? (
          <View style={styles.matchMetaRow}>
            <Ionicons color={colors.textMuted} name="navigate-outline" size={17} />
            <Text style={styles.matchMeta}>
              {match.lawyer.city}
              {match.lawyer.state ? `/${match.lawyer.state}` : ""}
              {typeof match.distanceKm === "number" ? ` - ${match.distanceKm.toFixed(1)} km` : ""}
            </Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity
        disabled={selectedAreaIds.length === 0 || status === "loading"}
        style={[styles.primaryButton, (selectedAreaIds.length === 0 || status === "loading") && styles.disabledButton]}
        accessibilityRole="button"
        onPress={onMatch}
      >
        <View style={styles.goldGradientLayer} />
        <Ionicons color={colors.surfaceDeep} name="search-outline" size={18} />
        <Text style={styles.primaryButtonText}>Buscar match</Text>
      </TouchableOpacity>
      <View style={styles.cardActions}>
        {match?.lawyer ? (
          <TouchableOpacity style={styles.lawyerActionButton} accessibilityRole="button" onPress={onOpenProfile}>
            <Ionicons color={colors.gold} name="person-outline" size={18} />
            <Text style={styles.lawyerActionText}>Perfil</Text>
          </TouchableOpacity>
        ) : null}
        {match?.lawyer?.whatsapp ? (
          <TouchableOpacity
            style={styles.lawyerWhatsButton}
            accessibilityRole="button"
            onPress={() => openWhatsApp(match.lawyer!.whatsapp!)}
          >
            <Ionicons color={colors.whatsapp} name="logo-whatsapp" size={18} />
            <Text style={styles.lawyerWhatsText}>WhatsApp</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function UrgentLawyerButton() {
  return (
    <TouchableOpacity
      accessibilityLabel="Advogado urgente pelo WhatsApp"
      accessibilityRole="button"
      onPress={() => openWhatsApp(URGENT_LAWYER_WHATSAPP)}
      style={styles.urgentButton}
    >
      <View style={styles.urgentIconBadge}>
        <Ionicons color={colors.textPrimary} name="warning-outline" size={19} />
      </View>
      <View style={styles.urgentTextBlock}>
        <Text style={styles.urgentTitle}>Advogado urgente</Text>
      </View>
      <Ionicons color={colors.textPrimary} name="logo-whatsapp" size={19} />
    </TouchableOpacity>
  );
}

function PrayerHomeBlock({
  anonymous,
  message,
  receipt,
  status,
  onAnonymousChange,
  onMessageChange,
  onSubmit
}: {
  anonymous: boolean;
  message: string;
  receipt: string | null;
  status: ViewStatus;
  onAnonymousChange: () => void;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.prayerCard}>
      <Image accessibilityIgnoresInvertColors source={prayerArt} style={styles.prayerImage} />
      <View style={styles.prayerOverlay} />
      <View style={styles.prayerContent}>
        <Text style={styles.cardLabel}>Pedido de oracao</Text>
        <Text style={styles.prayerTitle}>Um espaco reservado e anonimo</Text>
        <Text style={styles.prayerText}>
          Envie um pedido breve. Nao inclua senha, documento, endereco completo, telefone ou detalhes juridicos
          sensiveis.
        </Text>
        <TextInput
          multiline
          onChangeText={onMessageChange}
          placeholder="Escreva entre 20 e 500 caracteres"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.prayerInput]}
          value={message}
        />
        <TouchableOpacity
          accessibilityRole="checkbox"
          accessibilityState={{ checked: anonymous }}
          onPress={onAnonymousChange}
          style={styles.toggleRow}
        >
          <Ionicons color={colors.gold} name={anonymous ? "checkbox-outline" : "square-outline"} size={22} />
          <Text style={styles.prayerText}>Enviar como anonimo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={status === "loading" || message.trim().length < 20}
          style={[
            styles.primaryButton,
            (status === "loading" || message.trim().length < 20) && styles.disabledButton
          ]}
          accessibilityRole="button"
          onPress={onSubmit}
        >
          <View style={styles.goldGradientLayer} />
          <Ionicons color={colors.surfaceDeep} name="heart-outline" size={18} />
          <Text style={styles.primaryButtonText}>Enviar pedido</Text>
        </TouchableOpacity>
        {receipt ? (
          <View style={styles.noticeRow}>
            <Ionicons color={colors.gold} name="checkmark-circle-outline" size={20} />
            <Text style={styles.prayerText}>Pedido recebido com seguranca.</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function PartnersFooter({ partners }: { partners: PartnerLogo[] }) {
  if (partners.length === 0) {
    return null;
  }

  return (
    <View style={styles.partnersFooter}>
      <Text style={styles.partnersTitle}>Parceiros</Text>
      <ScrollView
        contentContainerStyle={styles.partnerLogoRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {partners.map((partner) => (
          <TouchableOpacity
            accessibilityLabel={`Abrir parceiro ${partner.name}`}
            accessibilityRole="link"
            disabled={!partner.websiteUrl}
            key={partner.id}
            onPress={() => partner.websiteUrl && Linking.openURL(partner.websiteUrl)}
            style={styles.partnerLogoItem}
          >
            <Image accessibilityIgnoresInvertColors source={{ uri: partner.logoUrl }} style={styles.partnerLogoImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export function HomeScreen({ navigation }: Props) {
  const [clientTab, setClientTab] = useState<ClientTab>("home");
  const [lawyerTab, setLawyerTab] = useState<LawyerTab>("dashboard");
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [signupName, setSignupName] = useState("");
  const [email, setEmail] = useState("usuario@advogado20.com");
  const [password, setPassword] = useState("");
  const [areas, setAreas] = useState<LegalArea[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [areaSearch, setAreaSearch] = useState("");
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [match, setMatch] = useState<MatchResponse | null>(null);
  const [lawyerDashboard, setLawyerDashboard] = useState<LawyerDashboardResponse | null>(null);
  const [partners, setPartners] = useState<PartnerLogo[]>([]);
  const [prayerMessage, setPrayerMessage] = useState("");
  const [prayerAnonymous, setPrayerAnonymous] = useState(true);
  const [prayerReceipt, setPrayerReceipt] = useState<string | null>(null);
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [message, setMessage] = useState("Carregando sessao segura.");

  const authService = useMemo(() => createAuthService({ storage: secureSessionStorage }), []);
  const apiClient = useMemo(() => createApiClient({ getSession: authService.getSession }), [authService]);
  const clientSignups = useMemo(() => createClientSignupService(apiClient), [apiClient]);
  const legalAreas = useMemo(() => createAreasService(apiClient), [apiClient]);
  const matches = useMemo(() => createMatchService(apiClient), [apiClient]);
  const me = useMemo(() => createMeService(apiClient), [apiClient]);
  const lawyerDashboards = useMemo(() => createLawyerDashboardService(apiClient), [apiClient]);
  const prayerRequests = useMemo(() => createPrayerRequestService(apiClient), [apiClient]);
  const partnerLogos = useMemo(() => createPartnerLogoService(apiClient), [apiClient]);
  const visibleAreas = useMemo(() => {
    const query = areaSearch.trim().toLowerCase();
    if (!query) return areas;
    return areas.filter((area) => area.name.toLowerCase().includes(query));
  }, [areaSearch, areas]);

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

  useEffect(() => {
    if (!session || currentUser?.role !== "client") {
      return;
    }

    let active = true;
    partnerLogos
      .listPublic()
      .then((response) => {
        if (!active) return;
        setPartners(response.partners);
      })
      .catch(() => {
        if (!active) return;
        setPartners([]);
      });

    return () => {
      active = false;
    };
  }, [session, currentUser, partnerLogos]);

  useEffect(() => {
    if (!session || currentUser?.role !== "lawyer") {
      return;
    }

    let active = true;
    lawyerDashboards
      .getDashboard()
      .then((response) => {
        if (!active) return;
        setLawyerDashboard(response);
      })
      .catch(() => {
        if (!active) return;
        setLawyerDashboard(null);
      });

    return () => {
      active = false;
    };
  }, [session, currentUser, lawyerDashboards]);

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

  async function handleSignUp() {
    setStatus("loading");
    setMessage("Criando usuario cliente com seguranca.");
    try {
      await clientSignups.create({
        name: signupName,
        email,
        password
      });
      const signedSession = await authService.signIn(email, password);
      await hydrateUser(signedSession);
      setSignupName("");
      setPassword("");
      setAuthMode("signIn");
      setStatus("idle");
      setMessage("Usuario criado e sessao iniciada.");
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
    setAreaSearch("");
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

  async function handleLoadLawyerDashboard() {
    setStatus("loading");
    setMessage("Atualizando painel do advogado.");
    try {
      const response = await lawyerDashboards.getDashboard();
      setLawyerDashboard(response);
      setStatus("idle");
      setMessage("Painel do advogado atualizado.");
    } catch (error) {
      setStatus("error");
      setMessage(getFriendlyError(error));
    }
  }

  async function handleSubmitPrayer() {
    setStatus("loading");
    setMessage("Enviando pedido de oracao com seguranca.");
    try {
      const response = await prayerRequests.create({
        message: prayerMessage,
        anonymous: prayerAnonymous
      });
      setPrayerReceipt(response.request.createdAt);
      setPrayerMessage("");
      setStatus("idle");
      setMessage("Pedido de oracao recebido.");
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
            <Text style={styles.loginTitle}>{authMode === "signIn" ? "Entrar" : "Criar novo usuario"}</Text>
            {authMode === "signUp" ? (
              <TextInput
                autoCapitalize="words"
                onChangeText={setSignupName}
                placeholder="nome completo"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={signupName}
              />
            ) : null}
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
              placeholder={authMode === "signIn" ? "senha" : "senha (minimo 8 caracteres)"}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
              value={password}
            />
            <TouchableOpacity
              disabled={status === "loading"}
              style={[styles.primaryButton, status === "loading" && styles.disabledButton]}
              accessibilityRole="button"
              onPress={authMode === "signIn" ? handleSignIn : handleSignUp}
            >
              <Ionicons
                color={colors.surfaceDeep}
                name={authMode === "signIn" ? "log-in-outline" : "person-add-outline"}
                size={18}
              />
              <Text style={styles.primaryButtonText}>{authMode === "signIn" ? "Entrar" : "Criar usuario"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={status === "loading"}
              style={styles.authModeButton}
              accessibilityRole="button"
              onPress={() => {
                setAuthMode((current) => (current === "signIn" ? "signUp" : "signIn"));
                setStatus("idle");
                setMessage(authMode === "signIn" ? "Informe seus dados para criar usuario cliente." : "Entre com seu usuario.");
              }}
            >
              <Text style={styles.authModeButtonText}>
                {authMode === "signIn" ? "Criar novo usuario" : "Ja tenho usuario"}
              </Text>
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
          <ScrollView contentContainerStyle={styles.container}>
            <PageLogo />
            {lawyerTab === "dashboard" ? (
              <>
                <View style={styles.heroPanel}>
                  <Text style={styles.heroTitle}>Painel do advogado</Text>
                  <Text style={styles.panelText}>
                    Acompanhe sua presenca profissional no Meu Advogado 2.0 sem misturar com a jornada do cliente.
                  </Text>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    accessibilityRole="button"
                    onPress={handleLoadLawyerDashboard}
                  >
                    <Ionicons color={colors.gold} name="refresh-outline" size={18} />
                    <Text style={styles.secondaryButtonText}>Atualizar painel</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Text style={styles.cardLabel}>Visualizacoes</Text>
                    <Text style={styles.metricValue}>{lawyerDashboard?.metrics.profileViews ?? 0}</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.cardLabel}>WhatsApp</Text>
                    <Text style={styles.metricValue}>{lawyerDashboard?.metrics.whatsappClicks ?? 0}</Text>
                  </View>
                </View>
                <StatusBox status={status} message={message} />
              </>
            ) : null}

            {lawyerTab === "card" ? (
              <View style={styles.vipCard}>
                <Text style={styles.cardLabel}>Cartao digital</Text>
                <Text style={styles.cardTitle}>
                  {lawyerDashboard?.lawyer.name ?? currentUser.email ?? "Advogado 2.0"}
                </Text>
                <Text style={styles.panelText}>
                  {lawyerDashboard?.lawyer.planLabel ?? "MVP interno"} - beneficios estaticos e seguros, sem pagamento
                  ou parceiro real.
                </Text>
                {(lawyerDashboard?.benefits ?? []).map((benefit) => (
                  <View style={styles.benefitRow} key={benefit.id}>
                    <Ionicons color={colors.gold} name="shield-checkmark-outline" size={22} />
                    <View style={styles.benefitTextBlock}>
                      <Text style={styles.benefitTitle}>{benefit.title}</Text>
                      <Text style={styles.panelText}>{benefit.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {lawyerTab === "profile" ? (
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Perfil publico</Text>
                <Text style={styles.panelText}>
                  {lawyerDashboard
                    ? `OAB ${lawyerDashboard.lawyer.oabNumber}/${lawyerDashboard.lawyer.oabState}. Perfil ${
                        lawyerDashboard.lawyer.verified ? "verificado" : "em revisao"
                      }.`
                    : "Atualize o painel para carregar os dados publicos seguros."}
                </Text>
              </View>
            ) : null}

            {lawyerTab === "account" ? (
              <View style={styles.accountPanel}>
                <Text style={styles.panelTitle}>Conta do advogado</Text>
                <Text style={styles.panelText}>Sessao autenticada com seguranca.</Text>
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
        <ScrollView contentContainerStyle={styles.container}>
          <PageLogo />
          {clientTab === "home" ? (
            <>
              <View style={styles.clientHero}>
                <Text style={styles.heroKicker}>A justica ao alcance de um toque</Text>
              </View>

              <View style={styles.searchBar}>
                <Ionicons color={colors.outline} name="search-outline" size={25} />
                <TextInput
                  autoCapitalize="none"
                  onChangeText={setAreaSearch}
                  placeholder="Buscar por area ou problema juridico"
                  placeholderTextColor={colors.searchPlaceholder}
                  style={styles.searchInput}
                  value={areaSearch}
                />
              </View>

              <AreaCarousel areas={visibleAreas} selectedAreaIds={selectedAreaIds} onToggle={toggleArea} />

              <MatchCard
                match={match}
                selectedAreaIds={selectedAreaIds}
                status={status}
                onMatch={handleMatch}
                onOpenProfile={openMatchedProfile}
              />

              <UrgentLawyerButton />

              <PrayerHomeBlock
                anonymous={prayerAnonymous}
                message={prayerMessage}
                receipt={prayerReceipt}
                status={status}
                onAnonymousChange={() => setPrayerAnonymous((current) => !current)}
                onMessageChange={setPrayerMessage}
                onSubmit={handleSubmitPrayer}
              />

              <View style={styles.howItWorks}>
                <Text style={styles.sectionTitle}>Como funciona?</Text>
                <View style={styles.timelineLine} />
                <View style={styles.stepsRow}>
                  <View style={styles.stepItem}>
                    <View style={styles.stepIconBadge}>
                      <Ionicons color={colors.surfaceDeep} name="search-outline" size={24} />
                    </View>
                    <Text style={styles.stepText}>1. Buscar</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={styles.stepIconBadge}>
                      <Ionicons color={colors.surfaceDeep} name="shield-checkmark-outline" size={24} />
                    </View>
                    <Text style={styles.stepText}>2. Conferir</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={styles.stepIconBadge}>
                      <Ionicons color={colors.surfaceDeep} name="logo-whatsapp" size={24} />
                    </View>
                    <Text style={styles.stepText}>3. Conversar</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={styles.stepIconBadge}>
                      <Ionicons color={colors.surfaceDeep} name="checkmark-circle-outline" size={24} />
                    </View>
                    <Text style={styles.stepText}>4. Resolver</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.locationFootnote}>{appCopy.location}</Text>

              <StatusBox status={status} message={message} />

              <PartnersFooter partners={partners} />
            </>
          ) : null}

          {clientTab === "profile" ? (
            <View style={styles.accountPanel}>
              <Text style={styles.panelTitle}>Perfil do cliente</Text>
              <Text style={styles.panelText}>Sessao autenticada com seguranca.</Text>
              <TouchableOpacity style={styles.secondaryButton} accessibilityRole="button" onPress={handleLoadAreas}>
                <Ionicons color={colors.gold} name="refresh-outline" size={18} />
                <Text style={styles.secondaryButtonText}>Atualizar areas</Text>
              </TouchableOpacity>
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
    gap: 28,
    padding: 20,
    paddingBottom: 124
  },
  loginHeader: {
    alignItems: "center",
    gap: spacing.sm
  },
  loginLogo: {
    aspectRatio: 1,
    borderColor: colors.goldBright,
    borderRadius: 16,
    borderWidth: 2,
    height: 168,
    width: 168
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
  authModeButton: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center"
  },
  authModeButtonText: {
    color: colors.goldBright,
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline"
  },
  authenticatedShell: {
    flex: 1
  },
  pageLogoWrap: {
    alignItems: "center",
    paddingTop: spacing.sm
  },
  pageLogo: {
    borderColor: "rgba(217,154,45,0.34)",
    borderRadius: 24,
    borderWidth: 1,
    height: 112,
    width: 112
  },
  clientHero: {
    gap: spacing.sm
  },
  heroKicker: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22
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
  locationFootnote: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 20,
    opacity: 0.88
  },
  searchBar: {
    alignItems: "center",
    backgroundColor: colors.searchSurface,
    borderRadius: 16,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.background,
    flex: 1,
    fontSize: 16,
    minHeight: 52
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
    paddingHorizontal: spacing.md,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.goldBright,
    borderRadius: 8,
    borderColor: colors.goldDeep,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    position: "relative"
  },
  goldGradientLayer: {
    backgroundColor: colors.goldDeep,
    bottom: 0,
    opacity: 0.72,
    position: "absolute",
    right: 0,
    top: 0,
    width: "46%"
  },
  primaryButtonText: {
    color: colors.surfaceDeep,
    fontWeight: "900",
    zIndex: 1
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 24,
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
  areaCarousel: {
    gap: spacing.md,
    paddingRight: 20
  },
  areaTile: {
    alignItems: "center",
    backgroundColor: "#081b35",
    borderColor: "rgba(217,154,45,0.22)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    height: 118,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    shadowColor: colors.goldBright,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    width: 118
  },
  areaTileSelected: {
    backgroundColor: "rgba(217,154,45,0.08)",
    borderColor: colors.goldBright,
    shadowOpacity: 0.28
  },
  areaIconBadge: {
    alignItems: "center",
    backgroundColor: "rgba(217,154,45,0.12)",
    borderColor: "rgba(217,154,45,0.34)",
    borderRadius: 18,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  areaIconBadgeSelected: {
    backgroundColor: colors.goldBright,
    borderColor: colors.goldBright
  },
  areaTileText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 17,
    maxWidth: 104,
    textAlign: "center"
  },
  areaTileTextSelected: {
    color: colors.goldBright
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
    backgroundColor: "#071931",
    borderColor: "rgba(217,154,45,0.18)",
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.md,
    overflow: "hidden",
    padding: spacing.lg,
    paddingTop: 0
  },
  lawyerCover: {
    backgroundColor: colors.surfaceDeep,
    height: 112,
    marginHorizontal: -spacing.lg,
    opacity: 0.86
  },
  lawyerCoverImage: {
    height: "100%",
    width: "100%"
  },
  lawyerContent: {
    gap: spacing.md,
    marginTop: -42
  },
  lawyerIdentityRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.md
  },
  matchAvatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceDeep,
    borderColor: colors.surface,
    borderRadius: 12,
    borderWidth: 4,
    height: 96,
    justifyContent: "center",
    position: "relative",
    width: 96
  },
  matchAvatarImage: {
    borderRadius: 8,
    height: "100%",
    width: "100%"
  },
  matchAvatarText: {
    color: colors.gold,
    fontSize: 38,
    fontWeight: "900"
  },
  verifiedDot: {
    alignItems: "center",
    backgroundColor: colors.blue,
    borderColor: "#071931",
    borderRadius: 999,
    borderWidth: 2,
    bottom: -4,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: -4,
    width: 28
  },
  lawyerNameBlock: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.sm
  },
  oabBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(217,154,45,0.12)",
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  oabBadgeText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800"
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
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "900"
  },
  matchMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800"
  },
  matchMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  lawyerActionButton: {
    alignItems: "center",
    borderColor: "rgba(217,154,45,0.45)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 64,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  lawyerActionText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  lawyerWhatsButton: {
    alignItems: "center",
    backgroundColor: "rgba(37,211,102,0.12)",
    borderColor: "rgba(37,211,102,0.32)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 64,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  lawyerWhatsText: {
    color: colors.whatsapp,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  urgentButton: {
    alignItems: "center",
    backgroundColor: "#c1121f",
    borderColor: "#ff6b6b",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    shadowColor: "#ff3b30",
    shadowOpacity: 0.14,
    shadowRadius: 10
  },
  urgentIconBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.26)",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  urgentTextBlock: {
    flex: 1,
    gap: 2
  },
  urgentTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "900"
  },
  urgentSubtitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    opacity: 0.9
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.goldBright,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  secondaryButtonText: {
    color: colors.goldBright,
    fontWeight: "900"
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
    position: "relative",
    gap: spacing.md
  },
  timelineLine: {
    backgroundColor: "rgba(217,154,45,0.24)",
    height: 1,
    left: 36,
    position: "absolute",
    right: 36,
    top: 74
  },
  stepsRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  stepItem: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 1,
    flex: 1,
    gap: 10,
    minHeight: 106,
    justifyContent: "center",
    padding: spacing.sm
  },
  stepIconBadge: {
    alignItems: "center",
    backgroundColor: colors.goldBright,
    borderColor: colors.goldDeep,
    borderRadius: 999,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  stepText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
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
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.borderSubtle,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    left: 0,
    minHeight: 84,
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
  bottomIconBadge: {
    alignItems: "center",
    backgroundColor: "rgba(217,154,45,0.10)",
    borderColor: "rgba(217,154,45,0.20)",
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  bottomIconBadgeActive: {
    backgroundColor: colors.goldBright,
    borderColor: colors.goldBright
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
  benefitTextBlock: {
    flex: 1
  },
  benefitTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800"
  },
  prayerInput: {
    minHeight: 120,
    paddingVertical: spacing.md,
    textAlignVertical: "top"
  },
  prayerCard: {
    backgroundColor: colors.surface,
    borderColor: "rgba(217,154,45,0.18)",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden"
  },
  prayerImage: {
    height: 150,
    width: "100%"
  },
  prayerOverlay: {
    backgroundColor: "rgba(7,20,38,0.34)",
    bottom: 0,
    height: 150,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  prayerContent: {
    gap: spacing.md,
    padding: spacing.lg
  },
  prayerTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28
  },
  prayerText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 44
  },
  metricsGrid: {
    flexDirection: "row",
    gap: spacing.md
  },
  partnersFooter: {
    gap: spacing.md,
    paddingBottom: spacing.md
  },
  partnersTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  partnerLogoRow: {
    gap: spacing.sm,
    paddingRight: 20
  },
  partnerLogoItem: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    padding: spacing.sm,
    width: 112
  },
  partnerLogoImage: {
    height: "100%",
    resizeMode: "contain",
    width: "100%"
  }
});
