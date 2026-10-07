import Image from "next/image";
import Link from "next/link";
import { getHost } from "@/features/auth/services/auth.service";
import { Button } from "@/shared/components/ui/button";
import { LadybugMark } from "@/shared/components/LadybugMark";

const heroPins = [
  { src: "/pins/pin-table.png", alt: "Dinner table at an evening event" },
  { src: "/pins/pin-dance.png", alt: "Dance floor at a night party" },
  { src: "/pins/pin-outdoor.png", alt: "Outdoor gathering under pine trees" },
] as const;

const steps = [
  { title: "Create", body: "Name the event. Ladybug makes a guest album." },
  { title: "Share", body: "Print the QR. Guests open it on their phone." },
  { title: "Collect", body: "Every photo lands in one album." },
] as const;

const scatterPins = [
  { src: "/pins/pin-crowd.png", alt: "Crowd at a small indoor show", className: "left-0 top-0 w-[62%] -rotate-3" },
  { src: "/pins/pin-yard.png", alt: "Backyard party at dusk", className: "bottom-0 right-0 w-[58%] rotate-2" },
] as const;

const galleryPins = [
  { src: "/pins/pin-toast.png", alt: "Guests raising glasses", width: 768, height: 1024 },
  { src: "/pins/pin-flowers.png", alt: "Floral arrangement at an entrance", width: 768, height: 1024 },
  { src: "/pins/pin-outdoor.png", alt: "Outdoor gathering under pine trees", width: 768, height: 1024 },
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
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/login">Log in</Link>
              </Button>
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

      <section className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] md:gap-16 md:py-20">
        <ol>
          {steps.map((step) => (
            <li key={step.title} className="border-t border-hairline py-6 first:border-t-0 first:pt-0 last:pb-0">
              <h2 className="text-[22px] font-semibold text-ink">{step.title}</h2>
              <p className="mt-2 max-w-[36ch] text-base leading-[1.4] text-mute">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="grid grid-cols-2 gap-2 md:hidden">
          {scatterPins.map((pin) => (
            <div key={pin.src} className="pin">
              <Image src={pin.src} alt={pin.alt} width={768} height={1024} className="h-auto w-full" />
            </div>
          ))}
        </div>
        <div className="relative hidden h-[26rem] md:block">
          {scatterPins.map((pin) => (
            <div key={pin.src} className={`pin absolute ${pin.className}`}>
              <Image src={pin.src} alt={pin.alt} width={768} height={1024} className="h-auto w-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-auto md:grid md:w-full md:max-w-[1280px] md:grid-cols-3 md:overflow-visible md:px-6 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {galleryPins.map((pin) => (
            <div key={pin.src} className="pin w-[min(78vw,32rem)] shrink-0 snap-start md:w-auto md:shrink">
              <Image src={pin.src} alt={pin.alt} width={pin.width} height={pin.height} className="h-auto w-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-charcoal text-canvas">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-8 px-6 py-10 md:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] md:px-8 md:py-12">
          <div className="flex flex-col items-start gap-6">
            <h2 className="heading-xl max-w-[16ch] text-canvas">Make the album for your next room.</h2>
            {host ? (
              <Button asChild>
                <Link href="/events">Events</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            )}
          </div>
          <div className="pin relative h-52 w-full md:h-64">
            <Image
              src="/pins/pin-dance.png"
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 768px) 22rem, 100vw"
            />
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[22px] font-semibold text-primary">
          <LadybugMark />
          Ladybug
        </Link>
        {host ? (
          <p className="text-sm font-semibold text-mute">QR photo albums for events</p>
        ) : (
          <nav className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </nav>
        )}
      </footer>
    </>
  );
}
