import type {
  EventFontStyle as EventFontStyleId,
  EventTheme,
  EventThemePreset as EventThemePresetId,
} from "../../../shared/event-theme";

export type { EventTheme };

export const EventThemePreset = {
  CLASSIC: "CLASSIC",
  BLUSH: "BLUSH",
  INK: "INK",
  FOREST: "FOREST",
  COBALT: "COBALT",
  SAND: "SAND",
  MIDNIGHT: "MIDNIGHT",
} as const satisfies Record<string, EventThemePresetId>;

export type EventThemePreset = (typeof EventThemePreset)[keyof typeof EventThemePreset];

export const EventFontStyle = {
  SANS: "SANS",
  ROUND: "ROUND",
  NARROW: "NARROW",
  SERIF: "SERIF",
  CLASSIC: "CLASSIC",
  DISPLAY: "DISPLAY",
  SLAB: "SLAB",
  ROMAN: "ROMAN",
  SCRIPT: "SCRIPT",
  HAND: "HAND",
  BRUSH: "BRUSH",
  MONO: "MONO",
} as const satisfies Record<string, EventFontStyleId>;

export type EventFontStyle = (typeof EventFontStyle)[keyof typeof EventFontStyle];

const FONT_STACK: Record<EventFontStyle, string> = {
  [EventFontStyle.SANS]: "var(--font-manrope), system-ui, sans-serif",
  [EventFontStyle.ROUND]: "var(--font-round), system-ui, sans-serif",
  [EventFontStyle.NARROW]: "var(--font-narrow), system-ui, sans-serif",
  [EventFontStyle.SERIF]: "var(--font-newsreader), Georgia, serif",
  [EventFontStyle.CLASSIC]: "var(--font-classic), Georgia, serif",
  [EventFontStyle.DISPLAY]: "var(--font-display), Georgia, serif",
  [EventFontStyle.SLAB]: "var(--font-slab), Rockwell, serif",
  [EventFontStyle.ROMAN]: "var(--font-roman), Palatino, serif",
  [EventFontStyle.SCRIPT]: "var(--font-script), cursive",
  [EventFontStyle.HAND]: "var(--font-hand), cursive",
  [EventFontStyle.BRUSH]: "var(--font-brush), cursive",
  [EventFontStyle.MONO]: "var(--font-mono), ui-monospace, monospace",
};

export const EVENT_FONT_STYLES: { id: EventFontStyle; label: string; stack: string }[] = [
  { id: EventFontStyle.SANS, label: "Sans", stack: FONT_STACK[EventFontStyle.SANS] },
  { id: EventFontStyle.ROUND, label: "Round", stack: FONT_STACK[EventFontStyle.ROUND] },
  { id: EventFontStyle.NARROW, label: "Narrow", stack: FONT_STACK[EventFontStyle.NARROW] },
  { id: EventFontStyle.SERIF, label: "Serif", stack: FONT_STACK[EventFontStyle.SERIF] },
  { id: EventFontStyle.CLASSIC, label: "Classic", stack: FONT_STACK[EventFontStyle.CLASSIC] },
  { id: EventFontStyle.DISPLAY, label: "Display", stack: FONT_STACK[EventFontStyle.DISPLAY] },
  { id: EventFontStyle.SLAB, label: "Slab", stack: FONT_STACK[EventFontStyle.SLAB] },
  { id: EventFontStyle.ROMAN, label: "Roman", stack: FONT_STACK[EventFontStyle.ROMAN] },
  { id: EventFontStyle.SCRIPT, label: "Script", stack: FONT_STACK[EventFontStyle.SCRIPT] },
  { id: EventFontStyle.HAND, label: "Hand", stack: FONT_STACK[EventFontStyle.HAND] },
  { id: EventFontStyle.BRUSH, label: "Brush", stack: FONT_STACK[EventFontStyle.BRUSH] },
  { id: EventFontStyle.MONO, label: "Mono", stack: FONT_STACK[EventFontStyle.MONO] },
];

export type EventThemeTokens = {
  page: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  canvas: string;
  card: string;
  ink: string;
  body: string;
  mute: string;
  secondary: string;
  secondaryPressed: string;
  hairline: string;
  hairlineSoft: string;
};

export type EventThemePresetMeta = {
  id: EventThemePreset;
  label: string;
  tokens: Omit<EventThemeTokens, "primaryPressed" | "onPrimary"> & {
    primary: string;
  };
};

const HEX = /^#[0-9a-fA-F]{6}$/;

const PRESET_BASE: Record<
  EventThemePreset,
  Omit<EventThemeTokens, "primaryPressed" | "onPrimary">
> = {
  [EventThemePreset.CLASSIC]: {
    page: "#fbfbf9",
    primary: "#e60023",
    canvas: "#ffffff",
    card: "#f6f6f3",
    ink: "#000000",
    body: "#33332e",
    mute: "#62625b",
    secondary: "#e5e5e0",
    secondaryPressed: "#c8c8c1",
    hairline: "#dadad3",
    hairlineSoft: "#e5e5e0",
  },
  [EventThemePreset.BLUSH]: {
    page: "#faf4f2",
    primary: "#c45c6a",
    canvas: "#fffbfa",
    card: "#f3e8e5",
    ink: "#2a1816",
    body: "#4a322f",
    mute: "#8a6a66",
    secondary: "#ead9d5",
    secondaryPressed: "#d9c2bd",
    hairline: "#e0cec9",
    hairlineSoft: "#ead9d5",
  },
  [EventThemePreset.INK]: {
    page: "#f3f4f6",
    primary: "#1c1f26",
    canvas: "#ffffff",
    card: "#e8eaee",
    ink: "#111318",
    body: "#2c3038",
    mute: "#5c6370",
    secondary: "#d5d8de",
    secondaryPressed: "#b8bcc6",
    hairline: "#c8ccd4",
    hairlineSoft: "#d5d8de",
  },
  [EventThemePreset.FOREST]: {
    page: "#f2f5f1",
    primary: "#2f6b4f",
    canvas: "#fbfcf9",
    card: "#e4ebe2",
    ink: "#142018",
    body: "#2d3d32",
    mute: "#5e7264",
    secondary: "#d2ddd0",
    secondaryPressed: "#b6c6b3",
    hairline: "#c4d0c1",
    hairlineSoft: "#d2ddd0",
  },
  [EventThemePreset.COBALT]: {
    page: "#f1f4f9",
    primary: "#2a5f9e",
    canvas: "#fafbfd",
    card: "#e2e8f1",
    ink: "#121826",
    body: "#2a3348",
    mute: "#5a657c",
    secondary: "#d0d8e6",
    secondaryPressed: "#b4bfd2",
    hairline: "#c2cad8",
    hairlineSoft: "#d0d8e6",
  },
  [EventThemePreset.SAND]: {
    page: "#f7f3eb",
    primary: "#8a5a2b",
    canvas: "#fcfaf5",
    card: "#efe6d6",
    ink: "#241a10",
    body: "#433628",
    mute: "#7a6a56",
    secondary: "#e2d6c2",
    secondaryPressed: "#cfc0a6",
    hairline: "#d8ccb6",
    hairlineSoft: "#e2d6c2",
  },
  [EventThemePreset.MIDNIGHT]: {
    page: "#14171c",
    primary: "#6b9fd4",
    canvas: "#1c2129",
    card: "#242a34",
    ink: "#eef1f5",
    body: "#c5cbd4",
    mute: "#8b939f",
    secondary: "#2e3540",
    secondaryPressed: "#3c4552",
    hairline: "#343b48",
    hairlineSoft: "#2e3540",
  },
};

export const EVENT_THEME_PRESETS: EventThemePresetMeta[] = [
  { id: EventThemePreset.CLASSIC, label: "Classic", tokens: PRESET_BASE[EventThemePreset.CLASSIC] },
  { id: EventThemePreset.BLUSH, label: "Blush", tokens: PRESET_BASE[EventThemePreset.BLUSH] },
  { id: EventThemePreset.INK, label: "Ink", tokens: PRESET_BASE[EventThemePreset.INK] },
  { id: EventThemePreset.FOREST, label: "Forest", tokens: PRESET_BASE[EventThemePreset.FOREST] },
  { id: EventThemePreset.COBALT, label: "Cobalt", tokens: PRESET_BASE[EventThemePreset.COBALT] },
  { id: EventThemePreset.SAND, label: "Sand", tokens: PRESET_BASE[EventThemePreset.SAND] },
  { id: EventThemePreset.MIDNIGHT, label: "Midnight", tokens: PRESET_BASE[EventThemePreset.MIDNIGHT] },
];

export const DEFAULT_EVENT_THEME: EventTheme = {
  presetId: EventThemePreset.CLASSIC,
};

export function findEventThemePresetByColors(page: string, primary: string) {
  const pageHex = page.toLowerCase();
  const primaryHex = primary.toLowerCase();
  return EVENT_THEME_PRESETS.find(
    (preset) => preset.tokens.page === pageHex && preset.tokens.primary === primaryHex,
  );
}

export function isEventThemePreset(value: unknown): value is EventThemePreset {
  return typeof value === "string" && Object.values(EventThemePreset).includes(value as EventThemePreset);
}

export function isEventFontStyle(value: unknown): value is EventFontStyle {
  return typeof value === "string" && Object.values(EventFontStyle).includes(value as EventFontStyle);
}

export function resolveEventFontStyle(theme: EventTheme = DEFAULT_EVENT_THEME): EventFontStyle {
  return isEventFontStyle(theme.fontStyle) ? theme.fontStyle : EventFontStyle.SANS;
}

export function resolveEventFontStack(theme: EventTheme = DEFAULT_EVENT_THEME) {
  return FONT_STACK[resolveEventFontStyle(theme)];
}

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

export function normalizeHexColor(value: string) {
  const trimmed = value.trim();
  if (!isHexColor(trimmed)) {
    throw new Error("Color must be #RRGGBB");
  }
  return trimmed.toLowerCase();
}

function channelToLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string) {
  const normalized = normalizeHexColor(hex).slice(1);
  const red = channelToLinear(Number.parseInt(normalized.slice(0, 2), 16));
  const green = channelToLinear(Number.parseInt(normalized.slice(2, 4), 16));
  const blue = channelToLinear(Number.parseInt(normalized.slice(4, 6), 16));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function onColorForBackground(hex: string) {
  return relativeLuminance(hex) > 0.4 ? "#111111" : "#ffffff";
}

function clampByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function darkenHex(hex: string, amount = 0.1) {
  const normalized = normalizeHexColor(hex).slice(1);
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const factor = 1 - amount;
  return `#${clampByte(red * factor).toString(16).padStart(2, "0")}${clampByte(green * factor)
    .toString(16)
    .padStart(2, "0")}${clampByte(blue * factor).toString(16).padStart(2, "0")}`;
}

export function normalizeEventTheme(input: unknown): EventTheme {
  if (!input || typeof input !== "object") {
    return { ...DEFAULT_EVENT_THEME };
  }
  const raw = input as Record<string, unknown>;
  const presetId = isEventThemePreset(raw.presetId) ? raw.presetId : EventThemePreset.CLASSIC;
  const theme: EventTheme = { presetId };
  if (isHexColor(raw.page)) {
    theme.page = raw.page.toLowerCase();
  }
  if (isHexColor(raw.primary)) {
    theme.primary = raw.primary.toLowerCase();
  }
  if (typeof raw.backgroundUrl === "string" && raw.backgroundUrl.length > 0) {
    theme.backgroundUrl = raw.backgroundUrl;
  }
  if (isEventFontStyle(raw.fontStyle) && raw.fontStyle !== EventFontStyle.SANS) {
    theme.fontStyle = raw.fontStyle;
  }
  return theme;
}

export function resolveEventBrandSurfaceStyle(
  theme: EventTheme = DEFAULT_EVENT_THEME,
): Record<string, string> {
  const tokens = resolveEventThemeTokens(theme);
  const cssVars = resolveEventThemeCssVars(theme);
  const titleColor = theme.backgroundUrl ? tokens.ink : onColorForBackground(tokens.page);
  if (!theme.backgroundUrl) {
    return {
      ...cssVars,
      background: tokens.page,
      color: tokens.body,
      "--album-title": titleColor,
    };
  }
  return {
    ...cssVars,
    backgroundColor: tokens.page,
    backgroundImage: `url(${JSON.stringify(theme.backgroundUrl)})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: tokens.body,
    "--album-title": titleColor,
  };
}

export function resolveEventThemeTokens(theme: EventTheme = DEFAULT_EVENT_THEME): EventThemeTokens {
  const base = PRESET_BASE[theme.presetId] ?? PRESET_BASE[EventThemePreset.CLASSIC];
  const page = theme.page && isHexColor(theme.page) ? theme.page.toLowerCase() : base.page;
  const primary =
    theme.primary && isHexColor(theme.primary) ? theme.primary.toLowerCase() : base.primary;
  return {
    ...base,
    page,
    primary,
    primaryPressed: darkenHex(primary, 0.1),
    onPrimary: onColorForBackground(primary),
  };
}

export function resolveEventThemeCssVars(
  theme: EventTheme = DEFAULT_EVENT_THEME,
): Record<string, string> {
  const tokens = resolveEventThemeTokens(theme);
  return {
    "--color-page": tokens.page,
    "--color-primary": tokens.primary,
    "--color-primary-pressed": tokens.primaryPressed,
    "--color-on-primary": tokens.onPrimary,
    "--color-canvas": tokens.canvas,
    "--color-card": tokens.card,
    "--color-ink": tokens.ink,
    "--color-ink-soft": tokens.ink,
    "--color-body": tokens.body,
    "--color-mute": tokens.mute,
    "--color-secondary": tokens.secondary,
    "--color-secondary-pressed": tokens.secondaryPressed,
    "--color-hairline": tokens.hairline,
    "--color-hairline-soft": tokens.hairlineSoft,
    "--color-charcoal": tokens.ink,
    "--font-album": resolveEventFontStack(theme),
  };
}

export function parseThemeFromForm(formData: FormData): EventTheme {
  const presetRaw = String(formData.get("presetId") ?? "");
  if (!isEventThemePreset(presetRaw)) {
    throw new Error("Invalid preset");
  }
  const theme: EventTheme = { presetId: presetRaw };
  const pageRaw = String(formData.get("page") ?? "").trim();
  const primaryRaw = String(formData.get("primary") ?? "").trim();
  const base = PRESET_BASE[presetRaw];
  if (pageRaw) {
    const page = normalizeHexColor(pageRaw);
    if (page !== base.page) {
      theme.page = page;
    }
  }
  if (primaryRaw) {
    const primary = normalizeHexColor(primaryRaw);
    if (primary !== base.primary) {
      theme.primary = primary;
    }
  }
  const fontRaw = String(formData.get("fontStyle") ?? "");
  if (isEventFontStyle(fontRaw) && fontRaw !== EventFontStyle.SANS) {
    theme.fontStyle = fontRaw;
  }
  return theme;
}
