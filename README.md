# Calm Navigation Companion — Landing Page

A world-class, immersive landing page for **Calm Navigation Companion** — a navigation
companion that turns overwhelming cities into calm, curious exploration.

The page is designed to feel like the *first chapter of the app* rather than a marketing
site: premium glassmorphism, an ambient **Flow Mode** background, a living phone preview
that continuously demos the product, and playful interactive pieces you can touch.

> **Live preview:** open `index.html` in any browser — no build step, no dependencies.

---

## Design language

| Aspect | Choice |
| --- | --- |
| **Palette** | Twilight‑aurora — misty indigo `#eef1f8` / deep twilight `#0b1020`, aurora teal `#5fd6c0`→`#17a58c`, periwinkle `#5b68e6`, warm dawn peach `#f2874f` used sparingly as the "moving light". |
| **Type** | Humanist serif display (`Iowan Old Style` / `Palatino` / `Georgia` stack, light weight) paired with a system sans for body and letter‑spaced teal eyebrows. **Zero webfont requests** → instant load, no layout shift. |
| **Form** | Soft translucent glass panels, organic rounded corners, floating elements, gentle gradients, soft shadows. |
| **Motion** | Slow, peaceful, never flashing. Ambient blobs + a capped canvas flow‑field, scroll reveals, a continuously‑demoing phone, and handcrafted micro‑interactions. |

## What's inside

- **Hero** — emotional headline, *Download soon* + *Watch the demo* CTAs, a floating phone, ambient Flow Mode background.
- **Living phone preview** — auto‑cycles through Navigation, Flow Mode, Kalimba, Calm Echoes, a premium map, gentle voice and theme switching. Tap the dots to jump.
- **Story** — why the app exists and how it changes the experience of moving through a city.
- **Features** — ten features (Calm Navigation, Flow Mode, Calm Echoes, Kalimba, Gentle Voice Guidance, Haptic Guidance, Accessibility, Privacy, Offline Support, Background Navigation), each with icon, copy and animation.
- **Interactive playground** — a **playable Kalimba** (Web Audio, keys 1–7), live **theme switching**, **Calm Echoes** reveal, a **haptic** preview (`navigator.vibrate`), and an animated **route trace**.
- **Emotionally memorable CTA** — join the beta, follow development, stay updated.

## Interactions

- **Flow Mode** (top‑right toggle) turns the whole page into a living artwork — flowing gradients, drifting light and a slow particle flow‑field. On by default, off automatically under reduced‑motion.
- **Theme** (light / dark) with a persisted preference; the whole page — including the phone — shifts mood.
- **Kalimba** — a soft A‑minor pentatonic thumb piano rendered with the Web Audio API.

## Accessibility

- Semantic landmarks, a skip link, visible focus states, `aria-pressed` / `aria-current` on toggles and tabs.
- Full keyboard support (including the Kalimba via number keys).
- `prefers-reduced-motion` disables ambient motion and reveals content immediately.
- `forced-colors` (high‑contrast) handling and carefully checked colour contrast.
- Respects the OS light/dark preference, then the user's explicit choice.

## Performance

- **No frameworks, no external assets** — one HTML file, inline SVG art (no image requests), and a system font stack (no font requests).
- Canvas flow‑field is device‑pixel‑ratio capped, particle‑count capped, and pauses when the tab is hidden or the canvas is off‑screen → **60 FPS** target.
- Scroll work is `requestAnimationFrame`‑throttled; reveals use `IntersectionObserver`.
- No layout shift: art is inline SVG with intrinsic sizing; fonts never swap.

## SEO & PWA

| File | Purpose |
| --- | --- |
| `index.html` | Meta title/description, Open Graph, Twitter cards, JSON‑LD (`SoftwareApplication`), theme‑color. |
| `site.webmanifest` | Installable PWA metadata + icons. |
| `robots.txt` | Crawl policy + sitemap pointer. |
| `sitemap.xml` | Sitemap. |
| `assets/` | `favicon.svg`, `icon-192.png`, `icon-512.png`, `icon.svg`, `og-image.png` (+ source `.svg`). |

## Project structure

```
.
├── index.html            # the entire landing page (self-contained: inline CSS + JS)
├── site.webmanifest
├── robots.txt
├── sitemap.xml
└── assets/
    ├── favicon.svg
    ├── icon.svg / icon-192.png / icon-512.png
    └── og-image.svg / og-image.png
```

The HTML is organised into clearly commented sections (tokens → base → components →
ambient/Flow Mode → sections → responsive) and the JavaScript into small, single‑purpose
modules (`ThemeModule`, `FlowModule`, `ScrollModule`, `FeaturesModule`, `KalimbaModule`,
`PhoneModule`, `PlayModule`, `UIModule`) so behaviour stays modular and duplication‑free.

## Running locally

```bash
# any static server works; for example:
python3 -m http.server 8099
# then open http://localhost:8099
```

## Deployment notes

Drop the folder on any static host (Netlify, Vercel, GitHub Pages, S3, …). Before going
live, replace the placeholder domain `https://calmnav.app` in `index.html`, `robots.txt`
and `sitemap.xml` with your real domain so canonical, Open Graph and sitemap URLs resolve.
