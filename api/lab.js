function send(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({...data,simulation:true}));}
export default function handler(req,res){
 if(req.method!=='POST')return send(res,405,{error:'POST required'});
 let b;try{b=typeof req.body==='string'?JSON.parse(req.body):req.body||{}}catch{return send(res,400,{error:'Invalid JSON'})}
 if(JSON.stringify(b).length>3000)return send(res,413,{error:'Request too large'});
 const {kind,fault}=b;
 if(!['login','documents','legal'].includes(kind)||!fault||typeof fault!=='object'||Array.isArray(fault))return send(res,422,{error:'Invalid simulated case'});
 if(kind==='login'){
  const expired=fault.expired===true;
  return send(res,200,{pass:!expired,category:'Account/session',label:expired?'SESSION_EXPIRED':'SESSION_VALID',lines:['GET /workspace → '+(expired?'401 SESSION_EXPIRED':'200 OK'),'Identity: fictional user account validated','Token expiry: '+(expired?'earlier than current session':'within active session')],guidance:expired?'Refresh the fictional session; never request a password.':'Simulated workspace access succeeds.'});
 }
 if(kind==='documents'){
  const security=fault.security===true,stale=fault.stale===true;
  return send(res,200,{pass:!security&&!stale,category:security?'Security':'Document state',label:security?'POSSIBLE_ACCESS_MISMATCH':stale?'STALE_SNAPSHOT':'SNAPSHOT_CURRENT',lines:['Source version: v5','Imported snapshot: '+(stale?'v4':'v5'),'Access review: '+(security?'MISMATCH — STOP ROUTINE INVESTIGATION':'No unexpected access detected'),'Integration: independent simulation; no vendor connection'],guidance:security?'Escalate immediately to Security.':stale?'Refresh the fictional snapshot and verify the revision.':'Fictional snapshot matches source revision.'});
 }
 return send(res,200,{pass:false,category:'Patent-domain',label:'UNVERIFIED_REFERENCE',lines:['Generated text: reference [P-1842]','Source registry: no supporting entry in fictional evidence set','Legal validation: NOT PERFORMED','Domain reviewer: required'],guidance:'Do not certify legal accuracy; refer to qualified patent counsel.'});
}