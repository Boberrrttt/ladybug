import Link from "next/link";
import type { ReactNode } from "react";

type AuthScreenProps = {
  title: string;
  lede: string;
  switchPrompt: string;
  switchHref: string;
  switchLabel: string;
  children: ReactNode;
};

export function AuthScreen({
  title,
  lede,
  switchPrompt,
  switchHref,
  switchLabel,
  children,
}: AuthScreenProps) {
  return (
    <main className="auth-screen">
      <div className="auth-copy">
        <div className="auth-intro">
          <h1 className="heading-xl text-ink">{title}</h1>
          <p className="auth-lede">{lede}</p>
        </div>
        {children}
        <p className="auth-switch">
          {switchPrompt}{" "}
          <Link href={switchHref}>{switchLabel}</Link>
        </p>
      </div>
    </main>
  );
}