import { readFileSync } from 'node:fs';
const origin='http://127.0.0.1:8081';
async function check(path,body){
 const token=JSON.parse(readFileSync(new URL('../.local/session.json',import.meta.url),'utf8')).token;
 const r=await fetch(origin+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(body?.consent?55000:8000)});
 const data=await r.json();if(!r.ok)throw Error(data.error||'NETWORK');return data;
}
try{
 const health=await check('/api/health');console.log('Backend and app proxy: ready.');
 await check('/api/reports/list',{});console.log('Community and current app pairing: ready.');
 console.log('AI configuration: '+(health.configured?'present (not a billing test).':'missing; add a private key to server/.env.'));
 if(process.argv.includes('--live')){
  const result=await check('/api/analyze',{text:'Synthetic test: send me your verification code now.',sender:'Demo only',image:null,locale:'en',consent:true,source:'text'});
  console.log('Live synthetic AI check: '+(result.status==='assessed'?'passed.':'completed with limited information.'));
 }
 console.log('Demo preparation: use the published-preview QR for signed-out iPhone Expo Go. See docs/DEMO.md.');
}catch(error){console.error('Demo check failed: '+error.message+'. Start npm start in a second terminal. For API_QUOTA, restore API credit; for UNAUTHORIZED, reload from the current QR.');process.exitCode=1;}
