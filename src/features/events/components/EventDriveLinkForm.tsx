"use client";

import { useActionState } from "react";
import { updateEventDriveUrlAction } from "../services/events.actions";

export function EventDriveLinkForm({ eventId, driveUrl }: { eventId: string; driveUrl?: string }) {
  const [state, formAction, pending] = useActionState(updateEventDriveUrlAction, null);

  return (
    <form action={formAction} className="flex w-full flex-col gap-3 rounded-md bg-card p-5">
      <input type="hidden" name="eventId" value={eventId} />
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        Large files
        <input
          name="driveUrl"
          type="url"
          defaultValue={driveUrl ?? ""}
          placeholder="https://drive.google.com/..."
          autoComplete="off"
          className="field"
        />
      </label>
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Saving…" : "Save"}
      </button>
      {state?.error ? <p className="text-sm text-error">{state.error}</p> : null}
    </form>
  );
}
