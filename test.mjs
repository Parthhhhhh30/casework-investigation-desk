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

test('AI service fails closed without configured provider',async()=>{ const flag=process.env.CASEWORK_ALLOW_MODEL_CALLS,key=process.env.GEMINI_API_KEY;delete process.env.GEMINI_API_KEY;process.env.CASEWORK_ALLOW_MODEL_CALLS='false';try{const r=await invoke(ai,'POST',{});assert.equal(r.status,503)}finally{if(flag===undefined)delete process.env.CASEWORK_ALLOW_MODEL_CALLS;else process.env.CASEWORK_ALLOW_MODEL_CALLS=flag;if(key!==undefined)process.env.GEMINI_API_KEY=key}});
test('fictional GraphQL invalid variables are rejected',async()=>{const r=await invoke(graphql,'POST',{operationName:'UpdateDraftSettings',variables:[]});assert.equal(r.status,400)});

test('AI service fails closed without signed-session secret',async()=>{const before=Object.fromEntries(['CASEWORK_ALLOW_MODEL_CALLS','GEMINI_API_KEY','CASEWORK_SESSION_SECRET'].map(k=>[k,process.env[k]]));Object.assign(process.env,{CASEWORK_ALLOW_MODEL_CALLS:'true',GEMINI_API_KEY:'test-placeholder-not-a-real-key',CASEWORK_SESSION_SECRET:''});try{const r=await invoke(ai,'POST',{});assert.equal(r.status,503);assert.match(r.data.error,/session security/i)}finally{for(const [k,v] of Object.entries(before)){if(v===undefined)delete process.env[k];else process.env[k]=v}}});

test('previous passing evidence cannot close a changed case',()=>{
 const c=fresh().cases[0];
 c.fault.expired=false;
 c.diagnostics.push({...diagnostic(c),at:'2026-11-07T00:00:00.000Z'});
 c.verified=true;
 c.note='Session refreshed successfully with simulated server results and trace';
 c.replyApproved=true;
 c.reply='I retested the simulated session and confirmed successful access to the fictional workspace';
 c.verificationRequiredAfter='2026-11-07T00:01:00.000Z';
 assert.equal(canClose(c).ok,false);
});

test('rejects broad false assurances absent from the previous keyword list',()=>{
 assert.ok(checkResponse('Our investigation confirms this account is entirely safe and this issue will never happen again.').length>0);
});
test('routine login is not automatically eligible for security escalation',()=>{
 const c=fresh().cases[0];c.note='A fictional sign-in session expired; no confidentiality evidence was found.';
 c.diagnostics.push({...diagnostic(c),at:new Date().toISOString()});
 assert.equal(validateEscalation(c,'Security','Routing a normal expired session to Security without any observed incident.').ok,false);
});
test('reply approval must be tied to the latest diagnostic and exact text',()=>{
 const c=fresh().cases[0];c.fault.expired=false;c.diagnostics.push({...diagnostic(c),at:new Date().toISOString()});c.verified=true;
 c.note='An observed 401 was resolved after refreshing the fictional session.';
 c.reply='The fictional session was refreshed and access was retested successfully. Please try opening your workspace again.';
 c.replyApproved=true;c.replyApprovedFor=c.reply;c.approvalDiagnosticAt=c.diagnostics.at(-1).at;
 assert.equal(canClose(c).ok,true);
 c.reply='I guarantee this will never happen again and your account is entirely safe.';
 assert.equal(canClose(c).ok,false);
});
