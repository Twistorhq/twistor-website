import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hash,recordId,reviewStatement,renderReport} from './evidence.mjs';

function fixture(){
 const bundle={productSha:'abc',records:[{id:'one',htmlHash:'h',screenshotHash:'s',violations:[],manualReview:{status:'reviewed',evaluator:'fixture only',rationale:'Test fixture'}}]};
 const statement={status:'supports',rationale:'Fixture only',evidenceIds:['one']};
 const approval={bundleHash:hash(bundle),statementHash:hash(statement),reviewer:'fixture owner',role:'product-owner'};
 return {bundle,statement,approval};
}
test('stable IDs are bound to product and flow',()=>{assert.equal(recordId('a','b','c'),recordId('a','b','c'));assert.notEqual(recordId('a','b','c'),recordId('d','b','c'));});
test('automated evidence cannot support conformance',()=>{const f=fixture();f.bundle.records[0].manualReview={status:'pending'};f.approval.bundleHash=hash(f.bundle);assert.equal(reviewStatement(f.statement,f.bundle,f.approval,'abc').status,'blocked');});
for(const [name,change] of Object.entries({
 'missing evidence':f=>{f.statement.evidenceIds=['missing']},
 'failed screenshot':f=>{f.bundle.records[0].captureError='failed'},
 'conflicting evaluators':f=>{f.bundle.records[0].conflict=true},
 'reopened regression':f=>{f.bundle.records[0].reopened=true},
 'unresolved finding':f=>{f.bundle.records[0].violations=[{rule:'label'}]},
 'empty rationale':f=>{f.statement.rationale=''},
 'unknown status':f=>{f.statement.status='whatever'},
 'missing human evaluator':f=>{delete f.bundle.records[0].manualReview.evaluator}
})) test(name,()=>{const f=fixture();change(f);f.approval.bundleHash=hash(f.bundle);f.approval.statementHash=hash(f.statement);assert.equal(reviewStatement(f.statement,f.bundle,f.approval,'abc').status,'blocked');});
test('stale version',()=>{const f=fixture();assert.equal(reviewStatement(f.statement,f.bundle,f.approval,'new').status,'blocked');});
test('changed evidence invalidates approval',()=>{const f=fixture();f.bundle.records[0].htmlHash='changed';assert.equal(reviewStatement(f.statement,f.bundle,f.approval,'abc').status,'blocked');});
test('changed statement invalidates approval',()=>{const f=fixture();f.statement.rationale='changed';assert.equal(reviewStatement(f.statement,f.bundle,f.approval,'abc').status,'blocked');});
test('missing approval',()=>{const f=fixture();assert.equal(reviewStatement(f.statement,f.bundle,null,'abc').status,'blocked');});
for(const status of ['supports','partially-supports','does-not-support','not-applicable']) test(`reviewed fixture: ${status}`,()=>{const f=fixture();f.statement.status=status;f.approval.statementHash=hash(f.statement);assert.equal(reviewStatement(f.statement,f.bundle,f.approval,'abc').status,'approved-draft');});
test('report escapes evidence text',()=>{assert.ok(renderReport({productSha:'<script>',axeVersion:'test',records:[]}).includes('&lt;script&gt;'));});
