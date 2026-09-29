"use client";

import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { useEffect, useId, useRef } from "react";
import { MediaKind } from "@/shared/media-kind";
import type { Photo } from "@/shared/types";

type PhotoLightboxProps = {
  photos: Photo[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function PhotoLightbox({ photos, activeIndex, onClose, onNavigate }: PhotoLightboxProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const mediaRef = useRef<HTMLVideoElement>(null);
  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);
  const photo = photos[activeIndex];
  const hasMany = photos.length > 1;

  onCloseRef.current = onClose;
  onNavigateRef.current = onNavigate;

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    return () => {
      mediaRef.current?.pause();
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

  function navigate(nextIndex: number) {
    mediaRef.current?.pause();
    onNavigate(nextIndex);
  }

  function close() {
    mediaRef.current?.pause();
    onClose();
  }

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
      {photo.mediaKind === MediaKind.VIDEO ? (
        <video
          ref={mediaRef}
          src={photo.url}
          className="photo-lightbox-image"
          controls
          playsInline
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt="Event photo"
          className="photo-lightbox-image"
          onClick={(event) => event.stopPropagation()}
        />
      )}
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
