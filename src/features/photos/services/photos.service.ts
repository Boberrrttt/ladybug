import "server-only";

import { ObjectId, type WithId } from "mongodb";
import { ensureIndexes, getCollection } from "@/server/db";
import { deleteImageKitFile } from "@/server/imagekit";
import { PhotoSource } from "@/shared/enums";
import { MediaKind } from "@/shared/media-kind";
import type { Photo } from "@/shared/types";
import { isImageKitUrl } from "../helpers/photos.helpers";

type PhotoDoc = {
  eventId: ObjectId;
  url: string;
  fileId: string;
  filePath: string;
  createdAt: Date;
  source: PhotoSource;
  mediaKind?: MediaKind;
  deletedAt?: Date;
};

function photos() {
  return getCollection<PhotoDoc>("photos");
}

const ACTIVE_PHOTO = { deletedAt: { $exists: false } } as const;

function serializePhoto(doc: WithId<PhotoDoc>): Photo {
  return {
    id: doc._id.toString(),
    eventId: doc.eventId.toString(),
    url: doc.url,
    createdAt: doc.createdAt.toISOString(),
    source: doc.source,
    mediaKind: doc.mediaKind ?? MediaKind.IMAGE,
  };
}

export async function savePhoto(input: {
  eventId: string;
  url: string;
  fileId: string;
  filePath: string;
  source: PhotoSource;
  mediaKind: MediaKind;
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
    mediaKind: input.mediaKind,
  });
  return serializePhoto({
    _id: result.insertedId,
    eventId: new ObjectId(input.eventId),
    url: input.url,
    fileId: input.fileId,
    filePath: input.filePath,
    createdAt,
    source: input.source,
    mediaKind: input.mediaKind,
  });
}

export async function countPhotos(eventId: string) {
  if (!ObjectId.isValid(eventId)) {
    return 0;
  }
  await ensureIndexes();
  return photos().countDocuments({ eventId: new ObjectId(eventId), ...ACTIVE_PHOTO });
}

async function purgeStaleSoftDeletes(eventId: ObjectId) {
  const cutoff = new Date(Date.now() - 60_000);
  const stale = await photos()
    .find({ eventId, deletedAt: { $exists: true, $lte: cutoff } })
    .toArray();
  for (const doc of stale) {
    await deleteImageKitFile(doc.fileId);
    await photos().deleteOne({ _id: doc._id });
  }
}

export async function listPhotos(eventId: string, options: { purgeExpiredDeletes?: boolean } = {}) {
  if (!ObjectId.isValid(eventId)) {
    return [];
  }
  await ensureIndexes();
  const eventObjectId = new ObjectId(eventId);
  if (options.purgeExpiredDeletes) {
    await purgeStaleSoftDeletes(eventObjectId);
  }
  const docs = await photos()
    .find({ eventId: eventObjectId, ...ACTIVE_PHOTO })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(serializePhoto);
}

async function assertEventPhoto(eventId: string, photoId: string) {
  if (!ObjectId.isValid(photoId) || !ObjectId.isValid(eventId)) {
    throw new Error("Photo not found");
  }
  await ensureIndexes();
  const photo = await photos().findOne({
    _id: new ObjectId(photoId),
    eventId: new ObjectId(eventId),
  });
  if (!photo) {
    throw new Error("Photo not found");
  }
  return photo;
}

export async function softDeletePhotos(eventId: string, photoIds: string[]) {
  const deletedAt = new Date();
  let touched = false;
  for (const photoId of photoIds) {
    const photo = await assertEventPhoto(eventId, photoId);
    if (photo.deletedAt) {
      continue;
    }
    await photos().updateOne({ _id: photo._id }, { $set: { deletedAt } });
    touched = true;
  }
  if (!touched) {
    throw new Error("Photo not found");
  }
}

export async function restorePhotos(eventId: string, photoIds: string[]) {
  let touched = false;
  for (const photoId of photoIds) {
    const photo = await assertEventPhoto(eventId, photoId);
    if (!photo.deletedAt) {
      continue;
    }
    await photos().updateOne({ _id: photo._id }, { $unset: { deletedAt: "" } });
    touched = true;
  }
  if (!touched) {
    throw new Error("Photo not found");
  }
}

export async function purgePhotos(eventId: string, photoIds: string[]) {
  for (const photoId of photoIds) {
    const photo = await assertEventPhoto(eventId, photoId);
    if (!photo.deletedAt) {
      continue;
    }
    await deleteImageKitFile(photo.fileId);
    await photos().deleteOne({ _id: photo._id });
  }
}
