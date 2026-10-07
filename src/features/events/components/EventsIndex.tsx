"use client";

import { CalendarBlank, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { EventCreateForm } from "./EventCreateForm";

type EventListItem = {
  id: string;
  name: string;
  createdAt: string;
  createdLabel: string;
  accent: string;
  coverUrl?: string;
  photoCount: number;
};

export function EventsIndex({ events }: { events: EventListItem[] }) {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const needle = query.trim().toLowerCase();
  const visibleEvents = needle ? events.filter((event) => event.name.toLowerCase().includes(needle)) : events;
  const eventCountLabel = events.length === 1 ? "1 event" : `${events.length} events`;

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
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events"
          />
        </label>
        <Button type="button" className="shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus size={16} weight="bold" aria-hidden="true" />
          Add
        </Button>
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
                <span
                  className="event-tile-band"
                  style={
                    event.coverUrl
                      ? { backgroundImage: `url(${JSON.stringify(event.coverUrl)})` }
                      : { backgroundColor: event.accent }
                  }
                />
                <span className="event-tile-body">
                  <span className="event-tile-name">{event.name}</span>
                  <span className="event-tile-meta">
                    <time dateTime={event.createdAt}>{event.createdLabel}</time>
                    <span>{event.photoCount === 1 ? "1 photo" : `${event.photoCount} photos`}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent showCloseButton={false}>
          <EventCreateForm onClose={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </main>
  );
}
