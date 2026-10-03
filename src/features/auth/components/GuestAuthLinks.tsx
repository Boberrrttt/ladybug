"use client";

import { SignIn } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function GuestAuthLinks() {
  const pathname = usePathname();
  const onLogin = pathname === "/login";
  const onSignup = pathname === "/signup";

  return (
    <>
      <Link
        href="/login"
        className={onLogin ? "float-nav-link float-nav-link-current" : "float-nav-link"}
        aria-current={onLogin ? "page" : undefined}
      >
        <SignIn size={18} weight="bold" aria-hidden="true" />
        Log in
      </Link>
      <Link href="/signup" className="float-nav-cta" aria-current={onSignup ? "page" : undefined}>
        Sign up
      </Link>
    </>
  );
}
