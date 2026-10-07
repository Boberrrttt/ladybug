"use client";

import { Images, Plus, X } from "@phosphor-icons/react";
import { useActionState } from "react";
import { Button } from "@/shared/components/ui/button";
import { DialogDescription, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { createEventAction } from "../services/events.actions";

export function EventCreateForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createEventAction, null);

  return (
    <form action={formAction} className="events-create">
      <div className="events-create-lead">
        <span className="events-create-icon" aria-hidden="true">
          <Images size={20} weight="duotone" />
        </span>
        <div>
          <DialogTitle className="events-create-title">New album</DialogTitle>
          <DialogDescription className="events-create-lede">Guests see this on the album.</DialogDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="events-dialog-close"
          aria-label="Close"
          onClick={onClose}
        >
          <X size={18} weight="bold" aria-hidden="true" />
        </Button>
      </div>
      <label className="events-create-field">
        Event name
        <Input name="name" type="text" required maxLength={80} autoComplete="off" />
      </label>
      {state?.error ? (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="events-create-submit">
        <Plus size={16} weight="bold" aria-hidden="true" />
        {pending ? "Creating…" : "Create event"}
      </Button>
    </form>
  );
}
