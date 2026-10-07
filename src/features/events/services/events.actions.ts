"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHost } from "@/features/auth/services/auth.service";
import {
  getMediaKind,
  hasAllowedMediaMagic,
  rejectMediaReason,
} from "@/features/photos/helpers/photos.helpers";
import { uploadImageKitFile } from "@/server/imagekit";
import {
  assertEventCreateRateLimit,
  assertHostMutationRateLimit,
  assertHostUploadRateLimit,
} from "@/server/rate-limit";
import { parseThemeFromForm } from "../helpers/event-theme.helpers";
import { normalizeDriveUrl, publicEventError } from "../helpers/events.helpers";
import {
  clearEventBackground,
  createEvent,
  setEventBackground,
  setEventDriveUrl,
  updateEventTheme,
} from "./events.service";

export async function createEventAction(_previous: { error: string } | null, formData: FormData) {
  const host = await getHost();
  if (!host) {
    redirect("/login");
  }
  let event;
  try {
    await assertEventCreateRateLimit(host.id);
    event = await createEvent(host.id, String(formData.get("name") ?? ""));
  } catch (caughtError) {
    return { error: publicEventError(caughtError, "Could not create event") };
  }
  redirect(`/events/${event.id}`);
}

export async function updateEventThemeAction(
  _previous: { error: string } | { saved: true } | null,
  formData: FormData,
) {
  const host = await getHost();
  if (!host) {
    redirect("/login");
  }
  const eventId = String(formData.get("eventId") ?? "");
  try {
    await assertHostMutationRateLimit(host.id);
    const theme = parseThemeFromForm(formData);
    const event = await updateEventTheme(host.id, eventId, theme);
    revalidatePath(`/events/${event.id}`);
    revalidatePath(`/event/${event.guestSlug}`);
    return { saved: true as const };
  } catch (caughtError) {
    return { error: publicEventError(caughtError, "Could not save look") };
  }
}

export async function updateEventDriveUrlAction(
  _previous: { error: string } | null,
  formData: FormData,
) {
  const host = await getHost();
  if (!host) {
    redirect("/login");
  }
  const eventId = String(formData.get("eventId") ?? "");
  try {
    await assertHostMutationRateLimit(host.id);
    const driveUrl = normalizeDriveUrl(String(formData.get("driveUrl") ?? ""));
    const event = await setEventDriveUrl(host.id, eventId, driveUrl);
    revalidatePath(`/events/${event.id}`);
    revalidatePath(`/event/${event.guestSlug}`);
    return null;
  } catch (caughtError) {
    return { error: publicEventError(caughtError, "Could not save Drive link") };
  }
}

export async function uploadEventBackgroundAction(formData: FormData) {
  const host = await getHost();
  if (!host) {
    throw new Error("Unauthorized");
  }
  const eventId = String(formData.get("eventId") ?? "");
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Unsupported file type.");
  }
  const rejectReason = rejectMediaReason(file);
  if (rejectReason) {
    throw new Error(rejectReason);
  }
  if (getMediaKind(file) !== "IMAGE") {
    throw new Error("Background must be an image.");
  }
  if (!(await hasAllowedMediaMagic(file))) {
    throw new Error("Unsupported file type.");
  }
  await assertHostUploadRateLimit(host.id);
  const uploaded = await uploadImageKitFile(file);
  const event = await setEventBackground(host.id, eventId, {
    url: uploaded.url,
    fileId: uploaded.fileId,
  });
  revalidatePath(`/events/${event.id}`);
  revalidatePath(`/event/${event.guestSlug}`);
  return event.theme;
}

export async function clearEventBackgroundAction(eventId: string) {
  const host = await getHost();
  if (!host) {
    throw new Error("Unauthorized");
  }
  await assertHostMutationRateLimit(host.id);
  const event = await clearEventBackground(host.id, eventId);
  revalidatePath(`/events/${event.id}`);
  revalidatePath(`/event/${event.guestSlug}`);
  return event.theme;
}
