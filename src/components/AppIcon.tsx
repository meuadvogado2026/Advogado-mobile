import { StyleSheet, Text } from "react-native";

export type AppIconName = string;

const glyphs: Record<string, string> = {
  "arrow-back": "<",
  "briefcase-outline": "▣",
  "business-outline": "▥",
  "card-outline": "▭",
  "checkmark": "✓",
  "checkmark-circle-outline": "✓",
  "checkbox-outline": "☑",
  "document-text-outline": "§",
  "eye-outline": "◉",
  "globe-outline": "◎",
  "hammer-outline": "◇",
  "heart-outline": "♡",
  "home-outline": "⌂",
  "location-outline": "⌖",
  "log-in-outline": "→",
  "log-out-outline": "→",
  "logo-facebook": "f",
  "logo-instagram": "IG",
  "logo-linkedin": "in",
  "logo-whatsapp": "W",
  "navigate-outline": "⌖",
  "people-outline": "●",
  "person-add-outline": "+",
  "person-outline": "○",
  "refresh-outline": "↻",
  "ribbon-outline": "◎",
  "scale-outline": "⚖",
  "search-outline": "⌕",
  "shield-checkmark-outline": "✓",
  "shield-outline": "□",
  "square-outline": "☐",
  "star": "★",
  "warning-outline": "!"
};

export function AppIcon({ color, name, size = 20 }: { color: string; name: AppIconName; size?: number }) {
  const glyph = glyphs[name] ?? "•";
  const compact = glyph.length > 1;

  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.icon,
        {
          color,
          fontSize: compact ? Math.max(10, Math.round(size * 0.55)) : size,
          height: size,
          lineHeight: size,
          minWidth: size
        }
      ]}
    >
      {glyph}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false
  }
});
