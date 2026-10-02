"use client";

import { CalendarBlank, CaretRight, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { EventCreateForm } from "./EventCreateForm";

type EventListItem = {
  id: string;
  name: string;
  createdAt: string;
  createdLabel: string;
};

export function EventsIndex({ events }: { events: EventListItem[] }) {
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const needle = query.trim().toLowerCase();
  const visibleEvents = needle ? events.filter((event) => event.name.toLowerCase().includes(needle)) : events;
  const eventCountLabel = events.length === 1 ? "1 event" : `${events.length} events`;

  function openCreateDialog() {
    dialogRef.current?.showModal();
  }

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      dialogRef.current.close();
    }
  }

  return (
    <main className="events-index">
      <header className="events-index-head">
        <h1 className="heading-xl text-ink">Your events</h1>
        {events.length > 0 ? <p className="text-sm font-semibold text-mute">{eventCountLabel}</p> : null}
      </header>
      <div className="events-toolbar">
        <label className="events-search">
          <span className="sr-only">Search events</span>
          <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events"
            className="field"
          />
        </label>
        <button type="button" className="btn-primary gap-2" onClick={openCreateDialog}>
          <Plus size={16} weight="bold" aria-hidden="true" />
          Add
        </button>
      </div>
      {visibleEvents.length === 0 ? (
        <div className="event-album-empty">
          <CalendarBlank size={32} weight="duotone" aria-hidden="true" />
          <p className="max-w-[65ch] text-base text-mute">
            {events.length === 0 ? "No events yet." : "No events match that search."}
          </p>
        </div>
      ) : (
        <ul className="events-index-list">
          {visibleEvents.map((event) => (
            <li key={event.id}>
              <Link href={`/events/${event.id}`} className="event-tile">
                <span className="event-tile-name">{event.name}</span>
                <span className="event-tile-meta">
                  <time dateTime={event.createdAt}>{event.createdLabel}</time>
                  <span className="event-tile-open">
                    Open
                    <CaretRight size={16} weight="bold" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <dialog ref={dialogRef} className="events-dialog" aria-labelledby="new-event-title" onClick={closeOnBackdrop}>
        <EventCreateForm />
      </dialog>
    </main>
  );
}
