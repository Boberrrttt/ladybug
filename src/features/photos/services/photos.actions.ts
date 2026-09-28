"use server";

import { revalidatePath } from "next/cache";
import { getHost } from "@/features/auth/services/auth.service";
import { getEventByGuestSlug, getHostEvent } from "@/features/events/services/events.service";
import {
  assertGuestUploadRateLimit,
  assertHostUploadRateLimit,
} from "@/server/rate-limit";
import { uploadImageKitFile } from "@/server/imagekit";
import { PhotoSource } from "@/shared/enums";
import { isGuestSlug } from "@/features/events/helpers/events.helpers";
import { hasAllowedImageMagic, isAllowedImageFile, MAX_PHOTOS_PER_EVENT } from "../helpers/photos.helpers";
import { countPhotos, deletePhoto, savePhoto } from "./photos.service";

export async function uploadPhotoAction(formData: FormData) {
  const file = formData.get("file");
  const guestSlug = formData.get("guestSlug");
  const eventId = String(formData.get("eventId") ?? "");
  if (!(file instanceof File) || !isAllowedImageFile(file) || !(await hasAllowedImageMagic(file))) {
    throw new Error("Images only, max 15MB");
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
  if ((await countPhotos(event.id)) >= MAX_PHOTOS_PER_EVENT) {
    throw new Error("Album is full");
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

export async function deletePhotoAction(formData: FormData) {
  const host = await getHost();
  if (!host) {
    throw new Error("Unauthorized");
  }
  const event = await deletePhoto(host.id, String(formData.get("photoId") ?? ""));
  revalidatePath(`/events/${event.id}`);
  revalidatePath(`/event/${event.guestSlug}`);
}
