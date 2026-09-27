import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventByGuestSlug } from "@/features/events/services/events.service";
import { PhotoGrid } from "@/features/photos/components/PhotoGrid";
import { PhotoUploader } from "@/features/photos/components/PhotoUploader";
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
  const photos = await listPhotos(event.id);

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 py-12">
      <h1 className="heading-xl text-ink">{event.name}</h1>
      <PhotoUploader guestSlug={event.guestSlug} />
      <PhotoGrid photos={photos} />
    </main>
  );
}
