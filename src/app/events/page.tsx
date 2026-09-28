import { CaretRight } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getHost } from "@/features/auth/services/auth.service";
import { EventCreateForm } from "@/features/events/components/EventCreateForm";
import { formatEventDate } from "@/features/events/helpers/events.helpers";
import { listEvents } from "@/features/events/services/events.service";

export default async function EventsPage() {
  const host = await getHost();
  if (!host) {
    redirect("/login");
  }
  const events = await listEvents(host.id);

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 pb-16 pt-8">
      <div>
        <h1 className="heading-xl text-ink">Your events</h1>
        {events.length > 0 ? (
          <p className="mt-2 text-sm text-mute">
            {events.length === 1 ? "1 event" : `${events.length} events`}
          </p>
        ) : null}
      </div>
      <EventCreateForm />
      {events.length === 0 ? (
        <div className="flex flex-col gap-5 rounded-md bg-card p-6 sm:flex-row sm:items-center">
          <div className="pin relative aspect-[4/3] w-full shrink-0 sm:w-56">
            <Image
              src="/pins/pin-outdoor.png"
              alt="Outdoor gathering under pine trees"
              fill
              className="object-cover"
              sizes="224px"
            />
          </div>
          <p className="max-w-[65ch] text-base text-mute">No events yet. Name one above.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}`}
                className="flex items-center justify-between gap-4 rounded-md bg-card px-5 py-5 text-ink transition-colors duration-200 hover:bg-secondary"
              >
                <span className="text-lg font-semibold">{event.name}</span>
                <span className="flex shrink-0 items-center gap-2 text-sm text-mute">
                  {formatEventDate(event.createdAt)}
                  <CaretRight size={16} weight="bold" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
