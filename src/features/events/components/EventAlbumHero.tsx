import { Sparkle } from "@phosphor-icons/react/ssr";

type EventAlbumHeroProps = {
  name: string;
};

export function EventAlbumHero({ name }: EventAlbumHeroProps) {
  return (
    <header className="event-album-hero">
      <h1 className="event-album-title text-center text-ink">{name}</h1>
      <div className="event-album-flourish" aria-hidden="true">
        <span className="event-album-flourish-line" />
        <Sparkle className="event-album-flourish-mark" size={28} weight="fill" />
        <span className="event-album-flourish-line" />
      </div>
    </header>
  );
}
