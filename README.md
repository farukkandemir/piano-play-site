# getpianoplay.com

Static Astro site for piano.play. Spec: [docs/spec.md](docs/spec.md).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve dist/
```

## Where things live

- `src/styles/tokens.css`: colours, type, radii, motion (identical to the app).
- `src/data/*.ts`: all copy and lists. `src/data/site.ts` has the launch switch (`launched`, `appStoreUrl`, `appStoreId`).
- `src/components/home/*`: one component per landing section. `Hero.astro` can be swapped on its own.
- `src/components/privacy/*`, `src/components/support/*`: page bodies.
- `public/fonts/`: Outfit variable WOFF2 (OFL, from Fontsource), self-hosted.
- `public/_headers`: cache headers for Cloudflare.

## Deploy (Cloudflare)

Build command `npm run build`, output directory `dist`, Node 22.12+. No adapter (static).
Works on Cloudflare Pages as specified. Cloudflare now recommends Workers static assets for new
projects; the same `dist/` and `_headers` work there with a `wrangler.jsonc` of
`{ "name": "getpianoplay", "compatibility_date": "2026-09-25", "assets": { "directory": "./dist" } }`.

## Owner-supplied files

- Apple iPhone bezel (landscape PNG, Apple Design Resources) → see `src/data/listenPlay.ts`.
- Apple "Download on the App Store" badge SVG → `src/assets/images/app-store-badge.svg`, used when `launched` is true.
