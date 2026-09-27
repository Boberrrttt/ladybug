export function EventQrCard({
  qrDataUrl,
  guestUrl,
}: {
  qrDataUrl: string;
  guestUrl: string;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-md bg-card p-8 sm:flex-row sm:items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrDataUrl} alt="QR code for the guest album" width={240} height={240} />
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-base text-mute">Guests scan this code or open the link.</p>
        <a href={guestUrl} className="break-all font-semibold text-ink-soft">
          {guestUrl}
        </a>
      </div>
    </section>
  );
}
