import {createHmac,randomUUID,timingSafeEqual,createHash} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
const memory=new Map();
function send(res,status,data){return res.status(status).json({...data,simulation:true})}
function session(req,res){
 const secret=process.env.CASEWORK_SESSION_SECRET||'';
 // Only accept persistent sessions backed by signed HttpOnly cookies in production.
 if(process.env.VERCEL && secret.length<32)throw Error('Session security unavailable');
 if(!process.env.VERCEL && secret.length<32)return createHash('sha256').update('casework-local-demo').digest('hex');
 const raw=String(req.headers?.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('cw_graphql='))?.slice(11)||'';
 const parts=raw.split('.');
 let id='';
 if(secret.length>=32&&parts.length===2&&/^[a-f0-9-]{36}$/.test(parts[0])&&/^[a-f0-9]{64}$/.test(parts[1])){
  const expected=createHmac('sha256',secret).update(parts[0]).digest('hex');
  if(timingSafeEqual(Buffer.from(expected),Buffer.from(parts[1])))id=parts[0];
 }
 if(!id){id=randomUUID();if(secret.length>=32){
  const sig=createHmac('sha256',secret).update(id).digest('hex');
  res.setHeader('Set-Cookie','cw_graphql='+id+'.'+sig+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400');
 }}
 return createHash('sha256').update('casework-graphql-demo:'+id).digest('hex');
}
async function storage(key,id,review,write){
 if(process.env.DATABASE_URL){
  const sql=neon(process.env.DATABASE_URL);
  if(write){
   const rows=await sql`INSERT INTO demo_draft_settings(workspace_hash,draft_id,review,revision)
    VALUES(${key},${id},${review},1)
    ON CONFLICT(workspace_hash,draft_id) DO UPDATE SET review=EXCLUDED.review,
    revision=demo_draft_settings.revision+1, updated_at=now()
    RETURNING review,revision`;
   return rows[0];
  }
  const rows=await sql`SELECT review,revision FROM demo_draft_settings WHERE workspace_hash=${key} AND draft_id=${id}`;
  return rows[0]||{review:false,revision:0};
 }
 if(process.env.VERCEL)throw Error('Persistence database unavailable');
 const k=key+':'+id;
 if(write){const old=memory.get(k);const v={review,revision:(old?.revision||0)+1};memory.set(k,v);return v;}
 return memory.get(k)||{review:false,revision:0};
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Casework-Simulation','true');
 if(req.method!=='POST')return send(res,405,{errors:[{message:'POST required'}]});
 let body;
 try{body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};}catch{return send(res,400,{errors:[{message:'Invalid JSON'}]})}
 if(!body||typeof body!=='object'||Array.isArray(body)||JSON.stringify(body).length>4000)return send(res,413,{errors:[{message:'Invalid or oversized request'}]});
 if(!['UpdateDraftSettings','ReadDraftSettings'].includes(body.operationName))return send(res,400,{errors:[{message:'Unknown fictional operation'}]});
 const v=body.variables||{};
 if(typeof v!=='object'||Array.isArray(v))return send(res,400,{errors:[{message:'Invalid variables'}]});
 // Preserve actual GraphQL semantics: HTTP 200 can contain a validation error.
 if(typeof v.draftId!=='string'||!v.draftId.trim())return send(res,200,{data:null,errors:[{message:'Variable "$draftId" of required type "ID!" was not provided.',extensions:{code:'BAD_USER_INPUT'}}]});
 if(v.draftId!=='demo_42')return send(res,200,{data:null,errors:[{message:'Fictional draft not found.',extensions:{code:'NOT_FOUND'}}]});
 try{
  const id=session(req,res);
  if(body.operationName==='ReadDraftSettings'){
   const stored=await storage(id,v.draftId,false,false);
   return send(res,200,{data:{draftSettings:{draftId:v.draftId,review:stored.review,revision:stored.revision,persisted:true}}});
  }
  const stored=await storage(id,v.draftId,Boolean(v.settings?.review),true);
  return send(res,200,{data:{updateDraftSettings:{success:true,draftId:v.draftId,review:stored.review,revision:stored.revision,persisted:true}}});
 }catch{return send(res,503,{errors:[{message:'Persistent fictional test store unavailable.',extensions:{code:'SERVICE_UNAVAILABLE'}}]})}
}
