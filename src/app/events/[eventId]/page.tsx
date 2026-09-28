import { CaretLeft } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getHost } from "@/features/auth/services/auth.service";
import { EventQrCard } from "@/features/events/components/EventQrCard";
import { getHostEvent } from "@/features/events/services/events.service";
import { PhotoGrid } from "@/features/photos/components/PhotoGrid";
import { PhotoUploader } from "@/features/photos/components/PhotoUploader";
import { formatPhotoCount } from "@/features/photos/helpers/photos.helpers";
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
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 pb-16 pt-8">
      <div>
        <p className="mb-3">
          <Link href="/events" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft">
            <CaretLeft size={16} weight="bold" aria-hidden="true" />
            Events
          </Link>
        </p>
        <h1 className="heading-xl text-ink">{event.name}</h1>
      </div>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[16rem_1fr]">
        <EventQrCard qrDataUrl={qrDataUrl} guestUrl={guestUrl} />
        <section className="flex min-w-0 flex-col gap-4">
          <PhotoUploader eventId={event.id} heading={formatPhotoCount(photos.length)} />
          <PhotoGrid photos={photos} canDelete />
        </section>
      </div>
    </main>
  );
}
