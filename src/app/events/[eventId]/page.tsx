import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getHost } from "@/features/auth/services/auth.service";
import { EventQrCard } from "@/features/events/components/EventQrCard";
import { getHostEvent } from "@/features/events/services/events.service";
import { PhotoGrid } from "@/features/photos/components/PhotoGrid";
import { PhotoUploader } from "@/features/photos/components/PhotoUploader";
import { listPhotos } from "@/features/photos/services/photos.service";
import { toDataUrl } from "@/features/qr/helpers/qr.helpers";

export default async function HostEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const host = await getHost();
  if (!host) {
    redirect("/login");
  }
  const { eventId } = await params;
  const event = await getHostEvent(host.id, eventId);
  if (!event) {
    notFound();
  }

  const origin =
    process.env.APP_ORIGIN?.replace(/\/$/, "") ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "");
  if (!origin) {
    throw new Error("APP_ORIGIN is not set");
  }
  const guestUrl = `${origin}/event/${event.guestSlug}`;
  const [qrDataUrl, photos] = await Promise.all([toDataUrl(guestUrl), listPhotos(event.id)]);

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-6 py-12">
      <div>
        <p className="text-sm">
          <Link href="/events" className="font-semibold text-ink-soft">
            Events
          </Link>
        </p>
        <h1 className="heading-xl text-ink">{event.name}</h1>
      </div>
      <EventQrCard qrDataUrl={qrDataUrl} guestUrl={guestUrl} />
      <PhotoUploader eventId={event.id} />
      <PhotoGrid photos={photos} canDelete />
    </main>
  );
}
