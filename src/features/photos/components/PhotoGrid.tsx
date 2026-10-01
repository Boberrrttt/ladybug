"use client";

import { Check, Images, Play } from "@phosphor-icons/react";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { MediaKind } from "@/shared/media-kind";
import type { Photo } from "@/shared/types";
import { gridThumbUrl, imageKitMediaUrl } from "../helpers/photos.helpers";
import { PhotoLightbox } from "./PhotoLightbox";

const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_PX = 10;

function gridClassForCount(count: number) {
  if (count === 1) {
    return "max-w-xl";
  }
  if (count < 4) {
    return "pin-grid pin-grid-2";
  }
  return "pin-grid";
}

function VideoTile({ url, showPlay }: { url: string; showPlay: boolean }) {
  const thumbUrl = gridThumbUrl(url);
  if (!thumbUrl) {
    return null;
  }
  return (
    <>
      {thumbUrl === url ? (
        <video src={url} muted playsInline preload="metadata" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbUrl} alt="" loading="lazy" decoding="async" />
      )}
      {showPlay ? (
        <span className="photo-play" aria-hidden="true">
          <Play size={20} weight="fill" />
        </span>
      ) : null}
    </>
  );
}

function SkeletonPins({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <li key={`pending-media-${index}`} className="pin photo-skeleton" aria-hidden="true" />
  ));
}

export function PhotoGridSkeleton({ count }: { count: number }) {
  const pinCount = Math.max(count, 1);
  return (
    <ul className={gridClassForCount(pinCount)} aria-busy="true" aria-label="Loading media">
      <SkeletonPins count={pinCount} />
    </ul>
  );
}

export function PhotoGrid({
  photos,
  pendingCount = 0,
  canSelect = false,
  selecting = false,
  selectedIds = [],
  onToggleSelect,
  onLongPressSelect,
}: {
  photos: Photo[];
  pendingCount?: number;
  canSelect?: boolean;
  selecting?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (photoId: string) => void;
  onLongPressSelect?: (photoId: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const selectedSet = new Set(selectedIds);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressOriginRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);

  function clearLongPress() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = null;
    longPressOriginRef.current = null;
  }

  function startLongPress(photoId: string, event: ReactPointerEvent<HTMLButtonElement>) {
    if (!canSelect || selecting || event.button !== 0) {
      return;
    }
    clearLongPress();
    longPressOriginRef.current = { x: event.clientX, y: event.clientY };
    longPressTimerRef.current = setTimeout(() => {
      suppressClickRef.current = true;
      onLongPressSelect?.(photoId);
      clearLongPress();
    }, LONG_PRESS_MS);
  }

  function moveLongPress(event: ReactPointerEvent<HTMLButtonElement>) {
    const origin = longPressOriginRef.current;
    if (!origin) {
      return;
    }
    const deltaX = Math.abs(event.clientX - origin.x);
    const deltaY = Math.abs(event.clientY - origin.y);
    if (deltaX > LONG_PRESS_MOVE_PX || deltaY > LONG_PRESS_MOVE_PX) {
      clearLongPress();
    }
  }

  if (photos.length === 0 && pendingCount === 0) {
    return (
      <div className="event-album-empty">
        <Images size={32} weight="duotone" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-ink">No media yet</p>
          <p className="max-w-[65ch] text-sm text-mute">Add the first photo or video to open the album.</p>
        </div>
      </div>
    );
  }

  const adding = pendingCount > 0;

  return (
    <>
      <ul
        className={gridClassForCount(photos.length + pendingCount)}
        aria-busy={adding || undefined}
        aria-label={adding ? "Adding media" : undefined}
      >
        {adding ? <SkeletonPins count={pendingCount} /> : null}
        {photos.map((photo, index) => {
          const isSelected = selectedSet.has(photo.id);
          return (
            <li key={photo.id} className={`pin relative ${isSelected ? "pin-selected" : ""}`}>
              <button
                type="button"
                className="photo-open"
                aria-label={
                  selecting
                    ? isSelected
                      ? "Deselect media"
                      : "Select media"
                    : photo.mediaKind === MediaKind.VIDEO
                      ? "View video"
                      : "View photo"
                }
                aria-pressed={selecting ? isSelected : undefined}
                onPointerDown={(event) => startLongPress(photo.id, event)}
                onPointerMove={moveLongPress}
                onPointerUp={clearLongPress}
                onPointerCancel={clearLongPress}
                onPointerLeave={clearLongPress}
                onContextMenu={(event) => {
                  if (canSelect) {
                    event.preventDefault();
                  }
                }}
                onClick={() => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false;
                    return;
                  }
                  if (selecting) {
                    onToggleSelect?.(photo.id);
                    return;
                  }
                  setActiveIndex(index);
                }}
              >
                {photo.mediaKind === MediaKind.VIDEO ? (
                  <VideoTile url={photo.url} showPlay={!selecting} />
                ) : imageKitMediaUrl(photo.url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={gridThumbUrl(photo.url)} alt="Event photo" loading="lazy" decoding="async" />
                ) : null}
                {selecting ? (
                  <span className={`photo-check ${isSelected ? "photo-check-on" : ""}`} aria-hidden="true">
                    {isSelected ? <Check size={14} weight="bold" /> : null}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {!selecting && activeIndex !== null ? (
        <PhotoLightbox
          photos={photos}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      ) : null}
    </>
  );
}
