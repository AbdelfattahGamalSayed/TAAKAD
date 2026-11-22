import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createDemoAuth } from './auth.mjs';
import { createServer } from './index.mjs';
const phone='+971500000000',ip='test';
test('demo codes are single use, never phone verification, and sessions expire or revoke',()=>{
  let time=100;const auth=createDemoAuth({now:()=>time});const challenge=auth.start({phone},ip);
  assert.equal(challenge.mode,'demo');assert.match(challenge.demoCode,/^\d{6}$/);
  const session=auth.verify({challengeId:challenge.challengeId,code:challenge.demoCode},ip);
  assert.equal(session.phoneVerified,false);assert.equal(auth.requireSession(session.token).mode,'demo');
  assert.throws(()=>auth.verify({challengeId:challenge.challengeId,code:challenge.demoCode},ip),/AUTH_EXPIRED/);
  assert.deepEqual(auth.preview(session.token,{action:'preview'},ip),{mode:'demo',published:false});
  assert.throws(()=>auth.preview('forged',{action:'preview'},ip),/AUTH_REQUIRED/);
  time+=3600000;assert.throws(()=>auth.requireSession(session.token),/AUTH_REQUIRED/);
  const second=auth.start({phone},ip);const next=auth.verify({challengeId:second.challengeId,code:second.demoCode},ip);auth.logout(next.token);
  assert.throws(()=>auth.requireSession(next.token),/AUTH_REQUIRED/);
});
test('resend cooldown, old-code invalidation, code expiry and phone limits are server enforced',()=>{
  let time=0;const auth=createDemoAuth({now:()=>time});const first=auth.start({phone},ip);
  assert.throws(()=>auth.start({phone},ip),/AUTH_RESEND/);time+=30000;
  const second=auth.start({phone},ip);assert.throws(()=>auth.verify({challengeId:first.challengeId,code:first.demoCode},ip),/AUTH_EXPIRED/);
  time+=300000;assert.throws(()=>auth.verify({challengeId:second.challengeId,code:second.demoCode},ip),/AUTH_EXPIRED/);
  for(let i=0;i<3;i++){time+=30000;auth.start({phone},ip);}
  time+=30000;assert.throws(()=>auth.start({phone},ip),/AUTH_RATE_LIMIT/);
});
test('five wrong attempts consume a challenge; phone input cannot bypass validation',()=>{
  const auth=createDemoAuth();for(const bad of [null,{}, {phone:123},{phone:'hello'},{phone:'+1'}, {phone:'x'.repeat(100)}])assert.throws(()=>auth.start(bad,ip),/AUTH_PHONE/);
  const item=auth.start({phone},ip),wrong=item.demoCode==='000000'?'111111':'000000';
  for(let i=0;i<4;i++)assert.throws(()=>auth.verify({challengeId:item.challengeId,code:wrong},ip),/AUTH_CODE/);
  assert.throws(()=>auth.verify({challengeId:item.challengeId,code:wrong},ip),/AUTH_ATTEMPTS/);
  assert.throws(()=>auth.verify({challengeId:item.challengeId,code:item.demoCode},ip),/AUTH_EXPIRED/);
});
test('IP/global limits stop rotating numbers; verification throttles unknown challenges',()=>{
  const auth=createDemoAuth();for(let i=0;i<20;i++)auth.start({phone:'+97150'+String(i).padStart(7,'0')},ip);
  assert.throws(()=>auth.start({phone:'+971599999999'},ip),/AUTH_RATE_LIMIT/);
  for(let i=0;i<30;i++)assert.throws(()=>auth.verify({challengeId:'unknown',code:'123456'},ip),/AUTH_EXPIRED/);
  assert.throws(()=>auth.verify({challengeId:'unknown',code:'123456'},ip),/AUTH_RATE_LIMIT/);
  const global=createDemoAuth();for(let i=0;i<100;i++)global.start({phone:'+97150'+String(i).padStart(7,'0')},String(i));
  assert.throws(()=>global.start({phone:'+971599999999'},'new'),/AUTH_RATE_LIMIT/);
});
test('HTTP guest cannot submit a preview and only a server-issued demo session can pass',async t=>{
  const server=createServer({token:'test',alerts:{get:()=>({items:[]})}});server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());
  const base='http://127.0.0.1:'+server.address().port;
  const post=(path,body,session,paired=true)=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(paired?{Authorization:'Bearer test'}:{}),...(session?{'X-Session-Token':session}:{})},body:JSON.stringify(body)});
  assert.equal((await post('/api/auth/start',{phone},null,false)).status,401);
  assert.equal((await post('/api/community/preview',{action:'preview'})).status,401);
  const challenge=await (await post('/api/auth/start',{phone})).json();
  const session=await (await post('/api/auth/verify',{challengeId:challenge.challengeId,code:challenge.demoCode})).json();
  assert.equal(session.phoneVerified,false);
  assert.equal((await post('/api/community/preview',{text:''},session.token)).status,400);
  const result=await (await post('/api/community/preview',{action:'preview'},session.token)).json();assert.equal(result.published,false);
  await post('/api/auth/logout',{},session.token);assert.equal((await post('/api/community/preview',{action:'preview'},session.token)).status,401);
  assert.equal((await fetch(base+'/api/alerts',{headers:{Authorization:'Bearer test'}})).status,200);
});
