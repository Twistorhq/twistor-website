import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// NOTE (TW-150 adoption): the React integration hosts the /demo/astryx-pilot
// eval sandbox AND the adopted interactive surfaces (src/pages/surfaces/**),
// which mount React islands through the ui/ wrapper layer. The marketing site
// (all pages outside surfaces/ and demo/) ships zero React. If interactive
// surfaces ever go React-free, this integration goes away.

export default defineConfig({
  site: 'https://twistor.co',
  integrations: [react()],
});
