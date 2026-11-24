import test from 'node:test';
import assert from 'node:assert/strict';
import {structuredCall} from './model.mjs';
import {analyze} from './analysis.mjs';
import {createServer} from './index.mjs';
const config={key:'synthetic-key',model:'synthetic-model'};
const input={text:'Send your code now.',sender:'Synthetic',locale:'en',consent:true,image:null};
const result={status:'assessed',riskLevel:5,summary:'Do not share your code.',observedSignals:[],recommendedActions:['Keep the code private.'],limitations:[],evidenceQuality:'limited',evidence:[]};
const response=(x=result)=>new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(x)}]}]}));
const payload={instructions:'Synthetic instructions',text:'Synthetic message',schema:{type:'object'},name:'synthetic'};
const base={config,sleepImpl:async()=>{},reputationCheck:async()=>[]};

test('one HTTP request recovers from a temporary provider failure without another user request',async()=>{
 let calls=0;const diagnostics=[];
 const server=createServer({token:'synthetic',onDiagnostic:e=>diagnostics.push(e),analyzeImpl:(input,options)=>analyze(input,{...base,...options,fetchImpl:async()=>++calls===1?new Response('temporary',{status:503}):response()})});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  const r=await fetch(`http://127.0.0.1:${server.address().port}/api/analyze`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer synthetic'},body:JSON.stringify(input)});
  assert.equal(r.status,200);assert.equal((await r.json()).riskLevel,5);assert.equal(calls,2);
  assert.deepEqual(diagnostics,[{stage:'analyze',event:'retry',attempt:1,code:'AI_UNAVAILABLE'}]);
  assert.ok(!JSON.stringify(diagnostics).includes(input.text));assert.ok(!JSON.stringify(diagnostics).includes(config.key));
 }finally{await new Promise(r=>server.close(r));}
});
test('invalid assessment gets one bounded fresh attempt while score/consent/evidence checks remain strict',async()=>{
 let calls=0;
 const actual=await analyze(input,{...base,fetchImpl:async()=>response(++calls===1?{...result,status:'insufficient_information',riskLevel:5}:result)});
 assert.equal(calls,2);assert.equal(actual.riskLevel,5);
});
test('temporary network and rate errors recover with backoff and the same stateless payload',async()=>{
 let calls=0;const waits=[],bodies=[];
 const x=await structuredCall(payload,{...base,sleepImpl:async ms=>waits.push(ms),fetchImpl:async(_,init)=>{
  bodies.push(init.body);calls++;if(calls===1)throw new TypeError('synthetic network failure');
  if(calls===2)return new Response('{}',{status:429,headers:{'retry-after':'1'}});return response();
 }});
 assert.equal(x.riskLevel,5);assert.equal(calls,3);assert.deepEqual(waits,[300,1000]);assert.equal(new Set(bodies).size,1);assert.equal(JSON.parse(bodies[0]).store,false);
});
test('billing, authentication, missing model, invalid provider request and explicit refusals are never retried',async()=>{
 const failures=[()=>new Response(JSON.stringify({error:{code:'insufficient_quota'}}),{status:429}),()=>new Response('{}',{status:401}),()=>new Response(JSON.stringify({error:{code:'model_not_found'}}),{status:404}),()=>new Response('{}',{status:400}),()=>new Response(JSON.stringify({output:[{content:[{type:'refusal',refusal:'synthetic'}]}]}))];
 for(const failure of failures){let calls=0;await assert.rejects(structuredCall(payload,{...base,fetchImpl:async()=>{calls++;return failure();}}));assert.equal(calls,1);}
});
test('exhausted retries return an error, never a fabricated assessment',async()=>{
 let calls=0;await assert.rejects(structuredCall(payload,{...base,fetchImpl:async()=>{calls++;return new Response('{}',{status:502});}}),/AI_UNAVAILABLE/);assert.equal(calls,3);
 let attempted=false;await assert.rejects(structuredCall(payload,{...base,config:{key:'',model:'x'},fetchImpl:async()=>{attempted=true;return response();}}),/API_NOT_CONFIGURED/);assert.equal(attempted,false);
});
test('one deadline bounds fetch and response bodies even if an implementation ignores abort',async()=>{
 for(const fetchImpl of [()=>new Promise(()=>{}),async()=>({ok:true,json:()=>new Promise(()=>{})})]){
  const start=Date.now();await assert.rejects(structuredCall(payload,{...base,fetchImpl,timeoutMs:55,attemptTimeoutMs:20,retryDelayMs:0}),/AI_TIMEOUT/);assert.ok(Date.now()-start<500);
 }
});
test('cancellation during backoff stops all remaining attempts; long Retry-After is not ignored',async()=>{
 const controller=new AbortController();let calls=0;
 await assert.rejects(structuredCall(payload,{config,signal:controller.signal,onRetry:()=>controller.abort(),fetchImpl:async()=>{calls++;return new Response('{}',{status:503});}}),/REQUEST_CANCELLED/);assert.equal(calls,1);
 calls=0;await assert.rejects(structuredCall(payload,{...base,timeoutMs:1000,fetchImpl:async()=>{calls++;return new Response('{}',{status:429,headers:{'retry-after':'120'}});}}),/API_LIMIT/);assert.equal(calls,1);
});
test('leaving an HTTP request aborts its model work and releases the concurrency slot',async()=>{
 let started,aborted;const ready=new Promise(r=>started=r),stopped=new Promise(r=>aborted=r);
 const server=createServer({token:'synthetic',analyzeImpl:async(_,options)=>{started();await new Promise(r=>options.signal.addEventListener('abort',r,{once:true}));aborted();throw Error('cancelled');}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const controller=new AbortController();
 try{
  const pending=fetch(`http://127.0.0.1:${server.address().port}/api/analyze`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer synthetic'},body:JSON.stringify(input),signal:controller.signal}).catch(()=>{});
  await ready;controller.abort();await pending;await Promise.race([stopped,new Promise((_,reject)=>setTimeout(()=>reject(Error('Abort not propagated')),500))]);
 }finally{await new Promise(r=>server.close(r));}
});
