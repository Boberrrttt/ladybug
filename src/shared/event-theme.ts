export type EventThemePreset =
  | "CLASSIC"
  | "BLUSH"
  | "INK"
  | "FOREST"
  | "COBALT"
  | "SAND"
  | "MIDNIGHT";

export type EventFontStyle =
  | "SANS"
  | "ROUND"
  | "NARROW"
  | "SERIF"
  | "CLASSIC"
  | "DISPLAY"
  | "SLAB"
  | "ROMAN"
  | "SCRIPT"
  | "HAND"
  | "BRUSH"
  | "MONO";

export type EventTheme = {
  presetId: EventThemePreset;
  page?: string;
  primary?: string;
  backgroundUrl?: string;
  fontStyle?: EventFontStyle;
};
