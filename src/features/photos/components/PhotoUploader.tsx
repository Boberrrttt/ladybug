"use client";

import { Images, Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type ReactNode } from "react";
import { isAllowedMediaFile, rejectMediaReason } from "../helpers/photos.helpers";
import { uploadPhotoAction } from "../services/photos.actions";

type PhotoUploaderProps = {
  guestSlug?: string;
  eventId?: string;
  heading?: string;
  onUploadingChange?: (count: number) => void;
  actions?: ReactNode;
};

export function PhotoUploader({
  guestSlug,
  eventId,
  heading,
  onUploadingChange,
  actions,
}: PhotoUploaderProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleChange(changeEvent: ChangeEvent<HTMLInputElement>) {
    const files = [...(changeEvent.target.files ?? [])];
    changeEvent.target.value = "";
    if (files.length === 0) {
      return;
    }

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
    let remaining = accepted.length;
    onUploadingChange?.(remaining);
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
        remaining -= 1;
        onUploadingChange?.(remaining);
      }
      setIsError(false);
      setStatus(`Added ${accepted.length} item${accepted.length === 1 ? "" : "s"}.`);
      router.refresh();
    } catch (caughtError) {
      setIsError(true);
      setStatus(caughtError instanceof Error ? caughtError.message : "Upload failed");
    } finally {
      setPending(false);
      onUploadingChange?.(0);
    }
  }

  return (
    <div className="event-album-toolbar">
      <div className={`flex flex-wrap items-center gap-3 ${heading ? "justify-between" : ""}`}>
        {heading ? (
          <h2 className="event-album-count">
            <Images size={20} weight="duotone" aria-hidden="true" />
            <span>{heading}</span>
          </h2>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <label
            className={`btn-primary w-fit cursor-pointer gap-2 ${pending ? "pointer-events-none opacity-60" : ""}`}
          >
            <Plus size={16} weight="bold" aria-hidden="true" />
            {pending ? "Adding…" : "Add media"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              multiple
              disabled={pending}
              onChange={handleChange}
              className="sr-only"
            />
          </label>
        </div>
      </div>
      {status ? (
        <p className={`text-sm ${isError ? "text-error" : "text-mute"}`} role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
    </div>
  );
}
