"use client";

import { Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { isImageFile, MAX_PHOTO_BYTES } from "../helpers/photos.helpers";
import { uploadPhotoAction } from "../services/photos.actions";

type PhotoUploaderProps = {
  guestSlug?: string;
  eventId?: string;
  heading?: string;
};

export function PhotoUploader({ guestSlug, eventId, heading }: PhotoUploaderProps) {
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

    const rejected = files.filter((file) => !isImageFile(file));
    const accepted = files.filter(isImageFile);
    if (rejected.length > 0) {
      setIsError(true);
      setStatus(`Skipped ${rejected.length} file(s). Images only, max ${MAX_PHOTO_BYTES / 1024 / 1024}MB.`);
    }
    if (accepted.length === 0) {
      return;
    }

    setPending(true);
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
      }
      setIsError(false);
      setStatus(`Added ${accepted.length} photo${accepted.length === 1 ? "" : "s"}.`);
      router.refresh();
    } catch (caughtError) {
      setIsError(true);
      setStatus(caughtError instanceof Error ? caughtError.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className={`flex items-center gap-3 ${heading ? "justify-between" : ""}`}>
        {heading ? <h2 className="text-[22px] font-semibold text-ink">{heading}</h2> : null}
        <label className={`btn-secondary w-fit cursor-pointer gap-2 ${pending ? "pointer-events-none opacity-60" : ""}`}>
          <Plus size={16} weight="bold" aria-hidden="true" />
          {pending ? "Adding…" : "Add photos"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={pending}
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      </div>
      {status ? (
        <p className={`text-sm ${isError ? "text-error" : "text-mute"}`} role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
    </div>
  );
}
