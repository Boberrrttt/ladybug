"use client";

import { GoogleDriveLogo, Images, Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/ui/button";
import { isAllowedMediaFile, rejectMediaReason } from "../helpers/photos.helpers";
import { uploadPhotoAction } from "../services/photos.actions";

export type UploadPhase = "active" | "settled" | "idle";

type PhotoUploaderProps = {
  guestSlug?: string;
  eventId?: string;
  driveUrl?: string;
  heading?: string;
  onUploadingChange?: (count: number, phase?: UploadPhase) => void;
  actions?: ReactNode;
};

export function PhotoUploader({
  guestSlug,
  eventId,
  driveUrl,
  heading,
  onUploadingChange,
  actions,
}: PhotoUploaderProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleChange(changeEvent: ChangeEvent<HTMLInputElement>) {
    const files = [...(changeEvent.target.files ?? [])];
    changeEvent.target.value = "";
    if (files.length === 0) {
      return;
    }

    menuRef.current?.hidePopover();
    const rejected = files.filter((file) => !isAllowedMediaFile(file));
    const accepted = files.filter(isAllowedMediaFile);
    if (rejected.length > 0) {
      setIsError(true);
      setStatus(rejectMediaReason(rejected[0]!) ?? "Unsupported file type.");
    }
    if (accepted.length === 0) {
      return;
    }

    setPending(true);
    onUploadingChange?.(accepted.length, "active");
    let uploaded = 0;
    try {
      for (const file of accepted) {
        const formData = new FormData();
        formData.set("file", file);
        if (guestSlug) {
          formData.set("guestSlug", guestSlug);
        }
        if (eventId) {
          formData.set("eventId", eventId);
        }
        await uploadPhotoAction(formData);
        uploaded += 1;
      }
      setIsError(false);
      setStatus(`Added ${accepted.length} item${accepted.length === 1 ? "" : "s"}.`);
      onUploadingChange?.(accepted.length, "settled");
      router.refresh();
    } catch (caughtError) {
      setIsError(true);
      setStatus(caughtError instanceof Error ? caughtError.message : "Upload failed");
      if (uploaded > 0) {
        onUploadingChange?.(uploaded, "settled");
        router.refresh();
      } else {
        onUploadingChange?.(0, "idle");
      }
    } finally {
      setPending(false);
    }
  }

  function openPicker() {
    fileRef.current?.click();
    menuRef.current?.hidePopover();
  }

  const fab = (
    <div className="event-album-fab">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        multiple
        disabled={pending}
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
      />
      {driveUrl ? (
        <>
          <button
            type="button"
            className={`event-album-fab-btn${menuOpen ? " event-album-fab-btn-open" : ""}`}
            popoverTarget={menuId}
            disabled={pending}
            aria-label={menuOpen ? "Close add menu" : "Add"}
          >
            <Plus size={24} weight="bold" aria-hidden="true" />
          </button>
          <div
            id={menuId}
            ref={menuRef}
            popover="auto"
            className="event-album-add-menu"
            onToggle={(event) => setMenuOpen(event.newState === "open")}
          >
            <Button type="button" onClick={openPicker} disabled={pending}>
              <Plus size={16} weight="bold" aria-hidden="true" />
              {pending ? "Adding…" : "Add media"}
            </Button>
            <Button asChild variant="secondary">
              <a href={driveUrl} target="_blank" rel="noreferrer">
                <GoogleDriveLogo size={16} weight="bold" aria-hidden="true" />
                Large files
              </a>
            </Button>
            <p className="event-album-add-note">Images over 100MB and videos over 25MB use Large files.</p>
          </div>
        </>
      ) : (
        <button
          type="button"
          className="event-album-fab-btn"
          onClick={openPicker}
          disabled={pending}
          aria-label={pending ? "Adding" : "Add media"}
        >
          <Plus size={24} weight="bold" aria-hidden="true" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="event-album-toolbar">
        <div className="event-album-toolbar-row">
          {heading ? (
            <h2 className="event-album-count">
              <Images size={20} weight="duotone" aria-hidden="true" />
              <span>{heading}</span>
            </h2>
          ) : null}
          {actions ? <div className="event-album-actions">{actions}</div> : null}
        </div>
        {status ? (
          <p className={`text-sm ${isError ? "text-error" : "text-mute"}`} role="status" aria-live="polite">
            {status}
          </p>
        ) : null}
      </div>
      {mounted ? createPortal(fab, document.body) : null}
    </>
  );
}
