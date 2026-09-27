import { redirect } from "next/navigation";

export default async function LegacyGuestAlbumPage({
  params,
}: {
  params: Promise<{ guestSlug: string }>;
}) {
  const { guestSlug } = await params;
  redirect(`/event/${guestSlug}`);
}
