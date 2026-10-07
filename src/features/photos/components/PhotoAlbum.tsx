"use client";

import { CheckSquare } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
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
            <Button
              type="button"
              className="photo-select-delete"
              disabled={deleting || selectedCount === 0}
              onClick={() => setConfirmOpen(true)}
            >
              {allSelected ? "Delete all" : "Delete"}
            </Button>
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
              <Button type="button" variant="secondary" onClick={() => setSelecting(true)}>
                <CheckSquare size={16} weight="bold" aria-hidden="true" />
                Select
              </Button>
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
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setConfirmOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedCount === 1 ? "Delete 1 item?" : `Delete ${selectedCount} items?`}
            </AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={confirmDelete}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {undoIds ? (
        <div className="photo-undo" role="status" aria-live="polite">
          Deleted {undoIds.length} item{undoIds.length === 1 ? "" : "s"}.
        </div>
      ) : null}
    </div>
  );
}
