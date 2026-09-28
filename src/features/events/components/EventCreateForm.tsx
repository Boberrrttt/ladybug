"use client";

import { useActionState } from "react";
import { createEventAction } from "../services/events.actions";

export function EventCreateForm() {
  const [state, formAction, pending] = useActionState(createEventAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-ink">
        Event name
        <input name="name" type="text" required maxLength={80} className="field" />
      </label>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Creating…" : "Create event"}
      </button>
      {state?.error ? <p className="text-sm text-error sm:w-full">{state.error}</p> : null}
    </form>
  );
}
