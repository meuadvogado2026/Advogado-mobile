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
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { appCopy } from "../config/contracts";
import { createAuthService } from "../services/authService";
import { createApiClient } from "../services/apiClient";
import { createAreasService, type LegalArea } from "../services/areasService";
import { requestDeviceLocation, type DeviceLocation } from "../services/locationService";
import { createMatchService, type MatchResponse } from "../services/matchService";
import { secureSessionStorage } from "../services/secureSessionStorage";
import type { Session } from "../services/sessionStorage";
import { colors, spacing } from "../theme/tokens";

type ViewStatus = "idle" | "loading" | "error";
const logo = require("../../assets/logo-blue.png");
const legalUrls = {
  privacy: "https://meuadvogado2026.github.io/meu-advogado-legal/privacidade.html",
  terms: "https://meuadvogado2026.github.io/meu-advogado-legal/termos.html",
  deletion: "https://meuadvogado2026.github.io/meu-advogado-legal/exclusao-de-dados.html"
};

/** Descreve o resultado do match em linguagem util ao cliente. */
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

/** Abre o WhatsApp do advogado (normaliza para DDI 55 quando ausente). */
function openWhatsApp(rawNumber: string) {
  const digits = rawNumber.replace(/\D/g, "");
  const intl = digits.startsWith("55") ? digits : `55${digits}`;
  return Linking.openURL(`https://wa.me/${intl}`);
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

function getFriendlyError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "SUPABASE_AUTH_PUBLICO_AUSENTE") {
      return "Configure a anon key publica do Supabase para entrar.";
    }

    return error.message;
  }

  return "Nao foi possivel concluir a acao.";
}

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const [session, setSession] = useState<Session | null>(null);
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

  useEffect(() => {
    let mounted = true;

    authService
      .getSession()
      .then((restoredSession) => {
        if (!mounted) {
          return;
        }

        setSession(restoredSession);
        setStatus("idle");
        setMessage(restoredSession ? "Sessao restaurada." : "Entre com um usuario de teste.");
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setStatus("idle");
        setMessage("Entre com um usuario de teste.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Carrega as areas automaticamente quando ha sessao (menos um toque para o cliente).
  useEffect(() => {
    if (!session) {
      return;
    }

    let active = true;
    legalAreas
      .listAreas()
      .then((response) => {
        if (!active) {
          return;
        }

        setAreas(response.areas);
        setSelectedAreaIds((current) =>
          current.length > 0 ? current : response.areas[0] ? [response.areas[0].id] : []
        );
      })
      .catch(() => {
        // Falha silenciosa: o botao "Areas" continua disponivel como fallback manual.
      });

    return () => {
      active = false;
    };
  }, [session, legalAreas]);

  async function handleSignIn() {
    setStatus("loading");
    setMessage("Entrando com Supabase Auth.");
    try {
      const signedSession = await authService.signIn(email, password);
      setSession(signedSession);
      setPassword("");
      setMessage("Login concluido. Carregue as areas juridicas.");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(getFriendlyError(error));
    }
  }

  async function handleSignOut() {
    await authService.signOut();
    setSession(null);
    setAreas([]);
    setSelectedAreaIds([]);
    setLocation(null);
    setMatch(null);
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

    // Obtem a localizacao na hora da busca (permissao em contexto), se ainda nao houver.
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

  if (!session) {
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

          <View style={[styles.statusBox, status === "error" && styles.statusBoxError]}>
            {status === "loading" && <ActivityIndicator color={colors.gold} />}
            <Text style={styles.statusText}>{message}</Text>
          </View>
          <LegalLinks />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.homeHeader}>
          <Image accessibilityIgnoresInvertColors source={logo} style={styles.homeLogo} />
          <Text style={styles.subtitle}>{appCopy.subtitle}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Sessao do cliente</Text>
          <Text style={styles.panelText}>Conectado como {session.email}.</Text>
          <TouchableOpacity style={styles.secondaryButton} accessibilityRole="button" onPress={handleSignOut}>
            <Text style={styles.secondaryButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Encontre o advogado certo</Text>
          <Text style={styles.panelText}>{appCopy.location}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              accessibilityRole="button"
              onPress={handleLoadAreas}
            >
              <Text style={styles.secondaryButtonText}>Atualizar areas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {areas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Areas juridicas</Text>
            <View style={styles.areaGrid}>
              {areas.map((area) => {
                const selected = selectedAreaIds.includes(area.id);
                return (
                  <TouchableOpacity
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    key={area.id}
                    onPress={() => toggleArea(area.id)}
                    style={[styles.areaPill, selected && styles.areaPillSelected]}
                  >
                    <Text style={[styles.areaText, selected && styles.areaTextSelected]}>{area.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <View style={styles.lawyerCard}>
          <Text style={styles.cardLabel}>Advogado Indicado</Text>
          <Text style={styles.cardTitle}>{match?.lawyer?.name ?? "Aguardando match"}</Text>
          <Text style={styles.panelText}>{match?.message ?? describeMatch(match)}</Text>
          <TouchableOpacity
            disabled={selectedAreaIds.length === 0 || status === "loading"}
            style={[
              styles.primaryButton,
              (selectedAreaIds.length === 0 || status === "loading") && styles.disabledButton
            ]}
            accessibilityRole="button"
            onPress={handleMatch}
          >
            <Text style={styles.primaryButtonText}>Buscar match</Text>
          </TouchableOpacity>
          {match?.lawyer?.whatsapp ? (
            <TouchableOpacity
              style={styles.whatsButton}
              accessibilityRole="button"
              onPress={() => openWhatsApp(match.lawyer!.whatsapp!)}
            >
              <Text style={styles.whatsButtonText}>Falar no WhatsApp</Text>
            </TouchableOpacity>
          ) : null}
          {match?.lawyer ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate("LawyerProfile", {
                  lawyerId: match.lawyer!.id,
                  distanceKm: match.distanceKm
                })
              }
            >
              <Text style={styles.secondaryButtonText}>Ver perfil</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={[styles.statusBox, status === "error" && styles.statusBoxError]}>
          {status === "loading" && <ActivityIndicator color={colors.gold} />}
          <Text style={styles.statusText}>{message}</Text>
        </View>
        <LegalLinks />
      </ScrollView>
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
    paddingBottom: spacing.xl
  },
  loginHeader: {
    alignItems: "center",
    gap: spacing.sm
  },
  homeHeader: {
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm
  },
  loginLogo: {
    aspectRatio: 1,
    borderRadius: 8,
    height: 180,
    width: 180
  },
  homeLogo: {
    aspectRatio: 1,
    borderRadius: 8,
    height: 112,
    width: 112
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
  loginTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800"
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
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
  areaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  areaPill: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    borderWidth: 1,
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
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
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
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.gold,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
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
  }
});
