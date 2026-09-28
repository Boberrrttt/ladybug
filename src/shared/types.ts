import type { PhotoSource } from "./enums";

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
};

export type Photo = {
  id: string;
  eventId: string;
  url: string;
  fileId: string;
  filePath: string;
  createdAt: string;
  source: PhotoSource;
};
