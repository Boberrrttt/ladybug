"use server";

import { revalidatePath } from "next/cache";
import { getHost } from "@/features/auth/services/auth.service";
import { getEventByGuestSlug, getHostEvent } from "@/features/events/services/events.service";
import {
  assertGuestUploadRateLimit,
  assertHostMutationRateLimit,
  assertHostUploadRateLimit,
} from "@/server/rate-limit";
import { uploadImageKitFile } from "@/server/imagekit";
import { PhotoSource } from "@/shared/enums";
import { isGuestSlug } from "@/features/events/helpers/events.helpers";
import { getMediaKind, hasAllowedMediaMagic, rejectMediaReason } from "../helpers/photos.helpers";
import {
  purgePhotos,
  releaseUploadBudget,
  reserveUploadBudget,
  restorePhotos,
  savePhoto,
  softDeletePhotos,
} from "./photos.service";

export async function uploadPhotoAction(formData: FormData) {
  const file = formData.get("file");
  const guestSlug = formData.get("guestSlug");
  const eventId = String(formData.get("eventId") ?? "");
  if (!(file instanceof File)) {
    throw new Error("Unsupported file type.");
  }
  const rejectReason = rejectMediaReason(file);
  if (rejectReason) {
    throw new Error(rejectReason);
  }
  if (!(await hasAllowedMediaMagic(file))) {
    throw new Error("Unsupported file type.");
  }
  const mediaKind = getMediaKind(file);
  if (!mediaKind) {
    throw new Error("Unsupported file type.");
  }

  let event = null;
  let source = PhotoSource.GUEST;
  if (isGuestSlug(guestSlug)) {
    await assertGuestUploadRateLimit(guestSlug);
    event = await getEventByGuestSlug(guestSlug);
  } else if (eventId) {
    const host = await getHost();
    if (!host) {
      throw new Error("Unauthorized");
    }
    await assertHostUploadRateLimit(host.id);
    event = await getHostEvent(host.id, eventId);
    source = PhotoSource.HOST;
  }
  if (!event) {
    throw new Error("Event not found");
  }
  await reserveUploadBudget(event.id, file.size);
  let photo;
  try {
    const uploaded = await uploadImageKitFile(file);
    photo = await savePhoto({
      eventId: event.id,
      url: uploaded.url,
      fileId: uploaded.fileId,
      filePath: uploaded.filePath,
      source,
      mediaKind,
      byteSize: file.size,
    });
  } catch (caughtError) {
    await releaseUploadBudget(event.id, file.size);
    throw caughtError;
  }
  revalidatePath(`/event/${event.guestSlug}`);
  revalidatePath(`/events/${event.id}`);
  return photo;
}

export async function deletePhotosAction(photoIds: string[], eventId?: string) {
  const event = await resolveHostEvent(eventId);
  const uniqueIds = [...new Set(photoIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    throw new Error("Nothing to delete");
  }
  await softDeletePhotos(event.id, uniqueIds);
  revalidatePath(`/events/${event.id}`);
  revalidatePath(`/event/${event.guestSlug}`);
  return uniqueIds;
}

export async function restorePhotosAction(photoIds: string[], eventId?: string) {
  const event = await resolveHostEvent(eventId);
  const uniqueIds = [...new Set(photoIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    throw new Error("Nothing to restore");
  }
  await restorePhotos(event.id, uniqueIds);
  revalidatePath(`/events/${event.id}`);
  revalidatePath(`/event/${event.guestSlug}`);
}

export async function purgePhotosAction(photoIds: string[], eventId?: string) {
  const event = await resolveHostEvent(eventId);
  const uniqueIds = [...new Set(photoIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return;
  }
  await purgePhotos(event.id, uniqueIds);
  revalidatePath(`/events/${event.id}`);
  revalidatePath(`/event/${event.guestSlug}`);
}

async function resolveHostEvent(eventId: string | undefined) {
  const host = await getHost();
  if (!host || !eventId) {
    throw new Error("Unauthorized");
  }
  await assertHostMutationRateLimit(host.id);
  const event = await getHostEvent(host.id, eventId);
  if (!event) {
    throw new Error("Event not found");
  }
  return event;
}
