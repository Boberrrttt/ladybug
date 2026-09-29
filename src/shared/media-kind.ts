export const MediaKind = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
} as const;

export type MediaKind = (typeof MediaKind)[keyof typeof MediaKind];
