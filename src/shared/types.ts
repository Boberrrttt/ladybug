import type { EventTheme } from "./event-theme";
import type { PhotoSource } from "./enums";
import type { MediaKind } from "./media-kind";

export type { EventTheme, EventThemePreset } from "./event-theme";

export type User = {
  id: string;
  email: string;
  createdAt: string;
  tokenVersion: number;
};

export type Event = {
  id: string;
  hostId: string;
  name: string;
  guestSlug: string;
  createdAt: string;
  theme: EventTheme;
  driveUrl?: string;
};

export type Photo = {
  id: string;
  eventId: string;
  url: string;
  createdAt: string;
  source: PhotoSource;
  mediaKind: MediaKind;
};
