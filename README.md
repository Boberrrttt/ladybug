<p align="center">
  <img src="src/app/icon.svg" alt="Ladybug" width="80" height="80" />
</p>

<h1 align="center">Ladybug</h1>

<p align="center">
  QR photo albums for events.<br />
  Photos from the room, in one album.
</p>

<p align="center">
  <a href="https://ladybug-ivory.vercel.app">Live app</a>
</p>

A host creates an event, prints a QR code, and guests add photos and short videos from their phones. Guest albums need no accounts.

## How it works

1. **Create.** Sign up, name the event, and Ladybug opens a guest album.
2. **Share.** Copy the link, open the album, or download the QR to print.
3. **Collect.** Every upload lands in that album. The host can add media too.

## What you can do

- Run many events from one host account.
- Give each event its own look: color preset, page color, font, and cover image.
- Attach an optional Google Drive link on the album.
- Upload images (JPEG, PNG, WebP, GIF, up to 100 MB) and video (MP4, WebM, up to 25 MB).
- Keep an album to 1,000 items and 3 GB.

Guest links look like `/event/<slug>`. Older `/e/<slug>` links redirect there.

## Stack

Next.js, React, TypeScript, Tailwind CSS, MongoDB, ImageKit, and Vercel.

## Run it locally

Requires Node.js and a MongoDB database.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3004](http://localhost:3004).

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Database connection |
| `SESSION_SECRET` | Signs the host session cookie |
| `SESSION_COOKIE_SECURE` | Send the session cookie only over HTTPS |
| `TRUST_PROXY` | Trust `X-Forwarded-For` when a proxy sets it |
| `APP_ORIGIN` | Public origin used in guest links and QR codes |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit upload key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |

```bash
npm test
npm run lint
npm run build
```
