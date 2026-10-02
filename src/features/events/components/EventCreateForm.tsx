"use client";

import { Images, Plus, X } from "@phosphor-icons/react";
import { useActionState } from "react";
import { createEventAction } from "../services/events.actions";

export function EventCreateForm() {
  const [state, formAction, pending] = useActionState(createEventAction, null);

  return (
    <>
      <form id="close-new-event" method="dialog" hidden />
      <form action={formAction} className="events-create">
        <div className="events-create-lead">
          <span className="events-create-icon" aria-hidden="true">
            <Images size={20} weight="duotone" />
          </span>
          <div>
            <h2 id="new-event-title" className="events-create-title">
              New album
            </h2>
            <p className="events-create-lede">Guests see this on the album.</p>
          </div>
          <button type="submit" form="close-new-event" className="btn-tertiary events-dialog-close" aria-label="Close">
            <X size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <label className="events-create-field">
          Event name
          <input name="name" type="text" required maxLength={80} autoComplete="off" className="field" />
        </label>
        {state?.error ? (
          <p className="text-sm text-error" role="alert">
            {state.error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="btn-primary events-create-submit gap-2">
          <Plus size={16} weight="bold" aria-hidden="true" />
          {pending ? "Creating…" : "Create event"}
        </button>
      </form>
    </>
  );
}
