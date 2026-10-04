import { Sparkle } from "@phosphor-icons/react/ssr";
import type { EventFontStyle } from "@/shared/types";

type EventAlbumHeroProps = {
  name: string;
  fontStyle: EventFontStyle;
};

export function EventAlbumHero({ name, fontStyle }: EventAlbumHeroProps) {
  return (
    <header className="event-album-hero">
      <h1 className="event-album-title text-center" data-font={fontStyle}>
        {name}
      </h1>
      <div className="event-album-flourish" aria-hidden="true">
        <span className="event-album-flourish-line" />
        <Sparkle className="event-album-flourish-mark" size={28} weight="fill" />
        <span className="event-album-flourish-line" />
      </div>
    </header>
  );
}
