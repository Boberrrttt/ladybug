import "server-only";

import { MongoServerError, ObjectId, type WithId } from "mongodb";
import { ensureIndexes, getCollection } from "@/server/db";
import { deleteImageKitFile } from "@/server/imagekit";
import { PhotoSource } from "@/shared/enums";
import { MediaKind } from "@/shared/media-kind";
import type { Photo } from "@/shared/types";
import {
  isImageKitUrl,
  MAX_EVENT_UPLOAD_BYTES,
  MAX_PHOTOS_PER_EVENT,
  uploadBudgetError,
} from "../helpers/photos.helpers";

type PhotoDoc = {
  eventId: ObjectId;
  url: string;
  fileId: string;
  filePath: string;
  createdAt: Date;
  source: PhotoSource;
  mediaKind?: MediaKind;
  byteSize?: number;
  deletedAt?: Date;
};

type UploadBudgetDoc = {
  _id: ObjectId;
  count: number;
  bytes: number;
};

function photos() {
  return getCollection<PhotoDoc>("photos");
}

function uploadBudgets() {
  return getCollection<UploadBudgetDoc>("uploadBudgets");
}

function budgetBytes(byteSize: number) {
  return Number.isFinite(byteSize) && byteSize > 0 ? byteSize : 0;
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
  byteSize: number;
}) {
  if (
    !ObjectId.isValid(input.eventId) ||
    !input.fileId ||
    !isImageKitUrl(input.url) ||
    !Number.isFinite(input.byteSize) ||
    input.byteSize <= 0
  ) {
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
    byteSize: input.byteSize,
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
    byteSize: input.byteSize,
  });
}

export async function countPhotos(eventId: string) {
  if (!ObjectId.isValid(eventId)) {
    return 0;
  }
  await ensureIndexes();
  return photos().countDocuments({ eventId: new ObjectId(eventId), ...ACTIVE_PHOTO });
}

async function ensureUploadBudget(eventId: ObjectId) {
  const existing = await uploadBudgets().findOne({ _id: eventId });
  if (existing) {
    return;
  }
  const count = await photos().countDocuments({ eventId, ...ACTIVE_PHOTO });
  const bytes = await sumPhotoBytes(eventId.toString());
  try {
    await uploadBudgets().insertOne({ _id: eventId, count, bytes });
  } catch (caughtError) {
    if (!(caughtError instanceof MongoServerError) || caughtError.code !== 11000) {
      throw caughtError;
    }
  }
}

export async function reserveUploadBudget(eventId: string, byteSize: number) {
  if (!ObjectId.isValid(eventId)) {
    throw new Error("Event not found");
  }
  const bytes = budgetBytes(byteSize);
  await ensureIndexes();
  const id = new ObjectId(eventId);
  await ensureUploadBudget(id);
  // NEXT-DOS-001: one conditional update so parallel uploads cannot all pass a prior count.
  const reserved = await uploadBudgets().findOneAndUpdate(
    {
      _id: id,
      count: { $lt: MAX_PHOTOS_PER_EVENT },
      bytes: { $lte: MAX_EVENT_UPLOAD_BYTES - bytes },
    },
    { $inc: { count: 1, bytes } },
  );
  if (reserved) {
    return;
  }
  const current = await uploadBudgets().findOne({ _id: id });
  throw new Error(uploadBudgetError(current?.count ?? 0, current?.bytes ?? 0, bytes));
}

export async function releaseUploadBudget(eventId: string, byteSize: number) {
  if (!ObjectId.isValid(eventId)) {
    return;
  }
  const bytes = budgetBytes(byteSize);
  await ensureIndexes();
  await uploadBudgets().updateOne({ _id: new ObjectId(eventId) }, [
    {
      $set: {
        count: { $max: [0, { $subtract: [{ $ifNull: ["$count", 0] }, 1] }] },
        bytes: { $max: [0, { $subtract: [{ $ifNull: ["$bytes", 0] }, bytes] }] },
      },
    },
  ]);
}

export async function sumPhotoBytes(eventId: string) {
  if (!ObjectId.isValid(eventId)) {
    return 0;
  }
  await ensureIndexes();
  const [aggregate] = await photos()
    .aggregate<{ totalBytes: number }>([
      { $match: { eventId: new ObjectId(eventId), ...ACTIVE_PHOTO } },
      {
        $group: {
          _id: null,
          totalBytes: { $sum: { $ifNull: ["$byteSize", 0] } },
        },
      },
    ])
    .toArray();
  return aggregate?.totalBytes ?? 0;
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
    await releaseUploadBudget(eventId, photo.byteSize ?? 0);
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
    await reserveUploadBudget(eventId, photo.byteSize ?? 0);
    try {
      await photos().updateOne({ _id: photo._id }, { $unset: { deletedAt: "" } });
    } catch (caughtError) {
      await releaseUploadBudget(eventId, photo.byteSize ?? 0);
      throw caughtError;
    }
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
