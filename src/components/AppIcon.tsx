import type { ReactNode } from "react";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";

export type AppIconName =
  | "arrow-back"
  | "briefcase-outline"
  | "business-outline"
  | "card-outline"
  | "cart-outline"
  | "checkmark"
  | "checkmark-circle-outline"
  | "checkbox-outline"
  | "document-text-outline"
  | "eye-outline"
  | "globe-outline"
  | "hammer-outline"
  | "heart-outline"
  | "home-outline"
  | "library-outline"
  | "location-outline"
  | "log-in-outline"
  | "log-out-outline"
  | "logo-facebook"
  | "logo-instagram"
  | "logo-linkedin"
  | "logo-whatsapp"
  | "navigate-outline"
  | "people-outline"
  | "person-add-outline"
  | "person-outline"
  | "refresh-outline"
  | "ribbon-outline"
  | "scale-outline"
  | "search-outline"
  | "shield-checkmark-outline"
  | "shield-outline"
  | "square-outline"
  | "star"
  | "warning-outline";

type IconProps = {
  color: string;
  name: AppIconName;
  size?: number;
};

type DrawProps = {
  color: string;
  strokeWidth: number;
};

type IconRenderer = (props: DrawProps) => ReactNode;

const lineProps = ({ color, strokeWidth }: DrawProps) => ({
  fill: "none",
  stroke: color,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth
});

const iconRenderers: Record<AppIconName, IconRenderer> = {
  "arrow-back": (props) => (
    <>
      <Line x1="20" y1="12" x2="5" y2="12" {...lineProps(props)} />
      <Polyline points="11 6 5 12 11 18" {...lineProps(props)} />
    </>
  ),
  "briefcase-outline": (props) => (
    <>
      <Rect x="3.5" y="7" width="17" height="13" rx="2.5" {...lineProps(props)} />
      <Path d="M9 7V5.7C9 4.8 9.8 4 10.7 4h2.6c.9 0 1.7.8 1.7 1.7V7" {...lineProps(props)} />
      <Line x1="3.5" y1="12" x2="20.5" y2="12" {...lineProps(props)} />
      <Line x1="12" y1="11" x2="12" y2="13.5" {...lineProps(props)} />
    </>
  ),
  "business-outline": (props) => (
    <>
      <Rect x="4" y="5" width="10" height="16" rx="1.5" {...lineProps(props)} />
      <Path d="M14 10h6v11h-6" {...lineProps(props)} />
      <Line x1="7" y1="9" x2="10.5" y2="9" {...lineProps(props)} />
      <Line x1="7" y1="13" x2="10.5" y2="13" {...lineProps(props)} />
      <Line x1="7" y1="17" x2="10.5" y2="17" {...lineProps(props)} />
      <Line x1="17" y1="14" x2="17" y2="14.1" {...lineProps(props)} />
    </>
  ),
  "card-outline": (props) => (
    <>
      <Rect x="3" y="6" width="18" height="13" rx="2.5" {...lineProps(props)} />
      <Line x1="3" y1="10" x2="21" y2="10" {...lineProps(props)} />
      <Line x1="7" y1="15" x2="11" y2="15" {...lineProps(props)} />
    </>
  ),
  "cart-outline": (props) => (
    <>
      <Path d="M4 5h2l2.2 10.3c.2.9 1 1.5 1.9 1.5h7.2c.9 0 1.7-.6 1.9-1.5L20.5 9H7.2" {...lineProps(props)} />
      <Circle cx="10" cy="20" r="1.2" {...lineProps(props)} />
      <Circle cx="17" cy="20" r="1.2" {...lineProps(props)} />
    </>
  ),
  checkmark: (props) => <Polyline points="5 12.5 10 17 19 7" {...lineProps(props)} />,
  "checkmark-circle-outline": (props) => (
    <>
      <Circle cx="12" cy="12" r="9" {...lineProps(props)} />
      <Polyline points="7.5 12.5 10.5 15.5 17 8.5" {...lineProps(props)} />
    </>
  ),
  "checkbox-outline": (props) => (
    <>
      <Rect x="4" y="4" width="16" height="16" rx="3" {...lineProps(props)} />
      <Polyline points="7.5 12 10.5 15 17 8" {...lineProps(props)} />
    </>
  ),
  "document-text-outline": (props) => (
    <>
      <Path d="M7 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" {...lineProps(props)} />
      <Path d="M13 3.8V8h4" {...lineProps(props)} />
      <Line x1="8.5" y1="12" x2="15.5" y2="12" {...lineProps(props)} />
      <Line x1="8.5" y1="16" x2="14" y2="16" {...lineProps(props)} />
    </>
  ),
  "eye-outline": (props) => (
    <>
      <Path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" {...lineProps(props)} />
      <Circle cx="12" cy="12" r="2.4" {...lineProps(props)} />
    </>
  ),
  "globe-outline": (props) => (
    <>
      <Circle cx="12" cy="12" r="9" {...lineProps(props)} />
      <Path d="M3.8 12h16.4M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21M12 3C9.5 5.6 8.2 8.6 8.2 12S9.5 18.4 12 21" {...lineProps(props)} />
    </>
  ),
  "hammer-outline": (props) => (
    <>
      <Path d="M13.5 5.5 16 3l5 5-2.5 2.5" {...lineProps(props)} />
      <Path d="M14.5 8.5 6 17l-2 4 4-2 8.5-8.5" {...lineProps(props)} />
      <Path d="M10.5 4.5 19.5 13.5" {...lineProps(props)} />
    </>
  ),
  "heart-outline": (props) => (
    <Path d="M12 20s-7.5-4.7-8.8-10.1C2.5 6.8 4.4 4.5 7.2 4.5c1.7 0 3.1.9 3.8 2.2.7-1.3 2.1-2.2 3.8-2.2 2.8 0 4.7 2.3 4 5.4C17.5 15.3 12 20 12 20Z" {...lineProps(props)} />
  ),
  "home-outline": (props) => (
    <>
      <Path d="M4 11.5 12 4l8 7.5" {...lineProps(props)} />
      <Path d="M6.5 10.5V20h5v-5h3v5h5v-9.5" {...lineProps(props)} />
    </>
  ),
  "library-outline": (props) => (
    <>
      <Path d="M4 20h17" {...lineProps(props)} />
      <Path d="M5 9h16L12 4 3 9h2Z" {...lineProps(props)} />
      <Line x1="6.5" y1="9" x2="6.5" y2="18" {...lineProps(props)} />
      <Line x1="12" y1="9" x2="12" y2="18" {...lineProps(props)} />
      <Line x1="17.5" y1="9" x2="17.5" y2="18" {...lineProps(props)} />
    </>
  ),
  "location-outline": (props) => (
    <>
      <Path d="M12 21s6-5.6 6-11a6 6 0 0 0-12 0c0 5.4 6 11 6 11Z" {...lineProps(props)} />
      <Circle cx="12" cy="10" r="2" {...lineProps(props)} />
    </>
  ),
  "log-in-outline": (props) => (
    <>
      <Path d="M13 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" {...lineProps(props)} />
      <Line x1="4" y1="12" x2="14" y2="12" {...lineProps(props)} />
      <Polyline points="10 8 14 12 10 16" {...lineProps(props)} />
    </>
  ),
  "log-out-outline": (props) => (
    <>
      <Path d="M11 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" {...lineProps(props)} />
      <Line x1="10" y1="12" x2="20" y2="12" {...lineProps(props)} />
      <Polyline points="16 8 20 12 16 16" {...lineProps(props)} />
    </>
  ),
  "logo-facebook": (props) => (
    <Path
      d="M14.5 8H17V4h-3c-3 0-5 2-5 5v2H6v4h3v7h4.5v-7H17l.7-4h-4.2V9c0-.7.4-1 1-1Z"
      fill={props.color}
    />
  ),
  "logo-instagram": (props) => (
    <>
      <Rect x="4" y="4" width="16" height="16" rx="5" {...lineProps(props)} />
      <Circle cx="12" cy="12" r="3.5" {...lineProps(props)} />
      <Circle cx="16.8" cy="7.2" r="0.9" fill={props.color} />
    </>
  ),
  "logo-linkedin": (props) => (
    <>
      <Circle cx="6.5" cy="7" r="2" fill={props.color} />
      <Rect x="4.8" y="10" width="3.4" height="10" rx="0.7" fill={props.color} />
      <Path d="M11 10h3.2v1.4c.7-1 1.7-1.7 3.2-1.7 2.4 0 4 1.6 4 4.9V20h-3.5v-4.9c0-1.4-.5-2.3-1.7-2.3-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V20H11V10Z" fill={props.color} />
    </>
  ),
  "logo-whatsapp": (props) => (
    <>
      <Path d="M5.2 19.4 6.4 16A8 8 0 1 1 9 18.6l-3.8.8Z" {...lineProps(props)} />
      <Path d="M9.2 8.5c.2-.5.4-.6.8-.6h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.4.5c.8 1.5 1.9 2.6 3.4 3.3l.6-.7c.2-.2.4-.3.7-.2l1.7.8c.3.1.4.3.4.6 0 .8-.6 1.8-1.8 1.8-3.5 0-8.1-3.9-8.1-8 0-.6.2-1 .5-1.3Z" {...lineProps(props)} />
    </>
  ),
  "navigate-outline": (props) => (
    <Path d="M4 12.5 20 4l-6.5 16-2-7.5L4 12.5Z" {...lineProps(props)} />
  ),
  "people-outline": (props) => (
    <>
      <Circle cx="9" cy="9" r="3" {...lineProps(props)} />
      <Path d="M3.5 20c.7-3.1 2.7-5 5.5-5s4.8 1.9 5.5 5" {...lineProps(props)} />
      <Path d="M15.5 11.5a2.5 2.5 0 1 0-.8-4.8" {...lineProps(props)} />
      <Path d="M15.5 15.2c2.5.4 4.1 2 4.8 4.8" {...lineProps(props)} />
    </>
  ),
  "person-add-outline": (props) => (
    <>
      <Circle cx="9" cy="8.5" r="3" {...lineProps(props)} />
      <Path d="M3.5 20c.7-3.4 2.8-5.2 5.5-5.2 2.2 0 4 .9 5 2.8" {...lineProps(props)} />
      <Line x1="18" y1="10" x2="18" y2="18" {...lineProps(props)} />
      <Line x1="14" y1="14" x2="22" y2="14" {...lineProps(props)} />
    </>
  ),
  "person-outline": (props) => (
    <>
      <Circle cx="12" cy="8" r="3.5" {...lineProps(props)} />
      <Path d="M5 20c1-4 3.5-6 7-6s6 2 7 6" {...lineProps(props)} />
    </>
  ),
  "refresh-outline": (props) => (
    <>
      <Path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" {...lineProps(props)} />
      <Polyline points="4 3.8 4 8 8.2 8" {...lineProps(props)} />
      <Path d="M4 13a8 8 0 0 0 14.3 4.9L20 16" {...lineProps(props)} />
      <Polyline points="20 20.2 20 16 15.8 16" {...lineProps(props)} />
    </>
  ),
  "ribbon-outline": (props) => (
    <>
      <Circle cx="12" cy="8" r="4.5" {...lineProps(props)} />
      <Path d="M9 12.5 7.5 21l4.5-2.4 4.5 2.4-1.5-8.5" {...lineProps(props)} />
      <Polyline points="9.6 8.2 11.3 10 14.5 6.5" {...lineProps(props)} />
    </>
  ),
  "scale-outline": (props) => (
    <>
      <Line x1="12" y1="4" x2="12" y2="20" {...lineProps(props)} />
      <Line x1="7" y1="20" x2="17" y2="20" {...lineProps(props)} />
      <Line x1="5" y1="7" x2="19" y2="7" {...lineProps(props)} />
      <Path d="M7 7 4.5 13h5L7 7ZM17 7l-2.5 6h5L17 7Z" {...lineProps(props)} />
    </>
  ),
  "search-outline": (props) => (
    <>
      <Circle cx="10.5" cy="10.5" r="6.5" {...lineProps(props)} />
      <Line x1="15.5" y1="15.5" x2="21" y2="21" {...lineProps(props)} />
    </>
  ),
  "shield-checkmark-outline": (props) => (
    <>
      <Path d="M12 3.5 19 6v5.5c0 4.4-2.8 7.4-7 9-4.2-1.6-7-4.6-7-9V6l7-2.5Z" {...lineProps(props)} />
      <Polyline points="8.3 12 11 14.7 16 9.2" {...lineProps(props)} />
    </>
  ),
  "shield-outline": (props) => (
    <Path d="M12 3.5 19 6v5.5c0 4.4-2.8 7.4-7 9-4.2-1.6-7-4.6-7-9V6l7-2.5Z" {...lineProps(props)} />
  ),
  "square-outline": (props) => <Rect x="4" y="4" width="16" height="16" rx="3" {...lineProps(props)} />,
  star: (props) => (
    <Path
      d="m12 3.5 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.3 6.1-.9L12 3.5Z"
      fill={props.color}
    />
  ),
  "warning-outline": (props) => (
    <>
      <Path d="M12 4 21 20H3L12 4Z" {...lineProps(props)} />
      <Line x1="12" y1="9" x2="12" y2="14" {...lineProps(props)} />
      <Line x1="12" y1="17" x2="12" y2="17.1" {...lineProps(props)} />
    </>
  )
};

export function AppIcon({ color, name, size = 20 }: IconProps) {
  const strokeWidth = Math.max(1.8, Math.round(size / 10));
  const renderIcon = iconRenderers[name];

  return (
    <Svg
      accessibilityElementsHidden
      focusable={false}
      height={size}
      importantForAccessibility="no"
      viewBox="0 0 24 24"
      width={size}
    >
      {renderIcon({ color, strokeWidth })}
    </Svg>
  );
}
