"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useState } from "react";

type PasswordFieldProps = {
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  helper?: string;
  describedBy?: string;
  invalid?: boolean;
};

export function PasswordField({
  autoComplete,
  minLength,
  helper,
  describedBy,
  invalid = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const helperId = helper ? "password-help" : undefined;
  const describedIds = [helperId, describedBy].filter(Boolean).join(" ") || undefined;

  return (
    <div className="auth-field">
      <label htmlFor="password">Password</label>
      <span className="auth-password">
        <input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          maxLength={128}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          aria-describedby={describedIds}
          className="field"
        />
        <button
          type="button"
          className="auth-password-toggle"
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
        </button>
      </span>
      {helper ? (
        <span id={helperId} className="auth-help">
          {helper}
        </span>
      ) : null}
    </div>
  );
}
