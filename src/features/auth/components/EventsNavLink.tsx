"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function EventsNavLink() {
  const pathname = usePathname();
  const isCurrent = pathname === "/events" || pathname.startsWith("/events/");

  return (
    <Link
      href="/events"
      className={isCurrent ? "float-nav-link float-nav-link-current" : "float-nav-link"}
      aria-current={isCurrent ? "page" : undefined}
    >
      <CalendarBlank size={18} weight="bold" aria-hidden="true" />
      Events
    </Link>
  );
}
