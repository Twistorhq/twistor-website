// Export the built iteration for offline review; never publish or collect data.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(new URL('..',import.meta.url).pathname);
let html=await readFile(resolve(root,'dist/trades/index.html'),'utf8');
const links=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
for(const [tag] of links){
  const path=tag.match(/href="([^"]+)"/)?.[1];
  if(!path?.startsWith('/_astro/')) throw Error('Unexpected stylesheet path');
  const css=await readFile(resolve(root,'dist',path.slice(1)),'utf8');
  html=html.replace(tag,`<style>${css}</style>`);
}
// The offline review has no corporate homepage; keep its brand link local.
html=html.replaceAll('href="/"','href="#main"');
if(/<script\b|<form\b|href="\/_astro\//.test(html)) throw Error('Review must be self-contained and read-only');
await mkdir(resolve(root,'docs/previews'),{recursive:true});
await writeFile(resolve(root,'docs/previews/trades-hero-01.html'),html);
console.log('Exported docs/previews/trades-hero-01.html');
