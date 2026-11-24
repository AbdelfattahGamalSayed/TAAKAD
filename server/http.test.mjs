import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchJson } from '../src/lib/http.ts';
const url='http://demo.invalid/api/test';
test('a stalled native fetch has a deadline even if abort is ignored', async()=>{
 await assert.rejects(fetchJson(url,{}, {timeoutMs:20,timeoutCode:'AI_TIMEOUT',fetchImpl:()=>new Promise(()=>{})}),/AI_TIMEOUT/);
});
test('deadline also covers a stalled response body',async()=>{
 await assert.rejects(fetchJson(url,{}, {timeoutMs:20,fetchImpl:async()=>({ok:true,json:()=>new Promise(()=>{})})}),/NETWORK/);
});
test('caller cancellation remains active alongside the request deadline',async()=>{
 const controller=new AbortController();const result=fetchJson(url,{signal:controller.signal},{timeoutMs:500,fetchImpl:()=>new Promise(()=>{})});controller.abort();await assert.rejects(result,/REQUEST_CANCELLED/);
});
test('completed requests preserve server recovery codes',async()=>{
 await assert.rejects(fetchJson(url,{}, {fetchImpl:async()=>new Response(JSON.stringify({error:'UNAUTHORIZED'}),{status:401})}),/UNAUTHORIZED/);
 assert.deepEqual(await fetchJson(url,{}, {fetchImpl:async()=>new Response('{"ok":true}')}),{ok:true});
});
