import Link from "next/link";
import { LadybugMark } from "@/shared/components/LadybugMark";
import type { User } from "@/shared/types";
import { AccountMenu } from "./AccountMenu";
import { EventsNavLink } from "./EventsNavLink";
import { GuestAuthLinks } from "./GuestAuthLinks";

export function AppHeader({ host }: { host: User | null }) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-10 px-4 pt-4 md:px-6">
      <a href="#main" className="skip-link pointer-events-auto">
        Skip to content
      </a>
      <nav aria-label="Primary" className="float-nav pointer-events-auto">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" className="float-nav-brand gap-2">
            <LadybugMark />
            Ladybug
          </Link>
          {host ? (
            <>
              <span className="float-nav-rule" aria-hidden="true" />
              <EventsNavLink />
            </>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {host ? (
            <AccountMenu email={host.email} />
          ) : (
            <GuestAuthLinks />
          )}
        </div>
      </nav>
    </header>
  );
}
