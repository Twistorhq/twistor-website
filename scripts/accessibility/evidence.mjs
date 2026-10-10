import {createHash} from 'node:crypto';

export const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
export const recordId = (sha, flow, view) => hash([sha, flow, view]).slice(0, 20);
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// The approval contract is inspired by Core's hash-pinned gates. No private
// Core code is copied. Human identity/authentication belongs to the caller.
export function reviewStatement(statement, bundle, approval, currentSha) {
  const fail = reason => ({status:'blocked', reason});
  if (currentSha !== bundle.productSha) return fail('stale product SHA');
  if (!approval || approval.bundleHash !== hash(bundle)) return fail('missing or stale approval');
  if (!approval.reviewer || approval.role !== 'product-owner') return fail('product-owner approval required');
  if (approval.statementHash !== hash(statement)) return fail('statement changed');
  if (!['supports','partially-supports','does-not-support','not-applicable'].includes(statement.status)) return fail('unknown status');
  if (!statement.rationale?.trim()) return fail('rationale required');
  if (!statement.evidenceIds?.length) return fail('missing evidence');
  const records = statement.evidenceIds.map(id => bundle.records.find(r => r.id === id));
  if (records.some(r => !r || r.captureError || !r.htmlHash || !r.screenshotHash)) return fail('incomplete evidence');
  if (records.some(r => r.manualReview?.status !== 'reviewed' || !r.manualReview.evaluator || !r.manualReview.rationale)) return fail('human evaluation required');
  if (records.some(r => r.conflict || r.reopened)) return fail('conflict or reopened regression');
  if (statement.status === 'supports' && records.some(r => r.violations.length)) return fail('unresolved automated findings');
  return {status:'approved-draft', conformance:statement.status};
}

export function renderReport(bundle) {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Twistor draft accessibility evidence</title><style>body{font:16px system-ui;max-width:1100px;margin:2rem auto;padding:1rem;color:#182332}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbc;padding:.6rem;text-align:left}code{overflow-wrap:anywhere}a{color:#124b9b}</style><h1>Draft accessibility evidence</h1><p>Automated observations only. Human evaluation and product-owner approval pending. Not a certification or completed ACR.</p><p>Product SHA: <code>${escapeHtml(bundle.productSha)}</code> · axe ${escapeHtml(bundle.axeVersion)}</p><p>Reduced viewport is a reflow proxy, not a verified browser zoom or assistive-technology evaluation.</p><table><caption>Five flows × four views</caption><thead><tr><th>Flow / view</th><th>Findings</th><th>Evidence</th><th>Review</th></tr></thead><tbody>${bundle.records.map(r=>`<tr><td>${escapeHtml(r.flow)} / ${escapeHtml(r.view)}</td><td>${r.violations.length}${r.captureError?' (capture failed)':''}</td><td><a href="${r.id}.png">Screenshot</a> · <a href="${r.id}.html.txt">DOM excerpt</a></td><td>Human review pending</td></tr>`).join('')}</tbody></table><h2>Scope exclusions</h2><p>Authenticated flows, screen readers, real customer data, production services, and full WCAG coverage are excluded. Static pages have no error submission flow; their status views inventory existing alert/status nodes only.</p></html>`;
}
