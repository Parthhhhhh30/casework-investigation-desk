import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
import graphql from './api/graphql.js';import lab from './api/lab.js';import status from './api/status.js';import ai from './api/ai.js';
const root=path.dirname(fileURLToPath(import.meta.url));const routes={'/api/graphql':graphql,'/api/lab':lab,'/api/status':status,'/api/ai':ai};
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css'};
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{
 try{
 const u=new URL(req.url,'http://localhost'),route=routes[u.pathname];
 if(route){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>15000){res.writeHead(413);return res.end()}}
 let body={};try{body=raw?JSON.parse(raw):{}}catch{body=raw}
 res.status=function(n){res.statusCode=n;return res};res.json=function(o){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(o));return res};
 return await route({...req,body},res)}
 const p=u.pathname==='/'?'index.html':u.pathname.substring(1);
 if(!['index.html','app.js','rules.mjs','styles.css'].includes(p)){res.writeHead(404);return res.end('Not found')}
 const data=await fs.readFile(path.join(root,p));res.setHeader('Content-Type',types[path.extname(p)]||'text/plain');res.end(data)
 }catch(e){res.writeHead(500);res.end('Internal error')}
}).listen(port,'127.0.0.1',()=>console.log('CASEWORK test server on '+port));
