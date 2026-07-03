import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppIcon, type AppIconName } from "../components/AppIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { ApiClientError, createApiClient } from "../services/apiClient";
import { createAuthService } from "../services/authService";
import { createLawyerEventService } from "../services/lawyerEventService";
import { createLawyerProfileService, type PublicLawyerProfile } from "../services/lawyerProfileService";
import { secureSessionStorage } from "../services/secureSessionStorage";
import { colors, spacing } from "../theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "LawyerProfile">;
type ProfileStatus = "loading" | "ready" | "error" | "unavailable";
type SocialLink = { key: string; label: string; icon: AppIconName; url: string };

const legalUrls = {
  privacy: "https://meuadvogado2026.github.io/meu-advogado-legal/privacidade.html",
  terms: "https://meuadvogado2026.github.io/meu-advogado-legal/termos.html",
  deletion: "https://meuadvogado2026.github.io/meu-advogado-legal/exclusao-de-dados.html"
};
const LAWYER_WHATSAPP_MESSAGE =
  "Olá, encontrei seu perfil no Advogado 2.0 e gostaria de receber orientação jurídica. Pode me ajudar?";

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

function safeExternalUrl(url?: string | null) {
  return typeof url === "string" && url.startsWith("https://") ? url : null;
}

function buildWhatsAppUrl(whatsapp: string) {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(LAWYER_WHATSAPP_MESSAGE)}`;
}

function getAreaIcon(areaName: string): AppIconName {
  const normalized = areaName.toLowerCase();
  if (normalized.includes("criminal")) return "shield-outline";
  if (normalized.includes("trabalh")) return "briefcase-outline";
  if (normalized.includes("imob")) return "business-outline";
  if (normalized.includes("famil")) return "people-outline";
  return "hammer-outline";
}

function getSocialLinks(profile: PublicLawyerProfile) {
  const candidates: Array<SocialLink | null> = [
    { key: "instagram", label: "Instagram", icon: "logo-instagram" as const, url: safeExternalUrl(profile.instagramUrl) },
    { key: "linkedin", label: "LinkedIn", icon: "logo-linkedin" as const, url: safeExternalUrl(profile.linkedinUrl) },
    { key: "facebook", label: "Facebook", icon: "logo-facebook" as const, url: safeExternalUrl(profile.facebookUrl) },
    { key: "website", label: "Site", icon: "globe-outline" as const, url: safeExternalUrl(profile.websiteUrl) }
  ].map((link) => (link.url ? { ...link, url: link.url } : null));
  return candidates.filter((link): link is SocialLink => Boolean(link));
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

export function LawyerProfileScreen({ navigation, route }: Props) {
  const [profile, setProfile] = useState<PublicLawyerProfile | null>(null);
  const [status, setStatus] = useState<ProfileStatus>("loading");
  const [openingWhatsapp, setOpeningWhatsapp] = useState(false);
  const authService = useMemo(() => createAuthService({ storage: secureSessionStorage }), []);
  const apiClient = useMemo(() => createApiClient({ getSession: authService.getSession }), [authService]);
  const events = useMemo(() => createLawyerEventService(apiClient), [apiClient]);
  const profiles = useMemo(() => createLawyerProfileService(apiClient), [apiClient]);

  useEffect(() => {
    let active = true;
    profiles
      .getById(route.params.lawyerId)
      .then((response) => {
        if (!active) return;
        setProfile(response.lawyer);
        setStatus("ready");
        void events.record(route.params.lawyerId, { eventType: "profile_view", source: "mobile" }).catch(() => undefined);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStatus(error instanceof ApiClientError && error.status === 404 ? "unavailable" : "error");
      });
    return () => {
      active = false;
    };
  }, [events, profiles, route.params.lawyerId]);

  const whatsapp = normalizeWhatsApp(profile?.whatsapp);
  const avatarUrl = safeImageUrl(profile?.avatarUrl);
  const coverUrl = safeImageUrl(profile?.coverUrl);
  const socialLinks = profile ? getSocialLinks(profile) : [];
  const place = [profile?.city, profile?.state].filter(Boolean).join(", ");
  const distance =
    typeof route.params.distanceKm === "number" ? `A ${route.params.distanceKm.toFixed(1)} km de você` : null;

  async function handleWhatsappPress() {
    if (!whatsapp || openingWhatsapp) return;
    setOpeningWhatsapp(true);
    try {
      await Promise.race([
        events
          .record(route.params.lawyerId, {
            eventType: "whatsapp_click",
            source: "mobile",
            dedupeKey: `whatsapp:${route.params.lawyerId}:${Date.now()}`
          })
          .catch(() => undefined),
        new Promise((resolve) => setTimeout(resolve, 1200))
      ]);
    } finally {
      setOpeningWhatsapp(false);
      void Linking.openURL(buildWhatsAppUrl(whatsapp));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topControls}>
        <TouchableOpacity accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.iconButton}>
          <AppIcon color={colors.textPrimary} name="arrow-back" size={24} />
        </TouchableOpacity>
        <View style={styles.topRightControls}>
          <View style={styles.passiveIcon}>
            <AppIcon color={colors.textPrimary} name="shield-checkmark-outline" size={20} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {status === "loading" ? (
          <View style={styles.statePanel}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.panelText}>Carregando perfil profissional.</Text>
          </View>
        ) : null}

        {status === "error" ? (
          <View style={styles.statePanel}>
            <Text style={styles.panelText}>Não foi possível carregar o perfil agora. Tente novamente.</Text>
          </View>
        ) : null}

        {status === "unavailable" ? (
          <View style={styles.statePanel}>
            <Text style={styles.panelText}>Este perfil não está disponível no momento. Busque outro advogado.</Text>
          </View>
        ) : null}

        {status === "ready" && profile ? (
          <>
            <View style={styles.hero}>
              {coverUrl ? (
                <Image accessibilityIgnoresInvertColors source={{ uri: coverUrl }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverFallback}>
                  <AppIcon color={colors.gold} name="business-outline" size={56} />
                </View>
              )}
              <View style={styles.heroScrim} />
            </View>

            <View style={styles.identitySection}>
              <Text style={styles.profileIntro}>Aqui estão os advogados mais próximos da sua localização</Text>
              <View style={styles.identityHeader}>
                <View style={styles.avatarFrame}>
                  {avatarUrl ? (
                    <Image accessibilityIgnoresInvertColors source={{ uri: avatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarInitial}>{profile.name.slice(0, 1).toUpperCase()}</Text>
                  )}
                  <View style={styles.verifiedBadge}>
                    <AppIcon color={colors.surfaceDeep} name="checkmark" size={14} />
                  </View>
                </View>
                <View style={styles.verifiedStack}>
                  <AppIcon color={colors.gold} name="star" size={18} />
                  <Text style={styles.verifiedText}>Verificado</Text>
                </View>
              </View>

              <View style={styles.identityRow}>
                <View style={styles.identityText}>
                  <Text style={styles.name}>{profile.name}</Text>
                  <Text style={styles.oab}>
                    OAB/{profile.oabState} {profile.oabNumber}
                  </Text>
                </View>
              </View>

              {distance || place ? (
                <View style={styles.locationRow}>
                  <AppIcon color={colors.textMuted} name="location-outline" size={17} />
                  <Text style={styles.panelText}>{[distance, place].filter(Boolean).join(" - ")}</Text>
                </View>
              ) : null}

              <View style={styles.chipRow}>
                {profile.areas.slice(0, 3).map((area) => (
                  <View key={area.id} style={styles.specialtyChip}>
                    <Text style={styles.specialtyText}>{area.name.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile.yearsExperience ? `${profile.yearsExperience}+` : "--"}</Text>
                <Text style={styles.statLabel}>Anos Exp.</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile.verified ? "Sim" : "--"}</Text>
                <Text style={styles.statLabel}>Verificado</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{whatsapp ? "Sim" : "--"}</Text>
                <Text style={styles.statLabel}>WhatsApp</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre o Profissional</Text>
              <Text style={styles.bioText}>
                {profile.fullBio ?? profile.miniBio ?? "Este profissional ainda não publicou uma bio completa."}
              </Text>
            </View>

            {socialLinks.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Redes sociais</Text>
                <View style={styles.socialRow}>
                  {socialLinks.map((link) => (
                    <TouchableOpacity
                      accessibilityLabel={`Abrir ${link.label}`}
                      accessibilityRole="link"
                      key={link.key}
                      onPress={() => Linking.openURL(link.url)}
                      style={styles.socialButton}
                    >
                      <AppIcon color={colors.gold} name={link.icon} size={22} />
                      <Text style={styles.socialLabel}>{link.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Áreas de Atuação</Text>
              <View style={styles.areaList}>
                {profile.areas.map((area) => (
                  <View key={area.id} style={styles.areaCard}>
                    <View style={styles.areaIcon}>
                      <AppIcon color={colors.gold} name={getAreaIcon(area.name)} size={22} />
                    </View>
                    <View style={styles.areaTextBlock}>
                      <Text style={styles.areaTitle}>{area.name}</Text>
                      <Text style={styles.panelText}>Atendimento profissional por canal externo seguro.</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}

        <LegalLinks />
      </ScrollView>

      {status === "ready" && profile ? (
        <View style={styles.footerBar}>
          {whatsapp ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ disabled: openingWhatsapp }}
              onPress={handleWhatsappPress}
              style={[styles.whatsButton, openingWhatsapp && styles.whatsButtonDisabled]}
            >
              <AppIcon color={colors.surfaceDeep} name="logo-whatsapp" size={22} />
              <Text style={styles.whatsButtonText}>{openingWhatsapp ? "Abrindo WhatsApp" : "WhatsApp VIP"}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.unavailableContact}>
              <Text style={styles.panelText}>WhatsApp indisponível para este profissional.</Text>
            </View>
          )}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { gap: spacing.lg, paddingBottom: 124 },
  topControls: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    left: 20,
    position: "absolute",
    right: 20,
    top: 16,
    zIndex: 10
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(11,22,40,0.78)",
    borderColor: colors.borderSubtle,
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  topRightControls: { flexDirection: "row", gap: spacing.sm },
  passiveIcon: {
    alignItems: "center",
    backgroundColor: "rgba(11,22,40,0.78)",
    borderColor: colors.borderSubtle,
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  hero: {
    backgroundColor: colors.surfaceDeep,
    height: 230,
    overflow: "hidden",
    position: "relative"
  },
  coverImage: { height: "100%", width: "100%" },
  coverFallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceDeep,
    flex: 1,
    justifyContent: "center"
  },
  heroScrim: {
    backgroundColor: "rgba(7,20,38,0.42)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  statePanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    margin: 20,
    padding: spacing.lg
  },
  identitySection: {
    backgroundColor: "rgba(11,22,40,0.96)",
    borderColor: colors.borderSubtle,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.md,
    marginHorizontal: 20,
    marginTop: -32,
    padding: spacing.md
  },
  profileIntro: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 23
  },
  identityHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  avatarFrame: {
    alignItems: "center",
    backgroundColor: colors.surfaceDeep,
    borderColor: colors.gold,
    borderRadius: 18,
    borderWidth: 4,
    height: 104,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    width: 104
  },
  avatarImage: { borderRadius: 12, height: "100%", width: "100%" },
  avatarInitial: { color: colors.gold, fontSize: 42, fontWeight: "900" },
  verifiedBadge: {
    alignItems: "center",
    backgroundColor: colors.gold,
    borderColor: colors.background,
    borderRadius: 999,
    borderWidth: 2,
    bottom: 2,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: 2,
    width: 28
  },
  identityRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  identityText: { flex: 1, gap: spacing.xs },
  name: { color: colors.textPrimary, fontSize: 28, fontWeight: "800", lineHeight: 36 },
  oab: { color: colors.gold, fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  verifiedStack: { alignItems: "flex-end", gap: 2 },
  verifiedText: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  locationRow: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  specialtyChip: {
    backgroundColor: "rgba(217,154,45,0.1)",
    borderColor: "rgba(217,154,45,0.28)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  specialtyText: { color: colors.gold, fontSize: 12, fontWeight: "900" },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: 20
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "rgba(11,22,40,0.78)",
    borderColor: colors.borderSubtle,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minHeight: 82,
    justifyContent: "center",
    padding: spacing.sm
  },
  statValue: { color: colors.gold, fontSize: 22, fontWeight: "900" },
  statLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "700", textAlign: "center" },
  section: { gap: spacing.md, paddingHorizontal: 20 },
  sectionTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  bioText: { color: colors.textPrimary, fontSize: 16, lineHeight: 26 },
  panelText: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  socialRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  socialButton: {
    alignItems: "center",
    backgroundColor: "rgba(217,154,45,0.1)",
    borderColor: "rgba(217,154,45,0.28)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 46,
    paddingHorizontal: spacing.md
  },
  socialLabel: { color: colors.textPrimary, fontSize: 13, fontWeight: "800" },
  areaList: { gap: spacing.md },
  areaCard: {
    alignItems: "center",
    backgroundColor: "rgba(11,22,40,0.78)",
    borderColor: colors.borderSubtle,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md
  },
  areaIcon: {
    alignItems: "center",
    backgroundColor: "rgba(217,154,45,0.1)",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  areaTextBlock: { flex: 1, gap: spacing.xs },
  areaTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
  footerBar: {
    backgroundColor: "rgba(7,20,38,0.96)",
    bottom: 0,
    left: 0,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    position: "absolute",
    right: 0
  },
  whatsButton: {
    alignItems: "center",
    backgroundColor: colors.success,
    borderRadius: 14,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 58,
    justifyContent: "center"
  },
  whatsButtonDisabled: { opacity: 0.72 },
  whatsButtonText: { color: colors.surfaceDeep, fontSize: 16, fontWeight: "900" },
  unavailableContact: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 58,
    justifyContent: "center"
  },
  legalLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: spacing.sm
  },
  legalText: { color: colors.textMuted, fontSize: 13, textDecorationLine: "underline" }
});
