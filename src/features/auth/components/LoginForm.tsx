"use client";

import { useActionState } from "react";
import { logInAction } from "../services/auth.actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(logInAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        Email
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        Password
        <input
          name="password"
          type="password"
          required
          maxLength={128}
          autoComplete="current-password"
          className="field"
        />
      </label>
      {state?.error ? <p className="text-sm text-error">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}
