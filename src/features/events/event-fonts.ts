import {
  Caveat,
  Cinzel,
  Cormorant_Garamond,
  Great_Vibes,
  IBM_Plex_Mono,
  Manrope,
  Newsreader,
  Nunito,
  Oswald,
  Pacifico,
  Playfair_Display,
  Zilla_Slab,
} from "next/font/google";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-round",
  subsets: ["latin"],
  weight: ["500", "700"],
  preload: false,
});

const oswald = Oswald({
  variable: "--font-narrow",
  subsets: ["latin"],
  weight: ["500", "700"],
  preload: false,
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["500", "700"],
  preload: false,
});

const cormorant = Cormorant_Garamond({
  variable: "--font-classic",
  subsets: ["latin"],
  weight: ["500", "700"],
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
  preload: false,
});

const zilla = Zilla_Slab({
  variable: "--font-slab",
  subsets: ["latin"],
  weight: ["500", "700"],
  preload: false,
});

const cinzel = Cinzel({
  variable: "--font-roman",
  subsets: ["latin"],
  weight: ["500", "700"],
  preload: false,
});

const greatVibes = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
  preload: false,
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500", "700"],
  preload: false,
});

const pacifico = Pacifico({
  variable: "--font-brush",
  subsets: ["latin"],
  weight: "400",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
  preload: false,
});

export const eventFontClassName = [
  manrope.variable,
  nunito.variable,
  oswald.variable,
  newsreader.variable,
  cormorant.variable,
  playfair.variable,
  zilla.variable,
  cinzel.variable,
  greatVibes.variable,
  caveat.variable,
  pacifico.variable,
  plexMono.variable,
].join(" ");
