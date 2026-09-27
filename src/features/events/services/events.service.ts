"use server";

import { ObjectId, type WithId } from "mongodb";
import { redirect } from "next/navigation";
import { getHost } from "@/features/auth/services/auth.service";
import { ensureIndexes, getCollection } from "@/server/db";
import type { Event } from "@/shared/types";
import { createGuestSlug, normalizeEventName } from "../helpers/events.helpers";

type EventDoc = {
  hostId: ObjectId;
  name: string;
  guestSlug: string;
  createdAt: Date;
};

function events() {
  return getCollection<EventDoc>("events");
}

function serializeEvent(doc: WithId<EventDoc>): Event {
  return {
    id: doc._id.toString(),
    hostId: doc.hostId.toString(),
    name: doc.name,
    guestSlug: doc.guestSlug,
    createdAt: doc.createdAt.toISOString(),
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
  const result = await events().insertOne({
    hostId: new ObjectId(hostId),
    name: normalized,
    guestSlug,
    createdAt,
  });
  return serializeEvent({
    _id: result.insertedId,
    hostId: new ObjectId(hostId),
    name: normalized,
    guestSlug,
    createdAt,
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
  if (!guestSlug) {
    return null;
  }
  await ensureIndexes();
  const doc = await events().findOne({ guestSlug });
  return doc ? serializeEvent(doc) : null;
}

export async function createEventAction(_previous: { error: string } | null, formData: FormData) {
  const host = await getHost();
  if (!host) {
    redirect("/login");
  }
  let event;
  try {
    event = await createEvent(host.id, String(formData.get("name") ?? ""));
  } catch (caughtError) {
    return { error: caughtError instanceof Error ? caughtError.message : "Could not create event" };
  }
  redirect(`/events/${event.id}`);
}
