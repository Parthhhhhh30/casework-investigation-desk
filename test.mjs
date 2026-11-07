import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,diagnostic,canClose,validateEscalation,checkResponse} from './rules.mjs';
import lab from './api/lab.js';
import graphql from './api/graphql.js';
import ai from './api/ai.js';
function invoke(fn,method='POST',body={}){
 return new Promise((resolve,reject)=>{
 let statusCode=200,headers={},result;
 const res={setHeader:(k,v)=>{headers[k]=v;return res},status(n){statusCode=n;return res},json(obj){result=obj;resolve({status:statusCode,data:result});return res},end(raw){try{result=JSON.parse(raw)}catch{result=raw}resolve({status:statusCode,data:result});return res},set statusCode(n){statusCode=n},get statusCode(){return statusCode}};
 Promise.resolve(fn({method,body,headers:{}},res)).catch(reject);
 });
}
test('four distinct synthetic investigations',()=>{const a=fresh().cases;assert.deepEqual(a.map(x=>x.kind),['login','graphql','documents','legal']);for(const x of a)assert.equal(x.state,'New')});
test('every initial case fails diagnosis',()=>{for(const x of fresh().cases)assert.equal(diagnostic(x).pass,false)});
test('repair and recheck deterministic faults',()=>{let c=fresh().cases;c[0].fault.expired=false;c[1].fault.missingId=false;c[2].fault.stale=false;assert.ok(c.slice(0,3).every(x=>diagnostic(x).pass));assert.equal(diagnostic(c[3]).pass,false)});
test('cannot close unresolved, unverified or legal cases',()=>{for(const c of fresh().cases)assert.equal(canClose(c).ok,false)});
test('security and legal cases must be escalated to specialist',()=>{const [,,sec,legal]=fresh().cases;sec.fault.security=true;assert.equal(validateEscalation(sec,'Engineering','investigate').ok,false);assert.equal(validateEscalation(legal,'Engineering','investigate').ok,false)});
test('rejects unsupported customer assurances',()=>{assert.ok(checkResponse('This is definitely fixed and guaranteed 100% secure, please continue.').length>0)});
test('diagnostic API rejects unsupported methods',async()=>{const r=await invoke(lab,'GET');assert.equal(r.status,405)});
test('diagnostic API fails then passes after repair',async()=>{const bad=await invoke(lab,'POST',{kind:'login',fault:{expired:true}});const good=await invoke(lab,'POST',{kind:'login',fault:{expired:false}});assert.equal(bad.data.pass,false);assert.equal(good.data.pass,true);assert.equal(good.data.simulation,true)});
test('document security indicator cannot be reported passing',async()=>{const r=await invoke(lab,'POST',{kind:'documents',fault:{security:true,stale:false}});assert.equal(r.data.pass,false)});
test('GraphQL application error remains visible with HTTP 200',async()=>{const r=await invoke(graphql,'POST',{operationName:'UpdateDraftSettings',variables:{settings:{review:true}}});assert.equal(r.status,200);assert.ok(r.data.errors.length)});
test('GraphQL valid mutation succeeds in fictional service',async()=>{const r=await invoke(graphql,'POST',{operationName:'UpdateDraftSettings',variables:{draftId:'demo_42',settings:{review:true}}});assert.equal(r.data.data.updateDraftSettings.success,true)});
test('model endpoint fails closed without configured access',async()=>{const r=await invoke(ai,'POST',{caseId:'CW-101',kind:'login',draft:'A sufficiently long sample message for the test'});assert.ok([403,503].includes(r.status));assert.equal('output' in r.data,false)});

test('GraphQL rejects malformed JSON without throwing',async()=>{const r=await invoke(graphql,'POST','{invalid');assert.equal(r.status,400);assert.ok(r.data.errors)});
test('GraphQL rejects oversized requests',async()=>{const r=await invoke(graphql,'POST',{operationName:'UpdateDraftSettings',variables:{padding:'x'.repeat(5000)}});assert.equal(r.status,413)});
