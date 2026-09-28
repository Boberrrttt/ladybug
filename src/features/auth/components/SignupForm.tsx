"use client";

import { useActionState } from "react";
import { signUpAction } from "../services/auth.actions";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, null);

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
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className="field"
        />
      </label>
      {state?.error ? <p className="text-sm text-error">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Creating…" : "Sign up"}
      </button>
    </form>
  );
}
