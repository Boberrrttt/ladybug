"use client";

import { SignOut } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import { logOutAction } from "@/features/auth/services/auth.actions";

export function AccountMenu({ email }: { email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const hostInitial = email.slice(0, 1).toUpperCase();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className={isOpen ? "float-nav-chip float-nav-chip-open" : "float-nav-chip"}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <span className="float-nav-avatar" aria-hidden="true">
          {hostInitial}
        </span>
        <span className="sr-only sm:hidden">{email}</span>
        <span className="hidden min-w-0 truncate sm:inline">{email}</span>
      </button>
      {isOpen ? (
        <div id={menuId} className="float-nav-menu">
          <p className="float-nav-menu-email">{email}</p>
          <form action={logOutAction}>
            <button type="submit" className="float-nav-menu-item">
              <SignOut size={18} weight="bold" aria-hidden="true" />
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
