import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// NOTE (TW-140 eval branch): the React integration exists ONLY to host the
// /demo/astryx-pilot sandbox route that evaluates Meta's Astryx design system.
// No live page uses React. If Astryx is rejected, this integration goes away.

export default defineConfig({
  site: 'https://twistor.co',
  integrations: [react()],
});
