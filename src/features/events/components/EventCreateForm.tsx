"use client";

import { Plus } from "@phosphor-icons/react";
import { useActionState } from "react";
import { createEventAction } from "../services/events.actions";

export function EventCreateForm() {
  const [state, formAction, pending] = useActionState(createEventAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-md bg-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-ink">
          Event name
          <input
            name="name"
            type="text"
            required
            maxLength={80}
            autoComplete="off"
            className="field"
          />
        </label>
        <button type="submit" disabled={pending} className="btn-primary gap-2">
          <Plus size={16} weight="bold" aria-hidden="true" />
          {pending ? "Creating…" : "Create event"}
        </button>
      </div>
      <p className="text-sm font-normal text-mute">Guests see this on the album.</p>
      {state?.error ? <p className="text-sm text-error">{state.error}</p> : null}
    </form>
  );
}
