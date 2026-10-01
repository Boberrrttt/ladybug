import "server-only";

import { ObjectId, type WithId } from "mongodb";
import { deleteImageKitFile } from "@/server/imagekit";
import { ensureIndexes, getCollection } from "@/server/db";
import type { Event, EventTheme } from "@/shared/types";
import { isImageKitUrl } from "@/features/photos/helpers/photos.helpers";
import { normalizeEventTheme } from "../helpers/event-theme.helpers";
import { createGuestSlug, isGuestSlug, normalizeEventName, readDriveUrl } from "../helpers/events.helpers";

type EventThemeDoc = EventTheme & {
  backgroundFileId?: string;
};

type EventDoc = {
  hostId: ObjectId;
  name: string;
  guestSlug: string;
  createdAt: Date;
  theme?: EventThemeDoc;
  driveUrl?: string;
};

function events() {
  return getCollection<EventDoc>("events");
}

function serializeTheme(theme: EventThemeDoc | undefined): EventTheme {
  const normalized = normalizeEventTheme(theme);
  if (normalized.backgroundUrl && !isImageKitUrl(normalized.backgroundUrl)) {
    const { backgroundUrl: _dropped, ...rest } = normalized;
    return rest;
  }
  return normalized;
}

function serializeEvent(doc: WithId<EventDoc>): Event {
  const driveUrl = readDriveUrl(doc.driveUrl);
  return {
    id: doc._id.toString(),
    hostId: doc.hostId.toString(),
    name: doc.name,
    guestSlug: doc.guestSlug,
    createdAt: doc.createdAt.toISOString(),
    theme: serializeTheme(doc.theme),
    ...(driveUrl ? { driveUrl } : {}),
  };
}

export async function createEvent(hostId: string, name: string) {
  const normalized = normalizeEventName(name);
  if (!normalized || normalized.length > 80) {
    throw new Error("Event name must be 1–80 characters");
  }
  if (!ObjectId.isValid(hostId)) {
    throw new Error("Invalid host");
  }
  await ensureIndexes();
  const createdAt = new Date();
  const guestSlug = createGuestSlug();
  const theme = normalizeEventTheme(undefined);
  const result = await events().insertOne({
    hostId: new ObjectId(hostId),
    name: normalized,
    guestSlug,
    createdAt,
    theme,
  });
  return serializeEvent({
    _id: result.insertedId,
    hostId: new ObjectId(hostId),
    name: normalized,
    guestSlug,
    createdAt,
    theme,
  });
}

export async function listEvents(hostId: string) {
  if (!ObjectId.isValid(hostId)) {
    return [];
  }
  await ensureIndexes();
  const docs = await events()
    .find({ hostId: new ObjectId(hostId) })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(serializeEvent);
}

export async function getHostEvent(hostId: string, eventId: string) {
  if (!ObjectId.isValid(hostId) || !ObjectId.isValid(eventId)) {
    return null;
  }
  await ensureIndexes();
  const doc = await events().findOne({
    _id: new ObjectId(eventId),
    hostId: new ObjectId(hostId),
  });
  return doc ? serializeEvent(doc) : null;
}

export async function getEventByGuestSlug(guestSlug: string) {
  if (typeof guestSlug !== "string" || !isGuestSlug(guestSlug)) {
    return null;
  }
  await ensureIndexes();
  const doc = await events().findOne({ guestSlug });
  return doc ? serializeEvent(doc) : null;
}

export async function updateEventTheme(hostId: string, eventId: string, theme: EventTheme) {
  if (!ObjectId.isValid(hostId) || !ObjectId.isValid(eventId)) {
    throw new Error("Event not found");
  }
  await ensureIndexes();
  const existing = await events().findOne({
    _id: new ObjectId(eventId),
    hostId: new ObjectId(hostId),
  });
  if (!existing) {
    throw new Error("Event not found");
  }
  const nextTheme: EventThemeDoc = {
    ...normalizeEventTheme(theme),
  };
  if (existing.theme?.backgroundUrl && existing.theme.backgroundFileId) {
    nextTheme.backgroundUrl = existing.theme.backgroundUrl;
    nextTheme.backgroundFileId = existing.theme.backgroundFileId;
  }
  const result = await events().findOneAndUpdate(
    { _id: new ObjectId(eventId), hostId: new ObjectId(hostId) },
    { $set: { theme: nextTheme } },
    { returnDocument: "after" },
  );
  if (!result) {
    throw new Error("Event not found");
  }
  return serializeEvent(result);
}

export async function setEventBackground(
  hostId: string,
  eventId: string,
  background: { url: string; fileId: string },
) {
  if (!ObjectId.isValid(hostId) || !ObjectId.isValid(eventId)) {
    throw new Error("Event not found");
  }
  if (!isImageKitUrl(background.url) || !background.fileId) {
    throw new Error("Invalid background image");
  }
  await ensureIndexes();
  const existing = await events().findOne({
    _id: new ObjectId(eventId),
    hostId: new ObjectId(hostId),
  });
  if (!existing) {
    throw new Error("Event not found");
  }
  const previousFileId = existing.theme?.backgroundFileId;
  const baseTheme = normalizeEventTheme(existing.theme);
  const nextTheme: EventThemeDoc = {
    ...baseTheme,
    backgroundUrl: background.url,
    backgroundFileId: background.fileId,
  };
  const result = await events().findOneAndUpdate(
    { _id: new ObjectId(eventId), hostId: new ObjectId(hostId) },
    { $set: { theme: nextTheme } },
    { returnDocument: "after" },
  );
  if (!result) {
    throw new Error("Event not found");
  }
  if (previousFileId && previousFileId !== background.fileId) {
    try {
      await deleteImageKitFile(previousFileId);
    } catch {
      // Best-effort cleanup; new background already saved.
    }
  }
  return serializeEvent(result);
}

export async function setEventDriveUrl(hostId: string, eventId: string, driveUrl: string | null) {
  if (!ObjectId.isValid(hostId) || !ObjectId.isValid(eventId)) {
    throw new Error("Event not found");
  }
  await ensureIndexes();
  const result = await events().findOneAndUpdate(
    { _id: new ObjectId(eventId), hostId: new ObjectId(hostId) },
    driveUrl ? { $set: { driveUrl } } : { $unset: { driveUrl: "" } },
    { returnDocument: "after" },
  );
  if (!result) {
    throw new Error("Event not found");
  }
  return serializeEvent(result);
}

export async function clearEventBackground(hostId: string, eventId: string) {
  if (!ObjectId.isValid(hostId) || !ObjectId.isValid(eventId)) {
    throw new Error("Event not found");
  }
  await ensureIndexes();
  const existing = await events().findOne({
    _id: new ObjectId(eventId),
    hostId: new ObjectId(hostId),
  });
  if (!existing) {
    throw new Error("Event not found");
  }
  const previousFileId = existing.theme?.backgroundFileId;
  const nextTheme = normalizeEventTheme(existing.theme);
  delete nextTheme.backgroundUrl;
  const result = await events().findOneAndUpdate(
    { _id: new ObjectId(eventId), hostId: new ObjectId(hostId) },
    { $set: { theme: nextTheme } },
    { returnDocument: "after" },
  );
  if (!result) {
    throw new Error("Event not found");
  }
  if (previousFileId) {
    try {
      await deleteImageKitFile(previousFileId);
    } catch {
      // Best-effort cleanup.
    }
  }
  return serializeEvent(result);
}
