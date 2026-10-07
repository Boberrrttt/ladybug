"use client";

import { useActionState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { signUpAction } from "../services/auth.actions";
import { PasswordField } from "./PasswordField";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, null);
  const errorId = state?.error ? "signup-error" : undefined;

  return (
    <form action={formAction} className="auth-form">
      <label className="auth-field">
        Email
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={Boolean(state?.error) || undefined}
          aria-describedby={errorId}
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
      <Button type="submit" disabled={pending} className="auth-submit">
        {pending ? "Creating..." : "Sign up"}
      </Button>
    </form>
  );
}
