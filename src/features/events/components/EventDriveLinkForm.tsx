"use client";

import { useActionState, useRef, useState } from "react";
import { Check } from "@phosphor-icons/react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { updateEventDriveUrlAction } from "../services/events.actions";

export function EventDriveLinkForm({ eventId, driveUrl }: { eventId: string; driveUrl?: string }) {
  const [state, formAction, pending] = useActionState(updateEventDriveUrlAction, null);
  const [value, setValue] = useState(driveUrl ?? "");
  const stateRef = useRef(state);
  const savedValueRef = useRef<string | null>(null);
  if (stateRef.current !== state) {
    stateRef.current = state;
    savedValueRef.current = state && "saved" in state ? value : null;
  }
  const showSaved = savedValueRef.current === value && !pending;

  return (
    <form action={formAction} className="flex w-full flex-col gap-3 rounded-md bg-card p-5">
      <input type="hidden" name="eventId" value={eventId} />
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        Large files
        <Input
          name="driveUrl"
          type="url"
          value={value}
          onChange={(changeEvent) => setValue(changeEvent.target.value)}
          placeholder="https://drive.google.com/..."
          autoComplete="off"
        />
      </label>
      {showSaved ? (
        <p className="event-look-saved" role="status">
          <Check size={16} weight="bold" aria-hidden="true" />
          Saved
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Save"}
      </Button>
      {state && "error" in state ? (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
