"use server";

import { redirect } from "next/navigation";
import { getHost } from "@/features/auth/services/auth.service";
import { assertEventCreateRateLimit } from "@/server/rate-limit";
import { createEvent } from "./events.service";

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
    return { error: caughtError instanceof Error ? caughtError.message : "Could not create event" };
  }
  redirect(`/events/${event.id}`);
}
