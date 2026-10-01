import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHost } from "@/features/auth/services/auth.service";
import { EventAlbumHero } from "@/features/events/components/EventAlbumHero";
import { resolveEventBrandSurfaceStyle } from "@/features/events/helpers/event-theme.helpers";
import { getEventByGuestSlug } from "@/features/events/services/events.service";
import { PhotoAlbum } from "@/features/photos/components/PhotoAlbum";
import { formatPhotoCount } from "@/features/photos/helpers/photos.helpers";
import { listPhotos } from "@/features/photos/services/photos.service";

type GuestAlbumPageProps = {
  params: Promise<{ guestSlug: string }>;
};

export async function generateMetadata({ params }: GuestAlbumPageProps): Promise<Metadata> {
  const { guestSlug } = await params;
  const event = await getEventByGuestSlug(guestSlug);
  return {
    title: event ? `${event.name} · Ladybug` : "Album · Ladybug",
  };
}

export default async function GuestAlbumPage({ params }: GuestAlbumPageProps) {
  const { guestSlug } = await params;
  const event = await getEventByGuestSlug(guestSlug);
  if (!event) {
    notFound();
  }
  const [photos, host] = await Promise.all([listPhotos(event.id), getHost()]);
  const hostCanDelete = host?.id === event.hostId;
  const brandStyle = resolveEventBrandSurfaceStyle(event.theme) as CSSProperties;

  return (
    <div
      className="event-brand relative -mt-20 flex min-h-[100dvh] flex-1 flex-col pt-20"
      style={brandStyle}
    >
      <main className="w-full px-4 py-12 md:px-6">
        <div className="event-album-shell mx-auto flex w-full flex-col gap-10">
          <EventAlbumHero name={event.name} />
          <section className="event-album-well">
            <PhotoAlbum
              guestSlug={event.guestSlug}
              eventId={hostCanDelete ? event.id : undefined}
              canDelete={hostCanDelete}
              heading={formatPhotoCount(photos.length)}
              photos={photos}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
