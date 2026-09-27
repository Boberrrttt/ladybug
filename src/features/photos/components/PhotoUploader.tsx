"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { isImageFile, MAX_PHOTO_BYTES } from "../helpers/photos.helpers";
import { uploadPhotoAction } from "../services/photos.service";

type PhotoUploaderProps = {
  guestSlug?: string;
  eventId?: string;
};

export function PhotoUploader({ guestSlug, eventId }: PhotoUploaderProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
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
      setStatus(`Added ${accepted.length} photo${accepted.length === 1 ? "" : "s"}.`);
      router.refresh();
    } catch (caughtError) {
      setStatus(caughtError instanceof Error ? caughtError.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className={`btn-secondary w-fit cursor-pointer ${pending ? "pointer-events-none opacity-60" : ""}`}>
        {pending ? "Adding…" : "Add photos"}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={pending}
          onChange={handleChange}
          className="sr-only"
        />
      </label>
      {status ? <p className="text-sm text-mute">{status}</p> : null}
    </div>
  );
}
