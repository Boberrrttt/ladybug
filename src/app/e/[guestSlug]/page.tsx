import { notFound, redirect } from "next/navigation";
import { isGuestSlug } from "@/features/events/helpers/events.helpers";

export default async function LegacyGuestAlbumPage({
  params,
}: {
  params: Promise<{ guestSlug: string }>;
}) {
  const { guestSlug } = await params;
  if (!isGuestSlug(guestSlug)) {
    notFound();
  }
  redirect(`/event/${guestSlug}`);
}
