"use server";

import { ObjectId, type WithId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getHost } from "@/features/auth/services/auth.service";
import { getEventByGuestSlug, getHostEvent } from "@/features/events/services/events.service";
import { ensureIndexes, getCollection } from "@/server/db";
import { deleteImageKitFile, uploadImageKitFile } from "@/server/imagekit";
import { PhotoSource } from "@/shared/enums";
import type { Photo } from "@/shared/types";
import { isImageFile, isImageKitUrl } from "../helpers/photos.helpers";

type PhotoDoc = {
  eventId: ObjectId;
  url: string;
  fileId: string;
  filePath: string;
  createdAt: Date;
  source: PhotoSource;
};

function photos() {
  return getCollection<PhotoDoc>("photos");
}

function serializePhoto(doc: WithId<PhotoDoc>): Photo {
  return {
    id: doc._id.toString(),
    eventId: doc.eventId.toString(),
    url: doc.url,
    fileId: doc.fileId,
    filePath: doc.filePath,
    createdAt: doc.createdAt.toISOString(),
    source: doc.source,
  };
}

export async function savePhoto(input: {
  eventId: string;
  url: string;
  fileId: string;
  filePath: string;
  source: PhotoSource;
}) {
  if (!ObjectId.isValid(input.eventId) || !input.fileId || !isImageKitUrl(input.url)) {
    throw new Error("Invalid photo");
  }
  await ensureIndexes();
  const createdAt = new Date();
  const result = await photos().insertOne({
    eventId: new ObjectId(input.eventId),
    url: input.url,
    fileId: input.fileId,
    filePath: input.filePath,
    createdAt,
    source: input.source,
  });
  return serializePhoto({
    _id: result.insertedId,
    eventId: new ObjectId(input.eventId),
    url: input.url,
    fileId: input.fileId,
    filePath: input.filePath,
    createdAt,
    source: input.source,
  });
}

export async function listPhotos(eventId: string) {
  if (!ObjectId.isValid(eventId)) {
    return [];
  }
  await ensureIndexes();
  const docs = await photos()
    .find({ eventId: new ObjectId(eventId) })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(serializePhoto);
}

export async function deletePhoto(hostId: string, photoId: string) {
  if (!ObjectId.isValid(photoId)) {
    throw new Error("Photo not found");
  }
  await ensureIndexes();
  const photo = await photos().findOne({ _id: new ObjectId(photoId) });
  if (!photo) {
    throw new Error("Photo not found");
  }
  const event = await getHostEvent(hostId, photo.eventId.toString());
  if (!event) {
    throw new Error("Photo not found");
  }
  await deleteImageKitFile(photo.fileId);
  await photos().deleteOne({ _id: photo._id });
  return event;
}

export async function uploadPhotoAction(formData: FormData) {
  const file = formData.get("file");
  const guestSlug = String(formData.get("guestSlug") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  if (!(file instanceof File) || !isImageFile(file)) {
    throw new Error("Images only, max 15MB");
  }

  let event = null;
  let source = PhotoSource.GUEST;
  if (guestSlug) {
    event = await getEventByGuestSlug(guestSlug);
  } else if (eventId) {
    const host = await getHost();
    if (!host) {
      throw new Error("Unauthorized");
    }
    event = await getHostEvent(host.id, eventId);
    source = PhotoSource.HOST;
  }
  if (!event) {
    throw new Error("Event not found");
  }

  const uploaded = await uploadImageKitFile(file);
  const photo = await savePhoto({
    eventId: event.id,
    url: uploaded.url,
    fileId: uploaded.fileId,
    filePath: uploaded.filePath,
    source,
  });
  revalidatePath(`/event/${event.guestSlug}`);
  revalidatePath(`/events/${event.id}`);
  return photo;
}

export async function deletePhotoAction(photoId: string) {
  const host = await getHost();
  if (!host) {
    throw new Error("Unauthorized");
  }
  const event = await deletePhoto(host.id, photoId);
  revalidatePath(`/events/${event.id}`);
  revalidatePath(`/event/${event.guestSlug}`);
}
