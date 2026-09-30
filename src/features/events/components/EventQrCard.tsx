"use client";

import { ArrowSquareOut, Check, Copy, DownloadSimple } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export function EventQrCard({
  qrDataUrl,
  guestUrl,
}: {
  qrDataUrl: string;
  guestUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  let albumPath = guestUrl;
  try {
    albumPath = new URL(guestUrl).pathname;
  } catch {
    albumPath = guestUrl;
  }

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(guestUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="flex w-full flex-col gap-4 rounded-md bg-card p-5">
      <div className="pin mx-auto w-fit bg-canvas p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR code for the guest album" width={180} height={180} />
      </div>
      <p className="text-base text-mute">Guests scan this to add photos.</p>
      <p className="break-all text-sm text-mute">{albumPath}</p>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={copyLink} className="btn-primary w-full gap-2">
          {copied ? (
            <Check size={16} weight="bold" aria-hidden="true" />
          ) : (
            <Copy size={16} weight="bold" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
        <a href={guestUrl} target="_blank" rel="noreferrer" className="btn-secondary w-full gap-2">
          <ArrowSquareOut size={16} weight="bold" aria-hidden="true" />
          Open album
        </a>
        <a href={qrDataUrl} download="ladybug-qr.png" className="btn-secondary w-full gap-2">
          <DownloadSimple size={16} weight="bold" aria-hidden="true" />
          Download QR
        </a>
      </div>
    </section>
  );
}
