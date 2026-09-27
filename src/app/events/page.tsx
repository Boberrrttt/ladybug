import Link from "next/link";
import { redirect } from "next/navigation";
import { getHost } from "@/features/auth/services/auth.service";
import { EventCreateForm } from "@/features/events/components/EventCreateForm";
import { listEvents } from "@/features/events/services/events.service";

export default async function EventsPage() {
  const host = await getHost();
  if (!host) {
    redirect("/login");
  }
  const events = await listEvents(host.id);

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="heading-xl text-ink">Your events</h1>
        <p className="text-sm text-mute">{host.email}</p>
      </div>
      <EventCreateForm />
      {events.length === 0 ? (
        <p className="text-base text-mute">No events yet. Name one above.</p>
      ) : (
        <ul className="flex flex-col border-t border-hairline">
          {events.map((event) => (
            <li key={event.id} className="border-b border-hairline">
              <Link href={`/events/${event.id}`} className="flex justify-between gap-4 py-4 text-ink">
                <span className="font-semibold">{event.name}</span>
                <span className="text-sm text-mute">
                  {new Date(event.createdAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
