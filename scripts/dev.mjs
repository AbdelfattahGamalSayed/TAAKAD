import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspectRunningApp } from './dev-preflight.mjs';
import { showPreview } from './show-preview.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const args=process.argv.slice(2),demo=args.includes('--demo'),open=!args.includes('--no-open');
const expoArgs=args.filter(arg=>!['--demo','--no-open'].includes(arg));
const children=[];
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill();process.exit(code);}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
function start(commandArgs,env=process.env){
  const child=spawn(process.execPath,commandArgs,{cwd:root,env,stdio:'inherit'});children.push(child);
  child.on('error',()=>{console.error('Could not start TAAKAD. Check dependencies and run npm ci.');stop(1);});
  child.on('exit',code=>stop(code??1));return child;
}
async function ready(origin){
  for(let attempt=0;attempt<90;attempt++){
    try{const r=await fetch(origin+'/api/health',{signal:AbortSignal.timeout(1000)});if(r.ok&&(await r.json()).service==='TAAKAD')return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,400));
  }
  throw Error('TAAKAD did not become ready. Check the server messages above.');
}
try{
  if(!existsSync(new URL('../node_modules/expo/bin/cli',import.meta.url)))throw Error('Dependencies are missing. Run npm ci, then npm run setup.');
  const session=new URL('../.local/session.json',import.meta.url);
  let token;try{token=JSON.parse(readFileSync(session,'utf8')).token;}catch{/* Fresh checkout. */}
  const state=await inspectRunningApp({token});
  if(state.status==='running'){
    console.log('TAAKAD is already running on ports 8081 and 8787. No second server was started.');
    if(demo)await showPreview({open});
    else console.log('For the signed-out iPhone test, run npm run demo. Use its published QR, not a development-server QR.');
    process.exit(0);
  }
  if(state.status==='conflict')throw Error('Port '+state.ports.join(' / ')+' is already in use by a partial or different session. Stop that server in its original terminal, then run this command again. No existing process was stopped.');
  if(demo&&!existsSync(new URL('../.local/committee-preview-url.txt',import.meta.url)))throw Error('No published preview is configured here. See docs/DEMO.md.');
  mkdirSync(new URL('../.local/',import.meta.url),{recursive:true});
  if(!existsSync(session))writeFileSync(session,JSON.stringify({token:randomBytes(24).toString('hex')}));
  console.log('Starting TAAKAD backend and app server.');
  if(!demo)console.log('Development QR: iPhone requires matching Expo logins. For the published committee QR, use npm run demo.');
  start(['server/index.mjs']);await ready('http://127.0.0.1:8787');
  start(['node_modules/expo/bin/cli','start','--go','--clear','--port','8081',...expoArgs],demo?{...process.env,CI:'1'}:process.env);
  if(demo){await ready('http://127.0.0.1:8081');await showPreview({open});}
}catch(error){console.error(error.message);stop(1);}
