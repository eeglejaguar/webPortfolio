# Saim Ansari — Portfolio

An interactive, "alive" developer portfolio. Built from scratch with plain JavaScript + Vite (zero runtime dependencies, ~17 KB gzipped JS).

## What visitors can do

- **Particle hero** – the name is made of thousands of dots that dodge your cursor; click to blow them up.
- **3D project cards** – tilt + glare on hover, animated generative cover art, filter by category, click for a full case study (arrow keys to flip through).
- **Physics playground** – skills are throwable bubbles; flip gravity, go zero-G, shake.
- **Working terminal** – inline and floating (press <kbd>`</kbd>). Try `help`, `ls`, `cat redmind-ai`, `open 2`, `sudo hire saim`, `matrix`.
- **13 hidden achievements** – tracked by the 🏆 counter in the nav (Konami code included).
- Live Karachi clock, avatar that follows your cursor (poke it), scroll-lit text, magnetic buttons, custom cursor, light/dark theme.
- Respects `prefers-reduced-motion`; custom cursor only on mouse devices.

## Editing content

Everything you'd normally change lives in two files:

| File | What's in it |
|---|---|
| `src/data/site.js` | Name, roles, bio, stats, skills, **email / LinkedIn / résumé links** (empty = hidden) |
| `src/data/projects.js` | Projects – copy an object, change the fields, done |

Adding a project:

```js
{
  id: 'my-app',
  title: 'My App',
  subtitle: 'One-line description',
  category: 'saas',          // saas | ai | client | frontend | backend
  tags: ['SaaS', 'Next.js'],
  year: '2026',
  accent: '#4cc9f0',          // card colour
  art: 'orbit',               // radar | grid | waves | orbit | bars | rings
  featured: false,            // true = double-width card
  summary: 'A paragraph about it.',
  highlights: ['Feature one', 'Feature two'],
  stack: ['Next.js', 'Postgres'],
  live: 'https://…',          // '' hides the button
  repo: 'https://github.com/…',
},
```

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
```

## Deploy to Vercel (free)

1. Go to <https://vercel.com/new> and import this GitHub repo.
2. Vercel auto-detects **Vite** — keep the defaults (build `npm run build`, output `dist`).
3. Click **Deploy**. Every push to the production branch redeploys automatically.
