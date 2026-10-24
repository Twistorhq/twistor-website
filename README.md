# Twistor Website

The premier marketing site for Twistor — "the company that does it all."
Built with [Astro](https://astro.build), deployed as a static site.

## Pages

- `/` — homepage: positioning, product grid, Twistor Core platform section
- `/products/dental-front-office/` — Dental AI Front Office
- `/products/trades-front-office/` — Trades AI Front Office
- `/products/dispatch-os/` — Dispatch OS
- `/products/compliance-agent/` — Compliance Evidence Agent
- `/products/data-analytics/` — Managed Data + Analytics

## Content rules

- **No invented testimonials, client names, or metrics.** Placeholder blocks are
  clearly marked and are replaced only with real pilot results.
- Pricing shown is the approved price shape; re-verify before quoting to prospects.

## Development

```bash
npm install
npm run dev     # local dev server
npm run build   # static build to dist/
```

## Deployment

Static hosting (target: Fly.io static or Cloudflare Pages — decided at launch).
Custom domain goes live once Justynn secures it.

## Contributing: the Confess gate

This repo runs Confess, a local pre-push gate for AI-assisted work.
Commits carrying an AI co-author marker pause at push time until the
pusher answers three questions in their own words; answers are logged
to `CONFESSIONS.md`. Enable it once per checkout:

```bash
sh tools/confess/enable.sh
```

Full details: [docs/confess-gate.md](docs/confess-gate.md).
