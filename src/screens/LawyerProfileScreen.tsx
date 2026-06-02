import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { ApiClientError, createApiClient } from "../services/apiClient";
import { createAuthService } from "../services/authService";
import { createLawyerProfileService, type PublicLawyerProfile } from "../services/lawyerProfileService";
import { secureSessionStorage } from "../services/secureSessionStorage";
import { colors, spacing } from "../theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "LawyerProfile">;
type ProfileStatus = "loading" | "ready" | "error" | "unavailable";

const legalUrls = {
  privacy: "https://meuadvogado2026.github.io/meu-advogado-legal/privacidade.html",
  terms: "https://meuadvogado2026.github.io/meu-advogado-legal/termos.html",
  deletion: "https://meuadvogado2026.github.io/meu-advogado-legal/exclusao-de-dados.html"
};

function normalizeWhatsApp(rawNumber?: string | null) {
  const digits = rawNumber?.replace(/\D/g, "") ?? "";
  if (digits.length < 10 || digits.length > 13) {
    return null;
  }
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function safeImageUrl(url?: string | null) {
  return typeof url === "string" && url.startsWith("https://") ? url : null;
}

function LegalLinks() {
  return (
    <View style={styles.legalLinks}>
      <Text style={styles.legalText} onPress={() => Linking.openURL(legalUrls.privacy)}>Privacidade</Text>
      <Text style={styles.legalText} onPress={() => Linking.openURL(legalUrls.terms)}>Termos</Text>
      <Text style={styles.legalText} onPress={() => Linking.openURL(legalUrls.deletion)}>Excluir dados</Text>
    </View>
  );
}

export function LawyerProfileScreen({ navigation, route }: Props) {
  const [profile, setProfile] = useState<PublicLawyerProfile | null>(null);
  const [status, setStatus] = useState<ProfileStatus>("loading");
  const authService = useMemo(() => createAuthService({ storage: secureSessionStorage }), []);
  const apiClient = useMemo(() => createApiClient({ getSession: authService.getSession }), [authService]);
  const profiles = useMemo(() => createLawyerProfileService(apiClient), [apiClient]);

  useEffect(() => {
    let active = true;
    profiles
      .getById(route.params.lawyerId)
      .then((response) => {
        if (!active) return;
        setProfile(response.lawyer);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStatus(error instanceof ApiClientError && error.status === 404 ? "unavailable" : "error");
      });
    return () => {
      active = false;
    };
  }, [profiles, route.params.lawyerId]);

  const whatsapp = normalizeWhatsApp(profile?.whatsapp);
  const avatarUrl = safeImageUrl(profile?.avatarUrl);
  const coverUrl = safeImageUrl(profile?.coverUrl);
  const place = [profile?.city, profile?.state].filter(Boolean).join("/");
  const distance =
    typeof route.params.distanceKm === "number" ? `${route.params.distanceKm.toFixed(1)} km de voce` : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Perfil profissional</Text>
          <Text style={styles.heroTitle}>Advogado verificado para atendimento externo</Text>
        </View>

        {status === "loading" ? (
          <View style={styles.statePanel}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.panelText}>Carregando perfil profissional.</Text>
          </View>
        ) : null}

        {status === "error" ? (
          <View style={styles.statePanel}>
            <Text style={styles.panelText}>Nao foi possivel carregar o perfil agora. Tente novamente.</Text>
          </View>
        ) : null}

        {status === "unavailable" ? (
          <View style={styles.statePanel}>
            <Text style={styles.panelText}>Este perfil nao esta disponivel no momento. Busque outro advogado.</Text>
          </View>
        ) : null}

        {status === "ready" && profile ? (
          <>
            <View style={styles.profileCard}>
              <View style={styles.coverFrame}>
                {coverUrl ? (
                  <Image accessibilityIgnoresInvertColors source={{ uri: coverUrl }} style={styles.coverImage} />
                ) : (
                  <View style={styles.coverFallback}>
                    <Text style={styles.coverFallbackText}>Advogado 2.0</Text>
                  </View>
                )}
              </View>
              <View style={styles.avatarFrame}>
                {avatarUrl ? (
                  <Image accessibilityIgnoresInvertColors source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitial}>{profile.name.slice(0, 1).toUpperCase()}</Text>
                )}
              </View>
              <View style={styles.verifiedRow}>
                <Text style={styles.eyebrow}>{profile.verified ? "Perfil verificado" : "Perfil profissional"}</Text>
              </View>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.oab}>OAB/{profile.oabState} {profile.oabNumber}</Text>
              {place || distance ? <Text style={styles.panelText}>{[distance, place].filter(Boolean).join(" - ")}</Text> : null}
              {profile.miniBio ? <Text style={styles.miniBio}>{profile.miniBio}</Text> : null}
              <View style={styles.areaGrid}>
                {profile.areas.map((area) => (
                  <View key={area.id} style={styles.areaPill}>
                    <Text style={styles.areaText}>{area.name}</Text>
                  </View>
                ))}
              </View>
              {profile.fullBio ? (
                <View style={styles.bioPanel}>
                  <Text style={styles.sectionTitle}>Sobre o profissional</Text>
                  <Text style={styles.panelText}>{profile.fullBio}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.sectionTitle}>Contato profissional</Text>
              <Text style={styles.panelText}>
                O atendimento continua fora da plataforma. Combine diretamente os proximos passos com o profissional.
              </Text>
              {whatsapp ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => Linking.openURL(`https://wa.me/${whatsapp}`)}
                  style={styles.whatsButton}
                >
                  <Text style={styles.whatsButtonText}>Falar no WhatsApp</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.panelText}>Este profissional ainda nao tem WhatsApp disponivel.</Text>
              )}
            </View>
          </>
        ) : null}

        <LegalLinks />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { gap: spacing.lg, padding: 20, paddingBottom: spacing.xl },
  backButton: { alignSelf: "flex-start", borderColor: colors.gold, borderRadius: 8, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backText: { color: colors.gold, fontWeight: "800" },
  hero: { backgroundColor: colors.surfaceDeep, borderRadius: 8, gap: spacing.sm, padding: spacing.lg },
  eyebrow: { color: colors.gold, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  heroTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", lineHeight: 30 },
  statePanel: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.borderSubtle, borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: spacing.sm, padding: spacing.lg },
  profileCard: { backgroundColor: colors.surface, borderColor: colors.borderSubtle, borderRadius: 8, borderWidth: 1, gap: spacing.md, overflow: "hidden", padding: spacing.lg, paddingTop: 0 },
  coverFrame: { backgroundColor: colors.surfaceDeep, height: 136, marginHorizontal: -spacing.lg, marginBottom: -spacing.lg },
  coverImage: { height: "100%", width: "100%" },
  coverFallback: { alignItems: "center", backgroundColor: colors.surfaceDeep, borderBottomColor: colors.borderSubtle, borderBottomWidth: 1, flex: 1, justifyContent: "center" },
  coverFallbackText: { color: colors.gold, fontSize: 16, fontWeight: "800", textTransform: "uppercase" },
  avatarFrame: { alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.surfaceDeep, borderColor: colors.gold, borderRadius: 36, borderWidth: 2, height: 72, justifyContent: "center", marginTop: -20, overflow: "hidden", width: 72 },
  avatarImage: { height: "100%", width: "100%" },
  avatarInitial: { color: colors.gold, fontSize: 28, fontWeight: "800" },
  verifiedRow: { flexDirection: "row" },
  name: { color: colors.textPrimary, fontSize: 24, fontWeight: "800" },
  oab: { color: colors.gold, fontSize: 13, fontWeight: "800" },
  miniBio: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", lineHeight: 22 },
  panelText: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  areaGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  areaPill: { backgroundColor: colors.goldContainer, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  areaText: { color: colors.surfaceDeep, fontSize: 12, fontWeight: "800" },
  bioPanel: { borderTopColor: colors.borderSubtle, borderTopWidth: 1, gap: spacing.sm, paddingTop: spacing.md },
  contactCard: { backgroundColor: colors.surface, borderColor: colors.borderSubtle, borderRadius: 8, borderWidth: 1, gap: spacing.md, padding: spacing.lg },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  whatsButton: { alignItems: "center", backgroundColor: colors.whatsapp, borderRadius: 8, minHeight: 48, justifyContent: "center", paddingHorizontal: spacing.md },
  whatsButtonText: { color: colors.surfaceDeep, fontWeight: "800" },
  legalLinks: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, justifyContent: "center", paddingVertical: spacing.sm },
  legalText: { color: colors.textMuted, fontSize: 13, textDecorationLine: "underline" }
});
