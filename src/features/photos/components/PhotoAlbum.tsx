"use client";

import { CheckSquare } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Photo } from "@/shared/types";
import { deletePhotosAction, purgePhotosAction } from "../services/photos.actions";
import { PhotoGrid, PhotoGridSkeleton } from "./PhotoGrid";
import { PhotoUploader, type UploadPhase } from "./PhotoUploader";

const UNDO_MS = 5000;

type PhotoAlbumProps = {
  photos: Photo[];
  canDelete?: boolean;
  guestSlug?: string;
  eventId?: string;
  driveUrl?: string;
  heading?: string;
};

export function PhotoAlbum({ photos, canDelete, guestSlug, eventId, driveUrl, heading }: PhotoAlbumProps) {
  const router = useRouter();
  const [addingCount, setAddingCount] = useState(0);
  const uploadPhaseRef = useRef<UploadPhase>("idle");
  const [gridBusy, setGridBusy] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [undoIds, setUndoIds] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const purgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPurgeRef = useRef<string[] | null>(null);
  const photoKey = photos.map((photo) => photo.id).join(",");
  const [trackedPhotoKey, setTrackedPhotoKey] = useState(photoKey);
  if (photoKey !== trackedPhotoKey) {
    setTrackedPhotoKey(photoKey);
    if (uploadPhaseRef.current === "settled") {
      uploadPhaseRef.current = "idle";
      setAddingCount(0);
    }
  }

  useEffect(() => {
    return () => {
      if (purgeTimerRef.current) {
        clearTimeout(purgeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setGridBusy(false);
  }, [photoKey]);

  function handleUploadingChange(count: number, phase: UploadPhase = "active") {
    uploadPhaseRef.current = phase;
    setAddingCount(phase === "idle" ? 0 : count);
  }

  function clearPurgeTimer() {
    if (purgeTimerRef.current) {
      clearTimeout(purgeTimerRef.current);
      purgeTimerRef.current = null;
    }
  }

  function exitSelect() {
    setSelecting(false);
    setSelectedIds([]);
    setConfirmOpen(false);
    setError(null);
  }

  function toggleSelect(photoId: string) {
    setSelectedIds((current) =>
      current.includes(photoId) ? current.filter((id) => id !== photoId) : [...current, photoId],
    );
  }

  function enterSelectWith(photoId: string) {
    setSelecting(true);
    setSelectedIds([photoId]);
    setError(null);
  }

  function toggleSelectAll() {
    setSelectedIds((current) =>
      current.length === photos.length ? [] : photos.map((photo) => photo.id),
    );
  }

  async function confirmDelete() {
    if (selectedIds.length === 0 || deleting) {
      return;
    }
    const ids = [...selectedIds];
    setDeleting(true);
    setError(null);
    setGridBusy(true);
    setConfirmOpen(false);
    try {
      await deletePhotosAction(ids, eventId);
      exitSelect();
      pendingPurgeRef.current = ids;
      setUndoIds(ids);
      clearPurgeTimer();
      purgeTimerRef.current = setTimeout(() => {
        const toPurge = pendingPurgeRef.current;
        pendingPurgeRef.current = null;
        purgeTimerRef.current = null;
        if (!toPurge) {
          return;
        }
        void purgePhotosAction(toPurge, eventId).finally(() => {
          setUndoIds((current) => (current?.join() === toPurge.join() ? null : current));
        });
      }, UNDO_MS);
      router.refresh();
    } catch (caughtError) {
      setGridBusy(false);
      setError(caughtError instanceof Error ? caughtError.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    const liveIds = new Set(photos.map((photo) => photo.id));
    setSelectedIds((current) => {
      const next = current.filter((id) => liveIds.has(id));
      return next.length === current.length ? current : next;
    });
  }, [photos]);

  const allSelected = photos.length > 0 && selectedIds.length === photos.length;
  const selectedCount = selectedIds.length;

  return (
    <div className="flex flex-col gap-4">
      {selecting ? (
        <div className="photo-select-bar">
          <button type="button" className="photo-select-side" onClick={exitSelect} disabled={deleting}>
            Cancel
          </button>
          <p className="photo-select-count">
            {selectedCount > 0 ? `${selectedCount} selected` : null}
          </p>
          <div className="photo-select-actions">
            <button type="button" className="photo-select-side" onClick={toggleSelectAll} disabled={deleting}>
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            <button
              type="button"
              className="btn-primary photo-select-delete"
              disabled={deleting || selectedCount === 0}
              onClick={() => setConfirmOpen(true)}
            >
              {allSelected ? "Delete all" : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <PhotoUploader
          guestSlug={guestSlug}
          eventId={eventId}
          driveUrl={driveUrl}
          heading={heading}
          onUploadingChange={handleUploadingChange}
          actions={
            canDelete && photos.length > 0 ? (
              <button type="button" className="btn-secondary gap-2" onClick={() => setSelecting(true)}>
                <CheckSquare size={16} weight="bold" aria-hidden="true" />
                Select
              </button>
            ) : null
          }
        />
      )}
      {error ? (
        <p className="text-sm text-error" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
      {gridBusy ? (
        <PhotoGridSkeleton count={Math.max(photos.length, 1)} />
      ) : (
        <PhotoGrid
          photos={photos}
          pendingCount={addingCount}
          canSelect={Boolean(canDelete)}
          selecting={selecting}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onLongPressSelect={enterSelectWith}
        />
      )}
      {confirmOpen ? (
        <DeleteConfirmDialog
          count={selectedCount}
          pending={deleting}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={confirmDelete}
        />
      ) : null}
      {undoIds ? (
        <div className="photo-undo" role="status" aria-live="polite">
          Deleted {undoIds.length} item{undoIds.length === 1 ? "" : "s"}.
        </div>
      ) : null}
    </div>
  );
}

function DeleteConfirmDialog({
  count,
  pending,
  onCancel,
  onConfirm,
}: {
  count: number;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);

  onCancelRef.current = onCancel;

  useEffect(() => {
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onCancelRef.current();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pending]);

  const label = count === 1 ? "Delete 1 item?" : `Delete ${count} items?`;

  return (
    <div
      className="photo-confirm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => {
        if (!pending) {
          onCancel();
        }
      }}
    >
      <div className="photo-confirm-card" onClick={(event) => event.stopPropagation()}>
        <h2 id={titleId} className="text-[22px] font-semibold text-ink">
          {label}
        </h2>
        <p className="mt-2 text-sm text-mute">This can&apos;t be undone.</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button ref={cancelRef} type="button" className="btn-secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm} disabled={pending}>
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
