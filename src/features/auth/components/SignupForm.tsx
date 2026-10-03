"use client";

import { useActionState } from "react";
import { signUpAction } from "../services/auth.actions";
import { PasswordField } from "./PasswordField";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, null);
  const errorId = state?.error ? "signup-error" : undefined;

  return (
    <form action={formAction} className="auth-form">
      <label className="auth-field">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={Boolean(state?.error) || undefined}
          aria-describedby={errorId}
          className="field"
        />
      </label>
      <PasswordField
        autoComplete="new-password"
        minLength={12}
        helper="Use 12 to 128 characters."
        describedBy={errorId}
        invalid={Boolean(state?.error)}
      />
      {state?.error ? (
        <p id={errorId} className="auth-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary auth-submit">
        {pending ? "Creating..." : "Sign up"}
      </button>
    </form>
  );
}
