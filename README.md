# Aera Website

The premier marketing site for Aera Analytics — "the company that does it all."
Built with [Astro](https://astro.build), deployed as a static site.

## Pages

- `/` — homepage: positioning, product grid, Aera Core platform section
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
