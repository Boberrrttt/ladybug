"use client";

import { SignOut } from "@phosphor-icons/react";
import { useRef } from "react";
import { logOutAction } from "@/features/auth/services/auth.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export function AccountMenu({ email }: { email: string }) {
  const logoutRef = useRef<HTMLFormElement>(null);
  const hostInitial = email.slice(0, 1).toUpperCase();

  return (
    <>
      <form ref={logoutRef} action={logOutAction} />
      <DropdownMenu>
        <DropdownMenuTrigger className="float-nav-chip">
          <span className="float-nav-avatar" aria-hidden="true">
            {hostInitial}
          </span>
          <span className="sr-only sm:hidden">{email}</span>
          <span className="hidden min-w-0 truncate sm:inline">{email}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="float-nav-menu ring-0">
          <DropdownMenuLabel className="float-nav-menu-email">{email}</DropdownMenuLabel>
          <DropdownMenuItem className="float-nav-menu-item" onSelect={() => logoutRef.current?.requestSubmit()}>
            <SignOut size={18} weight="bold" aria-hidden="true" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
