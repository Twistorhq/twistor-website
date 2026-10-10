import {chromium} from '@playwright/test';
import axe from 'axe-core';
import {execFileSync} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import {hash,recordId,renderReport} from './evidence.mjs';

const base = new URL(process.env.AUDIT_URL || 'http://127.0.0.1:4321');
if (!['127.0.0.1','localhost','[::1]'].includes(base.hostname)) throw Error('Only local targets are authorized');
const productSha = execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const dirty = execFileSync('git',['status','--porcelain','--','src','public','astro.config.mjs'],{encoding:'utf8'}).trim();
if (dirty) throw Error('Commit target application changes before collecting evidence');
const out = 'artifacts/accessibility';
await mkdir(out,{recursive:true});
const browser = await chromium.launch({headless:true, ...(process.env.AUDIT_CHROMIUM ? {executablePath:process.env.AUDIT_CHROMIUM} : {})});
const flows = ['/', '/products/compliance-agent/', '/products/trades-front-office/', '/products/dispatch-os/', '/surfaces/dispatch-board/'];
const bundle = {schemaVersion:1,productSha,createdAt:new Date().toISOString(),axeVersion:axe.version,method:'axe plus browser observations v1',records:[],exclusions:['Authenticated flows: no authorized accounts','Human screen-reader and real 200% browser zoom evaluation pending']};
try {
  for (const flow of flows) for (const view of ['initial','keyboard','reflow-proxy','error-status']) {
    const page = await browser.newPage({viewport:{width:view==='reflow-proxy'?640:1280,height:900}});
    // Prevent a local page from contacting real third-party services.
    await page.route('**/*', route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
    const id = recordId(productSha,flow,view);
    const record = {id,flow,view,violations:[],manualReview:{status:'pending'},observations:{}};
    try {
      const response = await page.goto(new URL(flow,base).href);
      if (!response?.ok()) throw Error(`HTTP ${response?.status()}`);
      await page.waitForLoadState('networkidle');
      if (flow.includes('surfaces')) await page.getByRole('searchbox').waitFor();
      if (view==='keyboard') {
        record.observations.focusSequence=[];
        for(let i=0;i<8;i++) {await page.keyboard.press('Tab');record.observations.focusSequence.push(await page.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent?.slice(0,100),label:document.activeElement.getAttribute('aria-label')})));}
      }
      if(view==='error-status' && flow.includes('surfaces')) {
        await page.getByRole('searchbox').fill('NO_MATCH_AUDIT');
        await page.getByText('No jobs match this filter.',{exact:false}).waitFor();
      }
      record.observations.statusText=await page.locator('[role="status"], [role="alert"]').allTextContents();
      record.observations.horizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      await page.addScriptTag({content:axe.source});
      const results = await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
      record.violations=results.violations.map(v=>({rule:v.id,impact:v.impact,help:v.help,helpUrl:v.helpUrl,tags:v.tags,nodes:v.nodes.map(n=>({locator:n.target,html:n.html,summary:n.failureSummary}))}));
      record.incomplete=results.incomplete.map(v=>({rule:v.id,nodes:v.nodes.map(n=>({locator:n.target,html:n.html}))}));
      const html=await page.locator('body').evaluate(el=>el.outerHTML);
      await writeFile(`${out}/${id}.html.txt`,html);
      record.htmlHash=hash(html);
      const screenshot=await page.screenshot({path:`${out}/${id}.png`,fullPage:true});
      record.screenshotHash=hash(screenshot.toString('base64'));
    } catch(error) { record.captureError=String(error); }
    bundle.records.push(record);
    await page.close();
  }
} finally {await browser.close();}
await writeFile(`${out}/bundle.json`,JSON.stringify(bundle,null,2));
await writeFile(`${out}/index.html`,renderReport(bundle));
const backlog = [...new Map(bundle.records.flatMap(r=>r.violations.flatMap(v=>v.nodes.map(n=>{const key=hash([r.flow,v.rule,n.locator]).slice(0,20);return [key,{id:key,flow:r.flow,rule:v.rule,locator:n.locator,helpUrl:v.helpUrl,status:'open'}]})))).values()];
await writeFile(`${out}/backlog.json`,JSON.stringify(backlog,null,2));
await writeFile(`${out}/draft-acr.json`,JSON.stringify({status:'blocked-pending-human-evaluation',productSha,bundleHash:hash(bundle),statements:[],note:'Draft working data, not an ITI template or a conformance claim'},null,2));
console.log(JSON.stringify({records:bundle.records.length,captureErrors:bundle.records.filter(r=>r.captureError).length,backlog:backlog.length,output:out}));
if(bundle.records.some(r=>r.captureError)) process.exitCode=1;
