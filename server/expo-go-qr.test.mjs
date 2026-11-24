import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtempSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {showExpoGo} from '../scripts/show-expo-go.mjs';

async function fixture(t,manifest){
 const directory=mkdtempSync(join(tmpdir(),'taakad-qr-'));
 t.after(()=>rmSync(directory,{recursive:true,force:true}));
 const requests=[];
 const server=http.createServer((req,res)=>{
  requests.push(req.headers);
  res.writeHead(200,{'Content-Type':manifest?'application/expo+json':'text/html'});
  res.end(manifest?JSON.stringify({extra:{expoClient:{sdkVersion:'58.0.0'}}}):'<html>Browser only</html>');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 return {origin:'http://127.0.0.1:'+server.address().port,directory:pathToFileURL(directory+'/'),path:directory,requests};
}

test('an existing Expo server produces a native QR and account instructions without restarting it',async t=>{
 const f=await fixture(t,true),messages=[];
 const target=await showExpoGo({...f,open:false,log:message=>messages.push(message)});
 assert.equal(target,f.origin.replace('http:','exp:'));
 assert.equal(f.requests[0]['expo-platform'],'ios');
 assert.equal(readFileSync(join(f.path,'expo-go-url.txt'),'utf8'),target);
 assert.equal(readFileSync(join(f.path,'expo-go.png')).subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.match(readFileSync(join(f.path,'expo-go.html'),'utf8'),/same Expo account/);
 assert.ok(messages.some(message=>message.includes('EXPO GO DEVELOPMENT QR')));
});

test('a browser-only response cannot produce a misleading Expo Go QR',async t=>{
 const f=await fixture(t,false);
 await assert.rejects(showExpoGo({...f,open:false,log:()=>{}}),/did not provide an Expo Go project/);
 assert.equal(existsSync(join(f.path,'expo-go.png')),false);
});
