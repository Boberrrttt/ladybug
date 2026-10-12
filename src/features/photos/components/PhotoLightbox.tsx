"use client";

import { CaretLeft, CaretRight, CircleNotch, X } from "@phosphor-icons/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { MediaKind } from "@/shared/media-kind";
import type { Photo } from "@/shared/types";
import { imageKitMediaUrl } from "../helpers/photos.helpers";

type PhotoLightboxProps = {
  photos: Photo[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function PhotoLightbox({ photos, activeIndex, onClose, onNavigate }: PhotoLightboxProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);
  const photo = photos[activeIndex];
  const mediaUrl = photo ? imageKitMediaUrl(photo.url) : "";
  const isVideo = photo?.mediaKind === MediaKind.VIDEO;
  const hasMany = photos.length > 1;
  const [pendingUrl, setPendingUrl] = useState<string | null>(mediaUrl);
  const pending = mediaUrl !== "" && pendingUrl === mediaUrl;

  onCloseRef.current = onClose;
  onNavigateRef.current = onNavigate;

  useLayoutEffect(() => {
    if (!mediaUrl) {
      setPendingUrl(null);
      return;
    }
    if (isVideo) {
      const video = videoRef.current;
      setPendingUrl(video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ? null : mediaUrl);
      return;
    }
    const image = imageRef.current;
    setPendingUrl(image && image.complete && image.naturalWidth > 0 ? null : mediaUrl);
  }, [isVideo, mediaUrl]);

  useEffect(() => {
    if (photos.length < 2) {
      return;
    }
    const neighborIndexes = [
      (activeIndex + 1) % photos.length,
      (activeIndex - 1 + photos.length) % photos.length,
    ];
    for (const neighborIndex of neighborIndexes) {
      const neighbor = photos[neighborIndex];
      if (!neighbor || neighbor.mediaKind === MediaKind.VIDEO) {
        continue;
      }
      const neighborUrl = imageKitMediaUrl(neighbor.url);
      if (!neighborUrl) {
        continue;
      }
      const preloaded = new Image();
      preloaded.src = neighborUrl;
    }
  }, [activeIndex, photos]);

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      video?.pause();
    };
  }, [activeIndex]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (photos.length < 2) {
        return;
      }
      if (event.key === "ArrowLeft") {
        onNavigateRef.current((activeIndex - 1 + photos.length) % photos.length);
      }
      if (event.key === "ArrowRight") {
        onNavigateRef.current((activeIndex + 1) % photos.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, photos.length]);

  if (!photo) {
    return null;
  }

  function clearPending() {
    setPendingUrl((current) => (current === mediaUrl ? null : current));
  }

  function navigate(nextIndex: number) {
    videoRef.current?.pause();
    onNavigate(nextIndex);
  }

  function close() {
    videoRef.current?.pause();
    onClose();
  }

  const mediaClassName = pending ? "photo-lightbox-image is-pending" : "photo-lightbox-image";

  return (
    <div
      className="photo-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={close}
    >
      <p id={titleId} className="sr-only">
        Event {photo.mediaKind === MediaKind.VIDEO ? "video" : "photo"} {activeIndex + 1} of {photos.length}
      </p>
      <button
        ref={closeRef}
        type="button"
        className="btn-pill photo-lightbox-close gap-1"
        aria-label="Close"
        onClick={close}
      >
        <X size={18} weight="bold" aria-hidden="true" />
      </button>
      {hasMany ? (
        <button
          type="button"
          className="btn-pill photo-lightbox-nav photo-lightbox-prev"
          aria-label="Previous"
          onClick={(event) => {
            event.stopPropagation();
            navigate((activeIndex - 1 + photos.length) % photos.length);
          }}
        >
          <CaretLeft size={20} weight="bold" aria-hidden="true" />
        </button>
      ) : null}
      <div className="photo-lightbox-stage" aria-busy={pending}>
        {pending ? (
          <CircleNotch
            size={36}
            weight="bold"
            className="photo-upload-spin photo-lightbox-spinner"
            aria-hidden="true"
          />
        ) : null}
        {mediaUrl && isVideo ? (
          <video
            key={mediaUrl}
            ref={videoRef}
            src={mediaUrl}
            className={mediaClassName}
            controls
            playsInline
            onLoadedData={clearPending}
            onError={clearPending}
            onClick={(event) => event.stopPropagation()}
          />
        ) : mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={mediaUrl}
            ref={imageRef}
            src={mediaUrl}
            alt="Event photo"
            className={mediaClassName}
            onLoad={clearPending}
            onError={clearPending}
            onClick={(event) => event.stopPropagation()}
          />
        ) : null}
      </div>
      {hasMany ? (
        <button
          type="button"
          className="btn-pill photo-lightbox-nav photo-lightbox-next"
          aria-label="Next"
          onClick={(event) => {
            event.stopPropagation();
            navigate((activeIndex + 1) % photos.length);
          }}
        >
          <CaretRight size={20} weight="bold" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
