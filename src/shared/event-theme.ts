export type EventThemePreset =
  | "CLASSIC"
  | "BLUSH"
  | "INK"
  | "FOREST"
  | "COBALT"
  | "SAND"
  | "MIDNIGHT";

export type EventTheme = {
  presetId: EventThemePreset;
  page?: string;
  primary?: string;
  backgroundUrl?: string;
};
