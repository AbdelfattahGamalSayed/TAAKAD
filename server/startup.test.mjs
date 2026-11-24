import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {inspectRunningApp} from '../scripts/dev-preflight.mjs';
async function fixture(t,service='TAAKAD'){
 const server=http.createServer((req,res)=>{
  const health=req.url==='/api/health';res.writeHead(health||req.headers.authorization==='Bearer synthetic-pairing'?200:401,{'Content-Type':'application/json'});
  res.end(JSON.stringify(health?{ok:true,service}:{items:[]}));
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));return server.address().port;
}
test('a matching running session is reused without spawning another backend',async t=>{
 const apiPort=await fixture(t),metroPort=await fixture(t);
 assert.equal((await inspectRunningApp({apiPort,metroPort,token:'synthetic-pairing'})).status,'running');
});
test('a different checkout pairing is never silently reused',async t=>{
 const apiPort=await fixture(t),metroPort=await fixture(t);
 assert.equal((await inspectRunningApp({apiPort,metroPort,token:'other-checkout'})).status,'conflict');
});
test('partial and unrelated listeners get a conflict instead of being killed',async t=>{
 const apiPort=await fixture(t);
 assert.equal((await inspectRunningApp({apiPort,metroPort:0,token:'synthetic-pairing'})).status,'conflict');
 const metroPort=await fixture(t,'Other application');
 assert.equal((await inspectRunningApp({apiPort,metroPort,token:'synthetic-pairing'})).status,'conflict');
});
