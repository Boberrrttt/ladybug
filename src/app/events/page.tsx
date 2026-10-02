import { redirect } from "next/navigation";
import { getHost } from "@/features/auth/services/auth.service";
import { EventsIndex } from "@/features/events/components/EventsIndex";
import { resolveEventThemeTokens } from "@/features/events/helpers/event-theme.helpers";
import { formatEventDate } from "@/features/events/helpers/events.helpers";
import { listEvents } from "@/features/events/services/events.service";
import { countPhotosByEvent } from "@/features/photos/services/photos.service";

export default async function EventsPage() {
  const host = await getHost();
  if (!host) {
    redirect("/login");
  }
  const events = await listEvents(host.id);
  const photoCounts = await countPhotosByEvent(events.map((event) => event.id));

  return (
    <EventsIndex
      events={events.map((event) => ({
        id: event.id,
        name: event.name,
        createdAt: event.createdAt,
        createdLabel: formatEventDate(event.createdAt),
        accent: resolveEventThemeTokens(event.theme).primary,
        coverUrl: event.theme.backgroundUrl,
        photoCount: photoCounts.get(event.id) ?? 0,
      }))}
    />
  );
}
