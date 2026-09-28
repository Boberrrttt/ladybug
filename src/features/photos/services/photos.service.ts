import "server-only";

import { ObjectId, type WithId } from "mongodb";
import { getHostEvent } from "@/features/events/services/events.service";
import { ensureIndexes, getCollection } from "@/server/db";
import { deleteImageKitFile } from "@/server/imagekit";
import { PhotoSource } from "@/shared/enums";
import type { Photo } from "@/shared/types";
import { isImageKitUrl } from "../helpers/photos.helpers";

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

export async function countPhotos(eventId: string) {
  if (!ObjectId.isValid(eventId)) {
    return 0;
  }
  await ensureIndexes();
  return photos().countDocuments({ eventId: new ObjectId(eventId) });
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
