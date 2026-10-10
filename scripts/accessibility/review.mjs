import {readFile,writeFile} from 'node:fs/promises';
import {hash,reviewStatement} from './evidence.mjs';
import {resolve,dirname} from 'node:path';

const [bundlePath, statementsPath, approvalPath, currentSha, outputPath] = process.argv.slice(2);
if(!outputPath) throw Error('Usage: node scripts/accessibility/review.mjs bundle.json statements.json approvals.json CURRENT_SHA output.json');
const bundle=JSON.parse(await readFile(bundlePath,'utf8'));
for(const r of bundle.records){
 if(!/^[a-f0-9]{20}$/.test(r.id)) throw Error('Invalid evidence ID');
 const html=await readFile(resolve(dirname(bundlePath),`${r.id}.html.txt`),'utf8');
 const png=await readFile(resolve(dirname(bundlePath),`${r.id}.png`));
 if(hash(html)!==r.htmlHash || hash(png.toString('base64'))!==r.screenshotHash) throw Error(`Tampered evidence ${r.id}`);
}
const statements=JSON.parse(await readFile(statementsPath,'utf8'));
const approvals=JSON.parse(await readFile(approvalPath,'utf8'));
const results=statements.map((statement,i)=>({statement,result:reviewStatement(statement,bundle,approvals[i],currentSha)}));
await writeFile(outputPath,JSON.stringify({label:'Draft only; locally supplied reviewer assertions are not authenticated identities',results},null,2));
if(!results.length || results.some(r=>r.result.status==='blocked')) process.exitCode=1;
