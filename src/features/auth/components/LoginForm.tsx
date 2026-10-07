"use client";

import { useActionState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { logInAction } from "../services/auth.actions";
import { PasswordField } from "./PasswordField";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(logInAction, null);
  const errorId = state?.error ? "login-error" : undefined;

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
      <PasswordField autoComplete="current-password" describedBy={errorId} invalid={Boolean(state?.error)} />
      {state?.error ? (
        <p id={errorId} className="auth-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="auth-submit">
        {pending ? "Signing in..." : "Log in"}
      </Button>
    </form>
  );
}
