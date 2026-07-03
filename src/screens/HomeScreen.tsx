import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { AppIcon, type AppIconName } from "../components/AppIcon";
import Svg, { Line } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { appCopy } from "../config/contracts";
import { ApiClientError, createApiClient } from "../services/apiClient";
import { createAreasService, type LegalArea } from "../services/areasService";
import { createAuthService } from "../services/authService";
import { createClientSignupService } from "../services/clientSignupService";
import { createLawyerDashboardService, type LawyerDashboardResponse } from "../services/lawyerDashboardService";
import { createLawyerProfileService, type PublicLawyerProfile } from "../services/lawyerProfileService";
import { createGeographyService, type PublicCity, type PublicState } from "../services/geographyService";
import { requestDeviceLocation } from "../services/locationService";
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
type LawyerTab = "home" | "prayer" | "profile";
type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const normalizeSearchText = (value: string) =>
  value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const logo = require("../../assets/logo-gold.png");
const mascot = require("../../assets/mascot-lawyer.png");
const prayerArt = require("../../assets/prayer-bible-cross.png");
const legalUrls = {
  privacy: "https://meuadvogado2026.github.io/meu-advogado-legal/privacidade.html",
  terms: "https://meuadvogado2026.github.io/meu-advogado-legal/termos.html",
  deletion: "https://meuadvogado2026.github.io/meu-advogado-legal/exclusao-de-dados.html"
};
const URGENT_LAWYER_WHATSAPP = "5561993574056";
const URGENT_LAWYER_MESSAGE = "Preciso de advogado urgente. Vim pelo Advogado 2.0 e preciso falar com um advogado agora.";
const SPECIALTY_HELP_MESSAGE = "Olá. Estou no Advogado 2.0 e tenho dúvida em qual área escolher.";
const SPECIALTY_CARD_SIZE = 76;
const SPECIALTY_CENTER_SIZE = 124;
const SPECIALTY_ORBIT_GAP = 10;
const SPECIALTY_STAGE_WIDTH = SPECIALTY_CARD_SIZE * 2 + SPECIALTY_CENTER_SIZE + SPECIALTY_ORBIT_GAP * 2;
const SPECIALTY_STAGE_HEIGHT = SPECIALTY_CARD_SIZE * 2 + SPECIALTY_CENTER_SIZE + SPECIALTY_ORBIT_GAP * 2;
const SPECIALTY_ICON_SIZE = 36;
const SPECIALTY_HELP_BUTTON_SIZE = 30;
const SPECIALTY_HELP_ICON_SIZE = 18;
const SPECIALTY_AREA_COLOR = "#FFD34D";
const SPECIALTY_AREA_RGB = "255,211,77";
const SPECIALTY_LINE_COLOR = "rgba(255,211,77,0.22)";

type AreaVisual = {
  backgroundColor: string;
  borderColor: string;
  iconBackgroundColor: string;
  iconBorderColor: string;
  inactiveColor: string;
  textColor: string;
  accentColor: string;
  color: string;
  glowColor: string;
  icon: AppIconName;
  selectedBorderColor: string;
  selectedBackgroundColor: string;
  selectedIconColor: string;
  selectedTextColor: string;
};

function hasReliableDistance(match: MatchResponse | null): boolean {
  return Boolean(match && match.distanceReliable !== false && typeof match.distanceKm === "number");
}

function describeMatch(match: MatchResponse | null): string {
  if (!match) {
    return "Selecione uma área, permita a localização e toque em Buscar match.";
  }
  if (match.status === "empty" || !match.lawyer) {
    return "Nenhum advogado próximo encontrado para esta área. Tente outra área ou tente novamente.";
  }
  const place = match.lawyer.city
    ? ` em ${match.lawyer.city}${match.lawyer.state ? "/" + match.lawyer.state : ""}`
    : "";
  if (!hasReliableDistance(match)) {
    return match.distanceNotice ?? `Advogado mais próximo${place}. Localização do advogado em confirmação.`;
  }
  const distance = ` a ${match.distanceKm!.toFixed(1)} km de você`;
  return `Advogado mais próximo${place}${distance}.`;
}

function openWhatsApp(rawNumber: string, message?: string) {
  const digits = rawNumber.replace(/\D/g, "");
  const intl = digits.startsWith("55") ? digits : `55${digits}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return Linking.openURL(`https://wa.me/${intl}${text}`);
}

function showSpecialtyHelp() {
  Alert.alert(
    "Dúvida na área?",
    "Se você tiver dúvida em qual área escolher, toque em Falar no WhatsApp para conversar com o canal de atendimento.",
    [
      { text: "Agora não", style: "cancel" },
      {
        text: "Falar no WhatsApp",
        onPress: () => openWhatsApp(URGENT_LAWYER_WHATSAPP, SPECIALTY_HELP_MESSAGE)
      }
    ]
  );
}

function getFriendlyError(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 404) {
      return "Cadastro ainda indisponível nesta versão do backend.";
    }
    if (error.status === 422) {
      return "Revise os dados enviados e tente novamente.";
    }
  }
  if (error instanceof Error) {
    if (error.message === "SUPABASE_AUTH_PUBLICO_AUSENTE") {
      return "Configure a anon key pública do Supabase para entrar.";
    }
    return error.message;
  }
  return "Não foi possível concluir a ação.";
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

function AccountDeletionRequest() {
  return (
    <View style={styles.accountDeletionBox}>
      <View style={styles.accountDeletionHeader}>
        <AppIcon color={colors.goldBright} name="document-text-outline" size={20} />
        <Text style={styles.accountDeletionTitle}>Exclusao de conta e dados</Text>
      </View>
      <Text style={styles.panelText}>
        Solicite a exclusao da sua conta e dos dados associados pelo recurso oficial publicado.
      </Text>
      <TouchableOpacity
        accessibilityLabel="Solicitar exclusao de conta e dados"
        accessibilityRole="link"
        onPress={() => Linking.openURL(legalUrls.deletion)}
        style={styles.accountDeletionButton}
      >
        <Text style={styles.secondaryButtonText}>Solicitar exclusao</Text>
      </TouchableOpacity>
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
  items: Array<{ label: string; tab: TTab; icon: AppIconName }>;
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
              <AppIcon color={selected ? colors.surfaceDeep : colors.goldBright} name={item.icon} size={22} />
            </View>
            <Text style={[styles.bottomNavText, selected && styles.bottomNavTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const clientNavItems: Array<{ label: string; tab: ClientTab; icon: AppIconName }> = [
  { label: "Home", tab: "home", icon: "home-outline" },
  { label: "Perfil", tab: "profile", icon: "person-outline" }
];

const lawyerNavItems: Array<{ label: string; tab: LawyerTab; icon: AppIconName }> = [
  { label: "Home", tab: "home", icon: "home-outline" },
  { label: "Oração", tab: "prayer", icon: "heart-outline" },
  { label: "Perfil", tab: "profile", icon: "person-outline" }
];

function StatusBox({ status, message }: { status: ViewStatus; message: string }) {
  if (status === "idle" && !message) {
    return null;
  }

  return (
    <View style={[styles.statusBox, status === "error" && styles.statusBoxError]}>
      {status === "loading" && <ActivityIndicator color={colors.gold} />}
      <Text style={styles.statusText}>{message}</Text>
    </View>
  );
}

function OrbitConnectors() {
  const inset = (SPECIALTY_STAGE_WIDTH - (SPECIALTY_CARD_SIZE * 3 + SPECIALTY_ORBIT_GAP * 2)) / 2;
  const center = SPECIALTY_STAGE_WIDTH / 2;
  const cardMid = SPECIALTY_CARD_SIZE / 2;
  const topY = cardMid;
  const middleY = SPECIALTY_CARD_SIZE + SPECIALTY_ORBIT_GAP + SPECIALTY_CENTER_SIZE / 2;
  const bottomY = SPECIALTY_STAGE_HEIGHT - cardMid;
  const topLeftX = inset + cardMid;
  const topRightX = SPECIALTY_STAGE_WIDTH - inset - cardMid;
  const sideLeftX = cardMid;
  const sideRightX = SPECIALTY_STAGE_WIDTH - cardMid;

  return (
    <Svg
      accessibilityElementsHidden
      focusable={false}
      height={SPECIALTY_STAGE_HEIGHT}
      importantForAccessibility="no"
      pointerEvents="none"
      style={styles.orbitConnectorLayer}
      viewBox={`0 0 ${SPECIALTY_STAGE_WIDTH} ${SPECIALTY_STAGE_HEIGHT}`}
      width={SPECIALTY_STAGE_WIDTH}
    >
      <Line x1={center} y1={middleY} x2={topLeftX} y2={topY} stroke={SPECIALTY_LINE_COLOR} strokeLinecap="round" strokeWidth={1.2} opacity={0.9} />
      <Line x1={center} y1={middleY} x2={center} y2={topY} stroke={SPECIALTY_LINE_COLOR} strokeLinecap="round" strokeWidth={1.2} opacity={0.9} />
      <Line x1={center} y1={middleY} x2={topRightX} y2={topY} stroke={SPECIALTY_LINE_COLOR} strokeLinecap="round" strokeWidth={1.2} opacity={0.9} />
      <Line x1={center} y1={middleY} x2={sideLeftX} y2={middleY} stroke={SPECIALTY_LINE_COLOR} strokeLinecap="round" strokeWidth={1.2} opacity={0.9} />
      <Line x1={center} y1={middleY} x2={sideRightX} y2={middleY} stroke={SPECIALTY_LINE_COLOR} strokeLinecap="round" strokeWidth={1.2} opacity={0.9} />
      <Line x1={center} y1={middleY} x2={topLeftX} y2={bottomY} stroke={SPECIALTY_LINE_COLOR} strokeLinecap="round" strokeWidth={1.2} opacity={0.9} />
      <Line x1={center} y1={middleY} x2={center} y2={bottomY} stroke={SPECIALTY_LINE_COLOR} strokeLinecap="round" strokeWidth={1.2} opacity={0.9} />
      <Line x1={center} y1={middleY} x2={topRightX} y2={bottomY} stroke={SPECIALTY_LINE_COLOR} strokeLinecap="round" strokeWidth={1.2} opacity={0.9} />
    </Svg>
  );
}

function SpecialtyMatchOrbit({
  areas,
  selectedAreaIds,
  onToggle,
  onHelp
}: {
  areas: LegalArea[];
  selectedAreaIds: string[];
  onToggle: (areaId: string) => void;
  onHelp: () => void;
}) {
  if (areas.length === 0) {
    return null;
  }

  const featuredAreas = areas.slice(0, 8);
  const topAreas = featuredAreas.slice(0, 3);
  const sideAreas = featuredAreas.slice(3, 5);
  const bottomAreas = featuredAreas.slice(5, 8);
  const renderSpecialty = (area: LegalArea) => {
    const selected = selectedAreaIds.includes(area.id);
    const visual = getAreaVisual(area.name);
    return (
      <TouchableOpacity
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        key={area.id}
        onPress={() => onToggle(area.id)}
        style={[
          styles.orbitSpecialty,
          selected && styles.orbitSpecialtySelected,
          {
            backgroundColor: selected ? visual.selectedBackgroundColor : visual.backgroundColor,
            borderColor: selected ? visual.selectedBorderColor : visual.borderColor,
            shadowColor: visual.color
          }
        ]}
      >
        {selected ? (
          <View style={styles.orbitSelectedCheck}>
            <AppIcon color={visual.color} name="checkmark-outline" size={12} />
          </View>
        ) : null}
        <View
          style={[
            styles.orbitIconBadge,
            selected && styles.orbitIconBadgeSelected,
            {
              backgroundColor: selected ? visual.color : visual.iconBackgroundColor,
              borderColor: selected ? visual.color : visual.iconBorderColor,
              shadowColor: visual.color
            }
          ]}
        >
          <View style={[styles.orbitIconGlow, { backgroundColor: selected ? "rgba(7,20,38,0.22)" : visual.glowColor }]} />
          <AppIcon color={selected ? visual.selectedIconColor : visual.inactiveColor} name={visual.icon} size={23} />
          <View
            style={[
              styles.orbitIconAccent,
              {
                backgroundColor: selected ? colors.surfaceDeep : visual.accentColor,
                borderColor: selected ? visual.color : "#071931"
              }
            ]}
          />
        </View>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={2}
          style={[
            styles.orbitSpecialtyText,
            selected && styles.orbitSpecialtyTextSelected,
            { color: selected ? visual.selectedTextColor : visual.textColor }
          ]}
        >
          {getAreaLabel(area.name)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.orbitPanel}>
      <View style={styles.orbitStage}>
        <OrbitConnectors />
        <View style={styles.orbitTopRow}>{topAreas.map(renderSpecialty)}</View>
        <View style={styles.orbitMiddleRow}>
          <View style={styles.orbitSideColumn}>{sideAreas.slice(0, 1).map(renderSpecialty)}</View>
          <View style={styles.orbitMascotCenter}>
            <View style={styles.mascotHaloOuter} />
            <View style={styles.mascotHaloInner} />
            <Image accessibilityIgnoresInvertColors source={mascot} style={styles.mascotImage} />
            <View style={styles.orbitHelpAnchor}>
              <TouchableOpacity
                accessible
                accessibilityHint="Abre o WhatsApp para orientar a escolha da especialidade"
                accessibilityLabel="Tem dúvidas na escolha da área? Clique aqui"
                accessibilityRole="button"
                onPress={onHelp}
                style={styles.mascotHelpTouchTarget}
              >
                <View style={styles.mascotHelpButton}>
                  <AppIcon color={colors.surfaceDeep} name="help-circle-outline" size={SPECIALTY_HELP_ICON_SIZE} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.orbitSideColumn}>{sideAreas.slice(1, 2).map(renderSpecialty)}</View>
        </View>
        <View style={styles.orbitBottomRow}>{bottomAreas.map(renderSpecialty)}</View>
      </View>
    </View>
  );
}

function areaVisual(icon: AppIconName, color: string, rgb: string): AreaVisual {
  return {
    backgroundColor: `rgba(${rgb},0.08)`,
    borderColor: `rgba(${rgb},0.24)`,
    iconBackgroundColor: `rgba(${rgb},0.22)`,
    iconBorderColor: `rgba(${rgb},0.36)`,
    inactiveColor: `rgba(${rgb},0.62)`,
    textColor: `rgba(${rgb},0.72)`,
    accentColor: `rgba(${rgb},0.5)`,
    color,
    glowColor: `rgba(${rgb},0.12)`,
    icon,
    selectedBorderColor: "rgba(255,246,201,0.98)",
    selectedBackgroundColor: color,
    selectedIconColor: colors.surfaceDeep,
    selectedTextColor: colors.surfaceDeep
  };
}

function specialtyAreaVisual(icon: AppIconName): AreaVisual {
  return areaVisual(icon, SPECIALTY_AREA_COLOR, SPECIALTY_AREA_RGB);
}

function getAreaVisual(areaName: string): AreaVisual {
  const normalized = normalizeSearchText(areaName);
  if (normalized.includes("trabalh")) return specialtyAreaVisual("briefcase-outline");
  if (normalized.includes("famil")) return specialtyAreaVisual("people-outline");
  if (normalized.includes("consum")) return specialtyAreaVisual("cart-outline");
  if (normalized.includes("imob")) return specialtyAreaVisual("business-outline");
  if (normalized.includes("empres")) return specialtyAreaVisual("business-outline");
  if (normalized.includes("tribut")) return specialtyAreaVisual("receipt-outline");
  if (normalized.includes("criminal")) return specialtyAreaVisual("shield-checkmark-outline");
  if (normalized.includes("previd")) return specialtyAreaVisual("ribbon-outline");
  if (normalized.includes("civil") || normalized.includes("civel")) return specialtyAreaVisual("scale-outline");
  return specialtyAreaVisual("library-outline");
}

function getAreaLabel(areaName: string): string {
  const label = areaName.replace(/^direito\s+(de|da|do|das|dos)?\s*/i, "").trim();
  const normalized = normalizeSearchText(label);
  if (normalized.includes("famil")) return "Família";
  if (normalized.includes("previdenci")) return "Previdência";
  if (normalized.includes("tribut")) return "Tributário";
  return label;
}

function safeImageUrl(url?: string | null) {
  return typeof url === "string" && url.startsWith("https://") ? url : null;
}

function UrgentLawyerButton() {
  return (
    <TouchableOpacity
      accessibilityLabel="Advogado urgente pelo WhatsApp"
      accessibilityRole="button"
      onPress={() => openWhatsApp(URGENT_LAWYER_WHATSAPP, URGENT_LAWYER_MESSAGE)}
      style={styles.urgentButton}
    >
      <View style={styles.urgentIconBadge}>
        <AppIcon color={colors.textPrimary} name="warning-outline" size={19} />
      </View>
      <View style={styles.urgentTextBlock}>
        <Text style={styles.urgentTitle}>Advogado urgente</Text>
        <Text style={styles.urgentSubtitle}>Liminar urgente, familiar preso, medida protetiva ou bloqueio judicial.</Text>
      </View>
      <AppIcon color={colors.textPrimary} name="logo-whatsapp" size={19} />
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
        <Text style={styles.cardLabel}>Pedido de oração</Text>
        <Text style={styles.prayerTitle}>Aqui você encontra conforto</Text>
        <Text style={styles.prayerText}>
          Envie um pedido breve para receber apoio em oração. Não inclua senha, documento, endereço completo,
          telefone ou detalhes jurídicos sensíveis.
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
          <AppIcon color={colors.gold} name={anonymous ? "checkbox-outline" : "square-outline"} size={22} />
          <Text style={styles.prayerText}>Enviar como anônimo</Text>
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
          <AppIcon color={colors.surfaceDeep} name="heart-outline" size={18} />
          <Text style={styles.primaryButtonText}>Enviar pedido</Text>
        </TouchableOpacity>
        {receipt ? (
          <View style={styles.noticeRow}>
            <AppIcon color={colors.gold} name="checkmark-circle-outline" size={20} />
            <Text style={styles.prayerText}>Pedido recebido com segurança.</Text>
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

function LawyerInsightCard({
  icon,
  label,
  value,
  helper,
  accent = colors.gold
}: {
  icon: AppIconName;
  label: string;
  value: number | string;
  helper?: string;
  accent?: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={styles.metricIconBadge}>
          <AppIcon color={accent} name={icon} size={20} />
        </View>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {helper ? <Text style={styles.metricHelper}>{helper}</Text> : null}
    </View>
  );
}

function LawyerVipCard({ dashboard }: { dashboard: LawyerDashboardResponse | null }) {
  const name = dashboard?.lawyer.name ?? "Membro Exclusivo";
  const oab = dashboard?.lawyer.oabNumber
    ? `${dashboard.lawyer.oabNumber}/${dashboard.lawyer.oabState}`
    : "Verificado";
  const benefits = dashboard?.benefits ?? [];

  return (
    <View style={styles.benefitsPanel}>
      <View style={styles.vipPhysicalCard}>
        <View style={styles.vipTopRow}>
          <View>
            <Text style={styles.vipKicker}>ADVOGADO 2.0 VIP</Text>
            <Text style={styles.vipSubKicker}>BENEFITS CLUB MEMBER</Text>
          </View>
          <AppIcon color={colors.gold} name="ribbon-outline" size={28} />
        </View>
        <View style={styles.vipMiddleRow}>
          <View style={styles.vipChip}>
            <View style={styles.vipChipLineHorizontal} />
            <View style={styles.vipChipLineVertical} />
          </View>
          <View style={styles.vipSeal}>
            <Text style={styles.vipSealText}>V</Text>
          </View>
        </View>
        <View style={styles.vipBottomRow}>
          <View style={styles.vipIdentity}>
            <Text numberOfLines={1} style={styles.vipName}>{name}</Text>
            <View style={styles.vipMetaRow}>
              <View style={styles.vipMetaBlock}>
                <Text style={styles.vipMetaLabel}>MEMBRO DESDE</Text>
                <Text style={styles.vipMetaValue}>2026</Text>
              </View>
              <View style={styles.vipMetaBlock}>
                <Text style={styles.vipMetaLabel}>OAB</Text>
                <Text numberOfLines={1} style={styles.vipMetaValue}>{oab}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Benefícios</Text>
        {benefits.length === 0 ? (
          <Text style={styles.panelText}>Nenhum benefício ativo no momento.</Text>
        ) : (
          <View style={styles.benefitCards}>
            {benefits.map((benefit) => (
              <View key={benefit.id} style={styles.benefitCard}>
                <View style={styles.benefitHeader}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  {benefit.badge ? <Text style={styles.benefitBadge}>{benefit.badge}</Text> : null}
                </View>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
                {benefit.redemptionUrl ? (
                  <TouchableOpacity
                    accessibilityLabel={`Abrir resgate do beneficio ${benefit.title}`}
                    accessibilityRole="link"
                    onPress={() => benefit.redemptionUrl && Linking.openURL(benefit.redemptionUrl)}
                    style={styles.benefitLink}
                  >
                    <Text style={styles.secondaryButtonText}>Acessar resgate</Text>
                    <AppIcon color={colors.goldBright} name="globe-outline" size={16} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function LawyerReadonlyProfile({
  dashboard,
  profile,
  onSignOut
}: {
  dashboard: LawyerDashboardResponse | null;
  profile: PublicLawyerProfile | null;
  onSignOut: () => void;
}) {
  const name = profile?.name ?? dashboard?.lawyer.name ?? "Advogado 2.0";
  const avatarUrl = safeImageUrl(profile?.avatarUrl ?? dashboard?.lawyer.avatarUrl);
  const coverUrl = safeImageUrl(profile?.coverUrl ?? dashboard?.lawyer.coverUrl);
  const initial = name.slice(0, 1).toUpperCase();
  const areas = profile?.areas ?? [];
  const place = [profile?.city, profile?.state].filter(Boolean).join(", ");

  return (
    <>
      <View style={styles.readonlyProfile}>
        <View style={styles.readonlyCover}>
          {coverUrl ? (
            <Image accessibilityIgnoresInvertColors source={{ uri: coverUrl }} style={styles.readonlyCoverImage} />
          ) : (
            <AppIcon color={colors.gold} name="business-outline" size={46} />
          )}
        </View>
        <View style={styles.readonlyIdentity}>
          <View style={styles.readonlyAvatar}>
            {avatarUrl ? (
              <Image accessibilityIgnoresInvertColors source={{ uri: avatarUrl }} style={styles.readonlyAvatarImage} />
            ) : (
              <Text style={styles.avatarInitial}>{initial}</Text>
            )}
          </View>
          <View style={styles.readonlyNameBlock}>
            <Text style={styles.cardTitle}>{name}</Text>
            <Text style={styles.oabBadgeText}>
              OAB {profile?.oabNumber ?? dashboard?.lawyer.oabNumber ?? "--"}/
              {profile?.oabState ?? dashboard?.lawyer.oabState ?? "--"}
            </Text>
          </View>
        </View>
        {place ? (
          <View style={styles.matchMetaRow}>
            <AppIcon color={colors.textMuted} name="location-outline" size={17} />
            <Text style={styles.matchMeta}>{place}</Text>
          </View>
        ) : null}
        <Text style={styles.panelText}>
          {profile?.fullBio ?? profile?.miniBio ?? "Bio profissional ainda não disponível para visualização."}
        </Text>
        {areas.length > 0 ? (
          <View style={styles.chipRow}>
            {areas.map((area) => (
              <View key={area.id} style={styles.specialtyChip}>
                <Text style={styles.specialtyText}>{area.name.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.accountPanel}>
        <Text style={styles.panelTitle}>Conta</Text>
        <Text style={styles.panelText}>Perfil somente leitura. Edições são feitas pelo administrador.</Text>
        <AccountDeletionRequest />
        <LegalLinks />
        <TouchableOpacity style={styles.signOutButton} accessibilityRole="button" onPress={onSignOut}>
          <AppIcon color={colors.gold} name="log-out-outline" size={18} />
          <Text style={styles.secondaryButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

export function HomeScreen({ navigation }: Props) {
  const [clientTab, setClientTab] = useState<ClientTab>("home");
  const [lawyerTab, setLawyerTab] = useState<LawyerTab>("home");
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [signupName, setSignupName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [areas, setAreas] = useState<LegalArea[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [match, setMatch] = useState<MatchResponse | null>(null);
  const [states, setStates] = useState<PublicState[]>([]);
  const [cities, setCities] = useState<PublicCity[]>([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [isStatePickerOpen, setIsStatePickerOpen] = useState(false);
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [lawyerDashboard, setLawyerDashboard] = useState<LawyerDashboardResponse | null>(null);
  const [lawyerProfile, setLawyerProfile] = useState<PublicLawyerProfile | null>(null);
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
  const geographies = useMemo(() => createGeographyService(apiClient), [apiClient]);
  const me = useMemo(() => createMeService(apiClient), [apiClient]);
  const lawyerDashboards = useMemo(() => createLawyerDashboardService(apiClient), [apiClient]);
  const lawyerProfiles = useMemo(() => createLawyerProfileService(apiClient), [apiClient]);
  const prayerRequests = useMemo(() => createPrayerRequestService(apiClient), [apiClient]);
  const partnerLogos = useMemo(() => createPartnerLogoService(apiClient), [apiClient]);
  const clientDisplayName = currentUser?.name?.trim() || currentUser?.email?.split("@")[0] || "cliente";
  const lawyerDisplayName =
    lawyerDashboard?.lawyer.name?.trim() || currentUser?.name?.trim() || currentUser?.email?.split("@")[0] || "advogado";
  const selectedState = states.find((item) => item.id === selectedStateId);
  const selectedCity = cities.find((item) => item.id === selectedCityId);
  const filteredStates = useMemo(() => {
    const term = normalizeSearchText(stateSearch);
    if (!term) return states;
    return states.filter((state) => normalizeSearchText(`${state.code} ${state.name}`).includes(term));
  }, [stateSearch, states]);
  const filteredCities = useMemo(() => {
    const term = normalizeSearchText(citySearch);
    if (!term) return cities;
    return cities.filter((city) => normalizeSearchText(city.name).includes(term));
  }, [citySearch, cities]);

  async function hydrateUser(restoredSession: Session) {
    const response = await me.getCurrentUser();
    setCurrentUser(response.user);
    setSession(restoredSession);
    setMessage(response.user.mustChangePassword ? "Troque sua senha para liberar o painel." : "");
  }

  useEffect(() => {
    let mounted = true;
    authService
      .getSession()
      .then(async (restoredSession) => {
        if (!mounted) return;
        if (!restoredSession) {
          setStatus("idle");
          setMessage("Informe suas credenciais cadastradas.");
          return;
        }
        await hydrateUser(restoredSession);
        setStatus("idle");
      })
      .catch(() => {
        if (!mounted) return;
        setStatus("idle");
        setMessage("Informe suas credenciais cadastradas.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session || currentUser?.mustChangePassword || (currentUser?.role !== "client" && currentUser?.role !== "lawyer")) {
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
        if (!active) return;
        setStatus("error");
        setMessage("Não foi possível carregar as áreas jurídicas.");
      });

    return () => {
      active = false;
    };
  }, [session, currentUser, legalAreas]);

  useEffect(() => {
    if (!session || currentUser?.role !== "client") {
      setStates([]);
      setCities([]);
      setSelectedStateId("");
      setSelectedCityId("");
      return;
    }
    let active = true;
    geographies.listStates()
      .then((response) => {
        if (!active) return;
        setStates(response.states);
        setSelectedStateId((current) => (response.states.some((state) => state.id === current) ? current : ""));
      })
      .catch(() => {
        if (!active) return;
        setStates([]);
        setSelectedStateId("");
      });
    return () => { active = false; };
  }, [session, currentUser, geographies]);

  useEffect(() => {
    if (!session || currentUser?.role !== "client" || !selectedStateId) {
      setCities([]);
      setSelectedCityId("");
      return;
    }
    let active = true;
    geographies.listCities(selectedStateId)
      .then((response) => {
        if (!active) return;
        setCities(response.cities);
        setSelectedCityId((current) => (response.cities.some((city) => city.id === current) ? current : ""));
      })
      .catch(() => {
        if (!active) return;
        setCities([]);
        setSelectedCityId("");
        setStatus("error");
        setMessage("Nao foi possivel carregar as cidades deste estado.");
      });
    return () => { active = false; };
  }, [session, currentUser, geographies, selectedStateId]);

  useEffect(() => {
    if (!session || currentUser?.role !== "lawyer") {
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
    if (!session || currentUser?.mustChangePassword || currentUser?.role !== "lawyer") {
      return;
    }

    let active = true;
    lawyerDashboards
      .getDashboard()
      .then(async (response) => {
        if (!active) return;
        setLawyerDashboard(response);
        try {
          const profileResponse = await lawyerProfiles.getById(response.lawyer.id);
          if (active) setLawyerProfile(profileResponse.lawyer);
        } catch {
          if (active) setLawyerProfile(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setLawyerDashboard(null);
        setLawyerProfile(null);
      });

    return () => {
      active = false;
    };
  }, [session, currentUser, lawyerDashboards, lawyerProfiles]);

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
    setMessage("Criando usuário cliente com segurança.");
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
      setMessage("Usuário criado e sessão iniciada.");
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
    setMatch(null);
    setStates([]);
    setCities([]);
    setSelectedStateId("");
    setSelectedCityId("");
    setIsStatePickerOpen(false);
    setIsCityPickerOpen(false);
    setStateSearch("");
    setCitySearch("");
    setLawyerDashboard(null);
    setLawyerProfile(null);
    setPartners([]);
    setNewPassword("");
    setNewPasswordConfirm("");
    setClientTab("home");
    setLawyerTab("home");
    setMessage("Sessão encerrada.");
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Use uma senha com pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setStatus("error");
      setMessage("As senhas não conferem.");
      return;
    }

    setStatus("loading");
    setMessage("Atualizando senha com segurança.");
    try {
      const response = await me.changePassword(newPassword);
      setCurrentUser(response.user);
      setNewPassword("");
      setNewPasswordConfirm("");
      setStatus("idle");
      setMessage("Senha atualizada. Painel liberado.");
    } catch (error) {
      setStatus("error");
      setMessage(getFriendlyError(error));
    }
  }

  async function handleMatch() {
    if (selectedAreaIds.length === 0) {
      setStatus("error");
      setMessage("Selecione pelo menos uma área jurídica antes de buscar.");
      return;
    }

    setStatus("loading");
    setMessage("Obtendo sua localização atual para a busca.");
    const result = await requestDeviceLocation();
    if (result.status === "denied") {
      setStatus("error");
      setMessage("Localização negada. Permita o acesso para encontrar um advogado próximo.");
      return;
    }
    if (result.status === "unavailable") {
      setStatus("error");
      setMessage("Não foi possível obter sua localização atual. Tente novamente.");
      return;
    }

    setStatus("loading");
    setMessage("Consultando match no backend.");
    try {
      const response = await matches.requestMatch({
        lat: result.location.lat,
        lng: result.location.lng,
        accuracyM: result.location.accuracyM,
        areaIds: selectedAreaIds
      });
      setMatch(response);
      setStatus("idle");
      if (response.lawyer) {
        setMessage("Advogado encontrado. Abrindo perfil.");
        navigation.navigate("LawyerProfile", {
          lawyerId: response.lawyer.id,
          distanceKm: hasReliableDistance(response) ? response.distanceKm : undefined
        });
        return;
      }
      setMessage("Ainda não há advogado compatível para esta área.");
    } catch (error) {
      setStatus("error");
      setMessage(getFriendlyError(error));
    }
  }

  function handleSelectState(stateId: string) {
    setSelectedStateId(stateId);
    setSelectedCityId("");
    setCities([]);
    setIsStatePickerOpen(false);
    setIsCityPickerOpen(false);
    setStateSearch("");
    setCitySearch("");
  }

  function handleCityMatch() {
    if (selectedAreaIds.length === 0) {
      setStatus("error");
      setMessage("Selecione pelo menos uma area juridica antes de buscar.");
      return;
    }
    if (!selectedStateId || !selectedCityId) {
      setStatus("error");
      setMessage("Selecione estado e cidade antes de buscar.");
      return;
    }
    const city = cities.find((item) => item.id === selectedCityId);
    navigation.navigate("LawyerCityResults", {
      stateId: selectedStateId,
      cityId: selectedCityId,
      cityName: city?.name ?? "cidade selecionada",
      areaIds: selectedAreaIds
    });
  }

  async function handleSubmitPrayer() {
    setStatus("loading");
    setMessage("Enviando pedido de oração com segurança.");
    try {
      const response = await prayerRequests.create({
        message: prayerMessage,
        anonymous: prayerAnonymous
      });
      setPrayerReceipt(response.request.createdAt);
      setPrayerMessage("");
      setStatus("idle");
      setMessage("Pedido de oração recebido.");
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

  if (!session || !currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.loginContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.loginHeader}>
            <Image accessibilityIgnoresInvertColors source={logo} style={styles.loginLogo} />
            <Text style={styles.subtitle}>{appCopy.subtitle}</Text>
          </View>

          <View style={styles.loginPanel}>
            <Text style={styles.loginTitle}>{authMode === "signIn" ? "Entrar" : "Criar novo usuário"}</Text>
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
              placeholder={authMode === "signIn" ? "senha" : "senha (mínimo 8 caracteres)"}
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
              <AppIcon
                color={colors.surfaceDeep}
                name={authMode === "signIn" ? "log-in-outline" : "person-add-outline"}
                size={18}
              />
              <Text style={styles.primaryButtonText}>{authMode === "signIn" ? "Entrar" : "Criar usuário"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={status === "loading"}
              style={styles.authModeButton}
              accessibilityRole="button"
              onPress={() => {
                setAuthMode((current) => (current === "signIn" ? "signUp" : "signIn"));
                setStatus("idle");
                setMessage(authMode === "signIn" ? "Informe seus dados para criar um usuário cliente." : "Entre com seu usuário.");
              }}
            >
              <Text style={styles.authModeButtonText}>
                {authMode === "signIn" ? "Criar novo usuário" : "Já tenho usuário"}
              </Text>
            </TouchableOpacity>
          </View>

          <StatusBox status={status} message={message} />
          <LegalLinks />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentUser.mustChangePassword) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.loginContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.loginHeader}>
            <Image accessibilityIgnoresInvertColors source={logo} style={styles.loginLogo} />
            <Text style={styles.subtitle}>Primeiro acesso do advogado</Text>
          </View>

          <View style={styles.loginPanel}>
            <Text style={styles.loginTitle}>Definir nova senha</Text>
            <TextInput
              onChangeText={setNewPassword}
              placeholder="nova senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
              value={newPassword}
            />
            <TextInput
              onChangeText={setNewPasswordConfirm}
              placeholder="confirmar senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
              value={newPasswordConfirm}
            />
            <TouchableOpacity
              disabled={status === "loading"}
              style={[styles.primaryButton, status === "loading" && styles.disabledButton]}
              accessibilityRole="button"
              onPress={handleChangePassword}
            >
              <AppIcon color={colors.surfaceDeep} name="shield-checkmark-outline" size={18} />
              <Text style={styles.primaryButtonText}>Atualizar senha</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={status === "loading"}
              style={styles.authModeButton}
              accessibilityRole="button"
              onPress={handleSignOut}
            >
              <Text style={styles.authModeButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>

          <StatusBox status={status} message={message} />
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
            {lawyerTab === "home" ? (
              <>
                <View style={styles.heroPanel}>
                  <Text style={styles.heroTitle}>
                    Olá, {lawyerDisplayName}, tudo bem?
                  </Text>
                  <Text style={styles.panelText}>
                    Acompanhe sua presença no Advogado 2.0 e mantenha seu perfil pronto para novos atendimentos.
                  </Text>
                </View>
                <LawyerVipCard dashboard={lawyerDashboard} />
                <View style={styles.metricsGrid}>
                  {(() => {
                    const metrics = lawyerDashboard?.metrics;
                    return (
                      <>
                        <LawyerInsightCard
                          icon="eye-outline"
                          label="Visitas"
                          value={metrics?.profileViews ?? 0}
                          helper="Ultimos 30 dias"
                        />
                        <LawyerInsightCard
                          icon="logo-whatsapp"
                          label="WhatsApp"
                          value={metrics?.whatsappClicks ?? 0}
                          helper="Contatos iniciados"
                          accent={colors.whatsapp}
                        />
                      </>
                    );
                  })()}
                </View>
                <PartnersFooter partners={partners} />
                <StatusBox status={status} message={message} />
              </>
            ) : null}

            {lawyerTab === "prayer" ? (
              <>
                <PrayerHomeBlock
                  anonymous={prayerAnonymous}
                  message={prayerMessage}
                  receipt={prayerReceipt}
                  status={status}
                  onAnonymousChange={() => setPrayerAnonymous((current) => !current)}
                  onMessageChange={setPrayerMessage}
                  onSubmit={handleSubmitPrayer}
                />
                <StatusBox status={status} message={message} />
              </>
            ) : null}

            {lawyerTab === "profile" ? (
              <LawyerReadonlyProfile
                dashboard={lawyerDashboard}
                profile={lawyerProfile}
                onSignOut={handleSignOut}
              />
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
                <Text style={styles.heroTitle}>Olá, {clientDisplayName}, tudo bem?</Text>
                <Text style={styles.heroKicker}>Encontre o advogado mais próximo da sua localização.</Text>
              </View>

              <View style={styles.citySearchPanel}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isStatePickerOpen }}
                  onPress={() => setIsStatePickerOpen((current) => !current)}
                  style={styles.locationSelectHeader}
                >
                  <View style={styles.locationSelectText}>
                    <Text style={styles.locationSelectLabel}>ESTADO</Text>
                    {selectedState ? <Text style={styles.locationSelectValue}>{selectedState.code} - {selectedState.name}</Text> : null}
                  </View>
                  <AppIcon color={colors.goldBright} name={isStatePickerOpen ? "chevron-up" : "chevron-down"} size={20} />
                </TouchableOpacity>
                {isStatePickerOpen ? (
                  <View style={styles.locationOptions}>
                    <TextInput
                      autoCapitalize="words"
                      onChangeText={setStateSearch}
                      placeholder="Digite para buscar estado"
                      placeholderTextColor={colors.textMuted}
                      style={styles.locationSearchInput}
                      value={stateSearch}
                    />
                    {filteredStates.map((state) => (
                      <TouchableOpacity
                        key={state.id}
                        onPress={() => handleSelectState(state.id)}
                        style={[styles.locationOption, selectedStateId === state.id && styles.locationOptionSelected]}
                      >
                        <Text style={[styles.locationOptionText, selectedStateId === state.id && styles.locationOptionTextSelected]}>
                          {state.code} - {state.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {states.length === 0 ? <Text style={styles.locationEmpty}>Nenhum estado disponivel para a especialidade selecionada.</Text> : null}
                    {states.length > 0 && filteredStates.length === 0 ? <Text style={styles.locationEmpty}>Nenhum estado encontrado.</Text> : null}
                  </View>
                ) : null}

                {selectedStateId ? (
                  <>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isCityPickerOpen }}
                      onPress={() => setIsCityPickerOpen((current) => !current)}
                      style={styles.locationSelectHeader}
                    >
                      <View style={styles.locationSelectText}>
                        <Text style={styles.locationSelectLabel}>CIDADE</Text>
                        {selectedCity ? <Text style={styles.locationSelectValue}>{selectedCity.name}</Text> : null}
                      </View>
                      <AppIcon color={colors.goldBright} name={isCityPickerOpen ? "chevron-up" : "chevron-down"} size={20} />
                    </TouchableOpacity>
                    {isCityPickerOpen ? (
                      <View style={styles.locationOptions}>
                        <TextInput
                          autoCapitalize="words"
                          onChangeText={setCitySearch}
                          placeholder="Digite para buscar cidade"
                          placeholderTextColor={colors.textMuted}
                          style={styles.locationSearchInput}
                          value={citySearch}
                        />
                        {filteredCities.map((city) => (
                          <TouchableOpacity
                            key={city.id}
                            onPress={() => {
                              setSelectedCityId(city.id);
                              setIsCityPickerOpen(false);
                              setCitySearch("");
                            }}
                            style={[styles.locationOption, selectedCityId === city.id && styles.locationOptionSelected]}
                          >
                            <Text style={[styles.locationOptionText, selectedCityId === city.id && styles.locationOptionTextSelected]}>{city.name}</Text>
                          </TouchableOpacity>
                        ))}
                        {cities.length === 0 ? <Text style={styles.locationEmpty}>Nenhuma cidade disponivel para a especialidade selecionada.</Text> : null}
                        {cities.length > 0 && filteredCities.length === 0 ? <Text style={styles.locationEmpty}>Nenhuma cidade encontrada.</Text> : null}
                      </View>
                    ) : null}
                  </>
                ) : null}
              </View>

              <SpecialtyMatchOrbit
                areas={areas}
                selectedAreaIds={selectedAreaIds}
                onToggle={toggleArea}
                onHelp={showSpecialtyHelp}
              />

              <View style={styles.searchActionsPanel}>
                <View style={styles.searchDescriptions}>
                  <View style={styles.searchModeInfo}>
                    <AppIcon color={colors.goldBright} name="location-outline" size={18} />
                    <Text style={styles.searchModeText}>Localização usa o GPS do aparelho para indicar o advogado mais próximo.</Text>
                  </View>
                  <View style={styles.searchModeInfo}>
                    <AppIcon color={colors.goldBright} name="business-outline" size={18} />
                    <Text style={styles.searchModeText}>Cidade não pede GPS; lista advogados da cidade escolhida.</Text>
                  </View>
                </View>
                <View style={styles.searchButtonRow}>
                  <TouchableOpacity
                    disabled={selectedAreaIds.length === 0 || status === "loading"}
                    onPress={handleMatch}
                    style={[
                      styles.primaryButton,
                      styles.searchModeButton,
                      (selectedAreaIds.length === 0 || status === "loading") && styles.disabledButton
                    ]}
                  >
                    <AppIcon color={colors.surfaceDeep} name="navigate-outline" size={18} />
                    <Text style={styles.primaryButtonText}>Por localização</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={!selectedStateId || !selectedCityId || selectedAreaIds.length === 0}
                    onPress={handleCityMatch}
                    style={[
                      styles.secondaryButton,
                      styles.searchModeButton,
                      (!selectedStateId || !selectedCityId || selectedAreaIds.length === 0) && styles.disabledButton
                    ]}
                  >
                    <AppIcon color={colors.goldBright} name="business-outline" size={18} />
                    <Text style={styles.secondaryButtonText}>Por cidade</Text>
                  </TouchableOpacity>
                </View>
              </View>

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
                      <AppIcon color={colors.surfaceDeep} name="search-outline" size={24} />
                    </View>
                    <Text style={styles.stepText}>1. Buscar</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={styles.stepIconBadge}>
                      <AppIcon color={colors.surfaceDeep} name="shield-checkmark-outline" size={24} />
                    </View>
                    <Text style={styles.stepText}>2. Conferir</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={styles.stepIconBadge}>
                      <AppIcon color={colors.surfaceDeep} name="logo-whatsapp" size={24} />
                    </View>
                    <Text style={styles.stepText}>3. Conversar</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={styles.stepIconBadge}>
                      <AppIcon color={colors.surfaceDeep} name="checkmark-circle-outline" size={24} />
                    </View>
                    <Text style={styles.stepText}>4. Resolver</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.locationFootnote}>{appCopy.location}</Text>

              <StatusBox status={status} message={message} />
            </>
          ) : null}

          {clientTab === "profile" ? (
            <View style={styles.accountPanel}>
              <Text style={styles.panelTitle}>Perfil do cliente</Text>
              <Text style={styles.panelText}>Sessão autenticada com segurança.</Text>
              <AccountDeletionRequest />
              <LegalLinks />
              <TouchableOpacity style={styles.signOutButton} accessibilityRole="button" onPress={handleSignOut}>
                <AppIcon color={colors.gold} name="log-out-outline" size={18} />
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
    height: 242,
    resizeMode: "contain",
    width: 242
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
  citySearchPanel: {
    backgroundColor: "rgba(11,22,40,0.78)",
    borderColor: "rgba(217,154,45,0.16)",
    borderRadius: 10,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  locationSelectHeader: {
    alignItems: "center",
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  locationSelectText: {
    flex: 1,
    gap: 3
  },
  locationSelectLabel: {
    color: colors.goldBright,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  locationSelectValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  },
  locationOptions: {
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden"
  },
  locationSearchInput: {
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    color: colors.textPrimary,
    minHeight: 46,
    paddingHorizontal: spacing.md
  },
  locationOption: {
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  locationOptionSelected: {
    backgroundColor: colors.goldContainer
  },
  locationOptionText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  },
  locationOptionTextSelected: {
    color: colors.surfaceDeep
  },
  locationEmpty: {
    color: colors.textMuted,
    padding: spacing.md
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
    height: 184,
    resizeMode: "contain",
    width: 184
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
    paddingHorizontal: spacing.md,
    position: "relative"
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
  orbitPanel: {
    backgroundColor: "#071931",
    borderColor: "rgba(217,154,45,0.2)",
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    overflow: "visible",
    paddingHorizontal: 10,
    paddingVertical: 12
  },
  orbitStage: {
    gap: SPECIALTY_ORBIT_GAP,
    height: SPECIALTY_STAGE_HEIGHT,
    position: "relative",
    width: SPECIALTY_STAGE_WIDTH
  },
  orbitConnectorLayer: {
    left: 0,
    position: "absolute",
    top: 0,
    zIndex: 0
  },
  orbitConnectorLine: {
    opacity: 0.9
  },
  orbitTopRow: {
    flexDirection: "row",
    gap: SPECIALTY_ORBIT_GAP,
    justifyContent: "center",
    zIndex: 2
  },
  orbitMiddleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPECIALTY_ORBIT_GAP,
    justifyContent: "center",
    minHeight: SPECIALTY_CENTER_SIZE,
    zIndex: 3
  },
  orbitBottomRow: {
    flexDirection: "row",
    gap: SPECIALTY_ORBIT_GAP,
    justifyContent: "center",
    zIndex: 2
  },
  orbitSideColumn: {
    height: SPECIALTY_CARD_SIZE,
    width: SPECIALTY_CARD_SIZE,
    zIndex: 1
  },
  orbitSpecialty: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1,
    flexShrink: 0,
    gap: 5,
    height: SPECIALTY_CARD_SIZE,
    justifyContent: "center",
    overflow: "visible",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    position: "relative",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    width: SPECIALTY_CARD_SIZE
  },
  orbitSpecialtySelected: {
    borderWidth: 2,
    elevation: 8,
    shadowOpacity: 0.56,
    shadowRadius: 15,
    transform: [{ scale: 1.04 }]
  },
  orbitSelectedCheck: {
    alignItems: "center",
    backgroundColor: colors.surfaceDeep,
    borderColor: colors.goldBright,
    borderRadius: 999,
    borderWidth: 1,
    height: 20,
    justifyContent: "center",
    position: "absolute",
    right: -5,
    top: -5,
    width: 20,
    zIndex: 4
  },
  orbitIconBadge: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    height: SPECIALTY_ICON_SIZE,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    width: SPECIALTY_ICON_SIZE,
    elevation: 1
  },
  orbitIconBadgeSelected: {
    elevation: 4,
    shadowOpacity: 0.34,
    shadowRadius: 11
  },
  orbitIconGlow: {
    borderRadius: 999,
    height: 30,
    position: "absolute",
    transform: [{ rotate: "18deg" }],
    width: 20
  },
  orbitIconGlowSelected: {
    backgroundColor: "rgba(7,20,38,0.12)"
  },
  orbitIconAccent: {
    backgroundColor: colors.goldBright,
    borderColor: "#071931",
    borderRadius: 999,
    borderWidth: 2,
    height: 7,
    position: "absolute",
    right: 2,
    top: 2,
    width: 7
  },
  orbitIconAccentSelected: {
    backgroundColor: colors.surfaceDeep,
    borderColor: colors.goldBright
  },
  orbitSpecialtyText: {
    color: colors.textMuted,
    fontSize: 9.5,
    fontWeight: "900",
    lineHeight: 12,
    textAlign: "center",
    width: "100%"
  },
  orbitSpecialtyTextSelected: {
    color: colors.surfaceDeep
  },
  orbitMascotCenter: {
    alignItems: "center",
    height: SPECIALTY_CENTER_SIZE,
    justifyContent: "center",
    overflow: "visible",
    position: "relative",
    width: SPECIALTY_CENTER_SIZE,
    zIndex: 4
  },
  mascotHaloOuter: {
    backgroundColor: "rgba(255,211,77,0.08)",
    borderColor: "rgba(255,211,77,0.26)",
    borderRadius: 999,
    borderWidth: 1,
    height: 116,
    position: "absolute",
    width: 116
  },
  mascotHaloInner: {
    backgroundColor: "rgba(2,102,255,0.08)",
    borderColor: "rgba(255,211,77,0.34)",
    borderRadius: 999,
    borderWidth: 1,
    height: 82,
    position: "absolute",
    width: 82
  },
  mascotImage: {
    height: 154,
    left: -15,
    position: "absolute",
    resizeMode: "contain",
    top: -19,
    width: 154
  },
  orbitHelpAnchor: {
    bottom: 15,
    position: "absolute",
    right: 16,
    zIndex: 8
  },
  mascotHelpTouchTarget: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44
  },
  mascotHelpButton: {
    alignItems: "center",
    backgroundColor: colors.goldBright,
    borderColor: "rgba(255,255,255,0.58)",
    borderRadius: 999,
    borderWidth: 1.5,
    height: SPECIALTY_HELP_BUTTON_SIZE,
    justifyContent: "center",
    shadowColor: colors.goldBright,
    shadowOpacity: 0.28,
    shadowRadius: 7,
    width: SPECIALTY_HELP_BUTTON_SIZE,
    elevation: 4
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
  accountDeletionBox: {
    backgroundColor: "rgba(217,154,45,0.08)",
    borderColor: "rgba(217,154,45,0.28)",
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  accountDeletionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  accountDeletionTitle: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: "900"
  },
  accountDeletionButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: colors.goldBright,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  vipCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  benefitsPanel: {
    gap: spacing.lg
  },
  benefitCards: {
    gap: spacing.md
  },
  benefitCard: {
    backgroundColor: "rgba(217,154,45,0.08)",
    borderColor: "rgba(217,154,45,0.22)",
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  benefitHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  benefitBadge: {
    backgroundColor: colors.goldBright,
    borderRadius: 999,
    color: colors.surfaceDeep,
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    textTransform: "uppercase"
  },
  benefitDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19
  },
  benefitLink: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: colors.goldBright,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 38,
    paddingHorizontal: spacing.md
  },
  vipPhysicalCard: {
    backgroundColor: "#000B21",
    borderColor: "rgba(2,102,255,0.32)",
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.lg,
    minHeight: 220,
    overflow: "hidden",
    padding: spacing.lg,
    shadowColor: colors.blue,
    shadowOpacity: 0.2,
    shadowRadius: 22
  },
  vipTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  vipKicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  vipSubKicker: {
    color: "rgba(226,226,226,0.48)",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 4,
    textTransform: "uppercase"
  },
  vipMiddleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 72
  },
  vipChip: {
    alignItems: "center",
    backgroundColor: colors.gold,
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    width: 52
  },
  vipChipLineHorizontal: {
    backgroundColor: "rgba(18,20,20,0.36)",
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 18
  },
  vipChipLineVertical: {
    backgroundColor: "rgba(18,20,20,0.36)",
    bottom: 0,
    position: "absolute",
    top: 0,
    width: 1
  },
  vipSeal: {
    alignItems: "center",
    backgroundColor: "rgba(0,8,20,0.86)",
    borderColor: "rgba(2,102,255,0.45)",
    borderRadius: 999,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54
  },
  vipSealText: {
    color: colors.gold,
    fontSize: 25,
    fontStyle: "italic",
    fontWeight: "900"
  },
  vipBottomRow: {
    flexDirection: "row"
  },
  vipIdentity: {
    flex: 1,
    gap: spacing.sm
  },
  vipName: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  vipMetaRow: {
    flexDirection: "row",
    gap: spacing.lg
  },
  vipMetaBlock: {
    flex: 1,
    gap: 2
  },
  vipMetaLabel: {
    color: "rgba(217,154,45,0.64)",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  vipMetaValue: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "900"
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: spacing.md,
    minHeight: 142,
    padding: spacing.lg
  },
  metricHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  metricIconBadge: {
    alignItems: "center",
    backgroundColor: "rgba(217,154,45,0.12)",
    borderRadius: 999,
    height: 34,
    justifyContent: "center",
    width: 34
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
  metricHelper: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17
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
  searchActionsPanel: {
    backgroundColor: "rgba(11,22,40,0.78)",
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  searchDescriptions: {
    gap: spacing.sm
  },
  searchModeInfo: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm
  },
  searchModeText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18
  },
  searchButtonRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  searchModeButton: {
    flex: 1,
    paddingHorizontal: spacing.sm
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
    backgroundColor: colors.disabledSurface,
    borderColor: colors.disabledBorder,
    opacity: 0.72
  },
  pressedButton: {
    opacity: 0.82
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
  readonlyProfile: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.md,
    overflow: "hidden",
    padding: spacing.lg,
    paddingTop: 0
  },
  readonlyCover: {
    alignItems: "center",
    backgroundColor: colors.surfaceDeep,
    height: 138,
    justifyContent: "center",
    marginHorizontal: -spacing.lg
  },
  readonlyCoverImage: {
    height: "100%",
    width: "100%"
  },
  readonlyIdentity: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.md,
    marginTop: -42
  },
  readonlyAvatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceDeep,
    borderColor: colors.gold,
    borderRadius: 16,
    borderWidth: 4,
    height: 96,
    justifyContent: "center",
    overflow: "hidden",
    width: 96
  },
  readonlyAvatarImage: {
    height: "100%",
    width: "100%"
  },
  avatarInitial: {
    color: colors.gold,
    fontSize: 40,
    fontWeight: "900"
  },
  readonlyNameBlock: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.sm
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  specialtyChip: {
    backgroundColor: "rgba(217,154,45,0.1)",
    borderColor: "rgba(217,154,45,0.28)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  specialtyText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900"
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
    flexWrap: "wrap",
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
