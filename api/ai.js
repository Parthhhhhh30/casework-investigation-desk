function send(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data))}
export default async function handler(req,res){
 if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
 // Fail closed: no public identity, quotas or persistent usage ledger are configured.
 // The API key is never exposed to browsers or returned in responses.
 if(process.env.CASEWORK_ALLOW_MODEL_CALLS!=='true'||!process.env.GEMINI_API_KEY)
  return send(res,503,{error:'Live model integration is disabled. No simulated AI output is provided.'});
 // A dedicated server-only private gate is required before an upstream call can occur.
 const {timingSafeEqual}=await import('node:crypto');
 const secret=process.env.CASEWORK_AI_ACCESS_CODE||'';
 const provided=String(req.headers['x-casework-ai-access']||'');
 const a=Buffer.from(secret),b=Buffer.from(provided);
 if(secret.length<24||a.length!==b.length||!timingSafeEqual(a,b))return send(res,403,{error:'Private AI access required.'});
 return send(res,503,{error:'Model calls remain unavailable until durable per-workspace and global quotas are implemented.'});
}