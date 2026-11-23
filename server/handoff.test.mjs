import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createReports} from './reports.mjs';
import {createServer} from './index.mjs';
const input={channel:'sms',request:'code',outcome:'shared',needsHelp:true,privateNote:'Synthetic PRIVATE evidence',aiConsent:false};
const owner={ownerId:'owner',expiresAt:100000},other={ownerId:'other',expiresAt:100000};
const consent=id=>({id,action:'request',consent:true,consentVersion:'demo-handoff-v1'});
test('handoff requires separate exact consent, rejects real contacts and isolates private data',async()=>{
 const r=createReports({now:()=>0}),p=await r.prepare(owner,input,'ip');
 assert.deepEqual(r.support({action:'list'}).items,[]);
 assert.throws(()=>r.handoff(owner,{id:p.id,action:'request'}),/HANDOFF_CONSENT/);
 assert.throws(()=>r.handoff(owner,{...consent(p.id),contact:'real@example.com'}),/HANDOFF_INPUT/);
 assert.throws(()=>r.handoff(owner,{...consent(p.id),recipient:'Aman'}),/HANDOFF_INPUT/);
 assert.throws(()=>r.handoff(owner,{...consent(p.id),consentVersion:'future'}),/HANDOFF_CONSENT/);
 assert.throws(()=>r.handoff(other,consent(p.id)),/REPORT_NOT_FOUND/);
 r.handoff(owner,consent(p.id));assert.equal(r.list().items.length,0); // public posting is not required
 const queue=r.support({action:'list'});assert.deepEqual(Object.keys(queue.items[0]).sort(),['expiresAt','id','status']);
 const opened=r.support({id:p.id,action:'open'});assert.equal(opened.status,'demo_opened');assert.equal(opened.contact,'demo-person@example.invalid');
 for(const key of ['privateNote','owner','needsHelp','checks','ai','phone'])assert.ok(!(key in opened));
 assert.ok(!JSON.stringify(opened).includes(input.privateNote));
 r.publish(owner,{id:p.id,consent:true});assert.ok(!JSON.stringify(r.list()).includes('handoff'));assert.ok(!JSON.stringify(r.list()).includes('example.invalid'));
 r.support({id:p.id,action:'close'});assert.equal(r.mine(owner).items[0].handoff.status,'demo_closed');
 assert.deepEqual(r.mine(owner).items[0].handoff.events.map(e=>e.action),['consented','open','close']);
 r.handoff(owner,{id:p.id,action:'revoke'});assert.equal(r.support({action:'list'}).items.length,0);assert.throws(()=>r.support({id:p.id,action:'open'}),/REPORT_NOT_FOUND/);
 assert.equal(r.mine(owner).items[0].handoff.contact,undefined);
 r.handoff(owner,consent(p.id));r.withdraw(owner,{id:p.id});assert.throws(()=>r.support({id:p.id,action:'open'}),/REPORT_NOT_FOUND/);
 assert.throws(()=>r.handoff(owner,consent(p.id)),/HANDOFF_INPUT/);
});
test('handoff expires with its report and enforces request limits',async()=>{
 let now=0;const r=createReports({now:()=>now}),p=await r.prepare(owner,input,'ip');r.handoff(owner,consent(p.id));
 for(let i=0;i<19;i++)r.handoff(owner,consent(p.id));assert.throws(()=>r.handoff(owner,consent(p.id)),/REPORT_RATE/);
 r.handoff(owner,{id:p.id,action:'revoke'});assert.equal(r.mine(owner).items[0].handoff.status,'revoked');
 now=100000;assert.deepEqual(r.support({action:'list'}).items,[]);assert.throws(()=>r.support({id:p.id,action:'open'}),/REPORT_NOT_FOUND/);
});
test('HTTP support is unavailable to guests, report owners and moderators; support cannot moderate',async t=>{
 const server=createServer({token:'paired',moderatorToken:'moderator',supportToken:'support'});server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());
 const base='http://127.0.0.1:'+server.address().port;
 const post=(path,body,extra={})=>fetch(base+'/api/'+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer paired',...extra},body:JSON.stringify(body)});
 const ch=await(await post('auth/start',{phone:'+971500000450'})).json();const auth=await(await post('auth/verify',{challengeId:ch.challengeId,code:ch.demoCode})).json();const user={'X-Session-Token':auth.token};
 const p=await(await post('reports/prepare',input,user)).json();
 assert.equal((await post('reports/handoff',consent(p.id))).status,401);
 assert.equal((await post('reports/handoff',consent(p.id),user)).status,200);
 for(const headers of [{},user,{'X-Moderator-Token':'Bearer moderator'},{'X-Support-Token':'Bearer moderator'}])assert.equal((await post('reports/support',{action:'list'},headers)).status,403);
 const support={'X-Support-Token':'Bearer support'};
 assert.equal((await post('reports/moderation',{action:'list'},support)).status,403);
 const detail=await(await post('reports/support',{action:'open',id:p.id},support)).json();assert.equal(detail.status,'demo_opened');assert.ok(!JSON.stringify(detail).includes(input.privateNote));
 await post('reports/handoff',{id:p.id,action:'revoke'},user);assert.equal((await post('reports/support',{id:p.id,action:'open'},support)).status,404);
});
