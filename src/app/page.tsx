import Image from "next/image";
import Link from "next/link";
import { getHost } from "@/features/auth/services/auth.service";

const heroPins = [
  { src: "/pins/pin-table.png", alt: "Dinner table at an evening event" },
  { src: "/pins/pin-dance.png", alt: "Dance floor at a night party" },
  { src: "/pins/pin-outdoor.png", alt: "Outdoor gathering under pine trees" },
] as const;

const galleryPins = [
  { src: "/pins/pin-toast.png", alt: "Guests raising glasses", width: 768, height: 1024 },
  { src: "/pins/pin-crowd.png", alt: "Crowd at a small indoor show", width: 768, height: 1024 },
  { src: "/pins/pin-yard.png", alt: "Backyard party at dusk", width: 768, height: 1024 },
  { src: "/pins/pin-flowers.png", alt: "Floral arrangement at an entrance", width: 768, height: 1024 },
] as const;

export default async function HomePage() {
  const host = await getHost();

  return (
    <>
      <section className="mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-[1280px] grid-cols-1 items-center gap-10 px-6 pb-16 pt-8 md:grid-cols-2 md:pt-12">
        <div>
          <h1 className="display text-balance text-ink">Photos from the room, in one album.</h1>
          <p className="mt-4 max-w-[65ch] text-base leading-[1.4] text-mute">
            Guests scan a QR and add photos. No guest accounts.
          </p>
          {host ? null : (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
              <Link href="/login" className="btn-secondary">
                Log in
              </Link>
            </div>
          )}
        </div>
        <div className="grid h-[min(68dvh,560px)] grid-cols-2 gap-2">
          <div className="pin relative h-full">
            <Image
              src={heroPins[0].src}
              alt={heroPins[0].alt}
              fill
              className="object-cover"
              sizes="40vw"
              priority
            />
          </div>
          <div className="grid h-full grid-rows-2 gap-2">
            {heroPins.slice(1).map((pin) => (
              <div key={pin.src} className="pin relative h-full">
                <Image src={pin.src} alt={pin.alt} fill className="object-cover" sizes="20vw" priority />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1280px] grid-cols-1 px-6 py-16 md:grid-cols-3 md:divide-x md:divide-hairline">
        <div className="border-t border-hairline py-8 md:border-t-0 md:px-8 md:py-0 md:first:pl-0">
          <h2 className="text-[22px] font-semibold text-ink">Create</h2>
          <p className="mt-2 max-w-[65ch] text-base leading-[1.4] text-mute">
            Name the event. Ladybug makes a guest album.
          </p>
        </div>
        <div className="border-t border-hairline py-8 md:border-t-0 md:px-8 md:py-0">
          <h2 className="text-[22px] font-semibold text-ink">Share</h2>
          <p className="mt-2 max-w-[65ch] text-base leading-[1.4] text-mute">
            Print the QR. Guests open it on their phone.
          </p>
        </div>
        <div className="border-t border-hairline py-8 md:border-t-0 md:px-8 md:py-0 md:last:pr-0">
          <h2 className="text-[22px] font-semibold text-ink">Collect</h2>
          <p className="mt-2 max-w-[65ch] text-base leading-[1.4] text-mute">
            Every photo lands in one album.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 py-16">
        <div className="pin-grid">
          {galleryPins.map((pin) => (
            <div key={pin.src} className="pin">
              <Image src={pin.src} alt={pin.alt} width={pin.width} height={pin.height} className="h-auto w-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-charcoal px-8 py-12 text-canvas">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-6">
          <h2 className="heading-xl text-canvas">Make the album for your next room.</h2>
          {host ? null : (
            <Link href="/signup" className="btn-primary">
              Sign up
            </Link>
          )}
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 px-6 py-8">
        <Link href="/" className="text-[22px] font-semibold text-primary">
          Ladybug
        </Link>
        {host ? null : (
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-tertiary">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary">
              Sign up
            </Link>
          </nav>
        )}
      </footer>
    </>
  );
}
