import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, extractText, validateInput, validateResult } from './analysis.mjs';
import { createReputationService, parseFeed, urlEvidence, FEED_URL, TTL_MS, MAX_STALE_MS } from './reputation.mjs';
import { createServer } from './index.mjs';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const screenshot=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(readFileSync(new URL('../src/lib/screenshot.ts',import.meta.url),'utf8'))).toString('base64'));
const copy=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(readFileSync(new URL('../src/lib/features.ts',import.meta.url),'utf8'))).toString('base64'));
const input={text:'Send your OTP now at https://fraud.example/pay',sender:'Bank',image:null,locale:'en',consent:true};
const result={status:'assessed',riskLevel:5,summary:'Requests a private code.',observedSignals:['Requests a code'],recommendedActions:['Do not share it.'],limitations:[],evidenceQuality:'strong',evidence:[{quote:'Send your OTP',reason:'A verification code is private.'}]};
const image='data:image/png;base64,'+Buffer.from([137,80,78,71,13,10,26,10]).toString('base64');
const transcription={status:'readable',text:'Pay now',sender:'Unknown',warnings:[]};
const config={key:'fake',model:'test'};
const model=(data=result)=>async()=>new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(data)}]}]}));
const reputationCheck=async entries=>entries.map(e=>({...e,reputation:{status:'not_listed'}}));
const options={config,fetchImpl:model(),reputationCheck};

test('only a prepared screenshot with explicit consent reaches transcription',()=>{
 for(const body of [{image,locale:'en',consent:true},{image,prepared:true,locale:'en',consent:false},{image,prepared:true,locale:'xx',consent:true},{image,prepared:true,text:'mixed',locale:'en',consent:true}]) assert.throws(()=>validateInput(body,{purpose:'extract'}));
 assert.equal(validateInput({image,prepared:true,locale:'en',consent:true},{purpose:'extract'}).image,image);
});
test('analysis rejects original images and unreviewed screenshots',()=>{
 assert.throws(()=>validateInput({...input,image}),/TEXT_REVIEW_REQUIRED/);
 assert.throws(()=>validateInput({...input,source:'reviewed_screenshot'}),/TEXT_REVIEW_REQUIRED/);
 assert.equal(validateInput({...input,source:'reviewed_screenshot',reviewConfirmed:true}).text,input.text);
});
test('invalid data and huge fields never reach providers',()=>{
 for(const body of [null,[],{...input,locale:'fr'},{...input,sender:'x'.repeat(151)},{...input,text:3},{...input,image:'data:image/png;base64,YWJj'}])assert.throws(()=>validateInput(body));
});
test('quotes must occur exactly in reviewed text or sender',()=>{
 assert.equal(validateResult(result,input.text,input.sender).evidence.length,1);
 assert.throws(()=>validateResult({...result,evidence:[{quote:'invented',reason:'Risk'}]},input.text),/INVALID_AI_RESPONSE/);
 assert.throws(()=>validateResult({...result,evidence:[{quote:'send your otp',reason:'Risk'}]},input.text),/INVALID_AI_RESPONSE/);
 assert.equal(validateResult({...result,evidence:[{quote:'Bank',reason:'Claimed sender only'}]},input.text,input.sender).evidence[0].quote,'Bank');
});
test('insufficient information cannot carry a score; invalid structure fails closed',()=>{
 assert.equal(validateResult({...result,status:'insufficient_information',riskLevel:null,evidence:[]}).riskLevel,null);
 for(const change of [{riskLevel:0},{riskLevel:6},{riskLevel:1.5},{status:'insufficient_information'},{evidenceQuality:'100%'},{recommendedActions:[]},{evidence:null},{summary:''},{observedSignals:['x'.repeat(2001)]}])assert.throws(()=>validateResult({...result,...change},input.text));
});
test('transcription is stateless and refuses embedded instructions; returns editable text',async()=>{
 let sent;
 const actual=await extractText({image,locale:'ar'},{config,fetchImpl:async(url,opt)=>{sent=JSON.parse(opt.body);return model(transcription)();}});
 assert.deepEqual(actual,transcription);assert.equal(sent.store,false);assert.equal(sent.text.format.strict,true);
 assert.match(sent.instructions,/UNTRUSTED DATA/);assert.match(sent.instructions,/Never reconstruct/);assert.match(sent.instructions,/Arabic/);
 assert.equal(sent.input[0].content[1].image_url,image);
});
test('unclear transcription is returned without a risk score',async()=>{
 const actual=await extractText({image,locale:'en'},{config,fetchImpl:model({...transcription,status:'unclear',text:'',warnings:['Unreadable']})});
 assert.equal(actual.status,'unclear');assert.equal('riskLevel' in actual,false);
});
test('malformed OCR and oversized model outputs are rejected',async()=>{
 for(const change of [{status:'readable',text:''},{text:'x'.repeat(12001)},{sender:'x'.repeat(151)},{warnings:[5]},{status:'safe'}])await assert.rejects(extractText({image,locale:'en'},{config,fetchImpl:model({...transcription,...change})}),/INVALID_AI_RESPONSE/);
});
test('analysis sends edited text only and preserves exact evidence',async()=>{
 let sent;
 const actual=await analyze(input,{...options,fetchImpl:async(url,opt)=>{sent=JSON.parse(opt.body);return model()();}});
 assert.equal(sent.input[0].content.length,1);assert.equal(sent.input[0].content[0].type,'input_text');
 assert.equal(JSON.parse(sent.input[0].content[0].text).message,input.text);
 assert.deepEqual(actual.evidence,result.evidence);assert.equal(actual.extractedText,input.text);
});
test('a listed hostname raises overall risk while preserving the separate AI score',async()=>{
 const actual=await analyze(input,{...options,fetchImpl:model({...result,riskLevel:1}),reputationCheck:async entries=>entries.map(e=>({...e,reputation:{status:'listed'}}))});
 assert.equal(actual.riskLevel,4);assert.equal(actual.messageRiskLevel,1);assert.match(actual.limitations[0],/outdated or mistaken/);
});
test('unavailable reputation never becomes a clean reputation verdict',async()=>{
 const actual=await analyze(input,{...options,reputationCheck:async()=>{throw Error('offline');}});
 assert.equal(actual.urlEvidence[0].reputation.status,'unavailable');assert.equal(actual.riskLevel,5);
});
test('provider refusal, incomplete output and malformed JSON do not generate scores',async()=>{
 for(const data of [{status:'incomplete',output:[]},{output:[{content:[{type:'refusal',refusal:'No'}]}]},{output:[{content:[{type:'output_text',text:'bad JSON'}]}]}])await assert.rejects(analyze(input,{...options,fetchImpl:async()=>new Response(JSON.stringify(data))}),/INVALID_AI_RESPONSE/);
});
for(const [status,code] of [[401,'API_AUTH_ERROR'],[403,'API_AUTH_ERROR'],[429,'API_LIMIT'],[500,'AI_UNAVAILABLE']])test('provider HTTP '+status+' is sanitized',async()=>{await assert.rejects(analyze(input,{...options,fetchImpl:async()=>new Response('private upstream error',{status})}),new RegExp(code));});
test('network failures and timeout map to explicit errors',async()=>{
 for(const name of ['TypeError','TimeoutError','AbortError'])await assert.rejects(analyze(input,{...options,fetchImpl:async()=>{const e=Error('private');e.name=name;throw e;}}),new RegExp(name==='TypeError'?'AI_UNREACHABLE':'AI_TIMEOUT'));
});
test('URL evidence identifies the real destination and never visits submitted URLs',()=>{
 const entries=urlEvidence('https://bank.ae@fraud.example/pay http://127.0.0.1:8000 https://xn--e1afmkfd.xn--p1ai https://bit.ly/x');
 assert.equal(entries[0].hostname,'fraud.example');assert.ok(entries[0].signals.includes('credentials_in_url'));
 assert.ok(entries[1].signals.includes('ip_address_host'));assert.ok(entries[1].signals.includes('unencrypted_http'));assert.ok(entries[1].signals.includes('unusual_port'));
 assert.ok(entries[2].signals.includes('internationalized_domain'));assert.notEqual(entries[2].unicodeHostname,entries[2].hostname);
 assert.ok(entries[3].signals.includes('shortened_link'));
 assert.equal(urlEvidence('user@example.com javascript:alert(1) file:///secret').length,0);
 assert.equal(urlEvidence('https://example.com https://example.com').length,1);
 assert.equal(urlEvidence(Array.from({length:15},(_,i)=>'https://site'+i+'.example').join(' ')).length,10);
});
test('feed parsing rejects malformed, empty and URL-shaped content',()=>{
 assert.deepEqual([...parseFeed('# comment\nBAD.EXAMPLE\nother.example.\n')],['bad.example','other.example']);
 for(const bad of ['', '# empty','https://fraud.example/path','<html>Error</html>'])assert.throws(()=>parseFeed(bad));
});
test('feed requests use fixed source only and exact hostname matching',async()=>{
 let calls=0;
 const check=createReputationService({fetchImpl:async(url,opts)=>{calls++;assert.equal(url,FEED_URL);assert.equal(opts.redirect,'error');return new Response('fraud.example\n');}});
 const actual=await check(urlEvidence('https://fraud.example/private?code=SECRET https://sub.fraud.example https://good.example'));
 assert.deepEqual(actual.map(e=>e.reputation.status),['listed','not_listed','not_listed']);assert.equal(calls,1);
 await check(urlEvidence('https://good.example'));assert.equal(calls,1);
 assert.equal(actual[0].reputation.matchType,'exact_hostname');
});
test('parallel feed checks share a single refresh; no links means no request',async()=>{
 let calls=0;const check=createReputationService({fetchImpl:async()=>{calls++;return new Response('fraud.example');}});
 await check([]);assert.equal(calls,0);
 await Promise.all([check(urlEvidence('fraud.example')),check(urlEvidence('good.example'))]);assert.equal(calls,1);
});
test('failed refresh uses bounded stale cache, expires and recovers',async()=>{
 let now=1000,calls=0,fail=false;
 const check=createReputationService({now:()=>now,fetchImpl:async()=>{calls++;if(fail)throw Error('offline');return new Response('fraud.example');}});
 const links=urlEvidence('fraud.example');await check(links);fail=true;now+=TTL_MS;
 let actual=await check(links);assert.equal(actual[0].reputation.status,'listed');assert.equal(actual[0].reputation.stale,true);
 await check(links);assert.equal(calls,2);
 now+=MAX_STALE_MS;actual=await check(links);assert.equal(actual[0].reputation.status,'unavailable');assert.equal(actual[0].reputation.fetchedAt,null);
 now+=61000;fail=false;actual=await check(links);assert.equal(actual[0].reputation.stale,false);assert.equal(actual[0].reputation.status,'listed');
});
test('invalid, oversized and unavailable feeds are explicitly unavailable',async()=>{
 for(const response of [()=>new Response('',{status:503}),()=>new Response('bad/feed'),()=>new Response('fraud.example',{headers:{'content-length':String(50*1024*1024)}})]){
 const check=createReputationService({fetchImpl:async()=>response()});assert.equal((await check(urlEvidence('fraud.example')))[0].reputation.status,'unavailable');}
});
test('whole-photo selection is the default and native cropping is optional',()=>{
 assert.equal(screenshot.pickerOptions().allowsEditing,false);
 assert.equal(screenshot.pickerOptions(false,'ios').allowsEditing,false);
 assert.equal(screenshot.pickerOptions(true,'ios').allowsEditing,true);
 assert.equal(screenshot.pickerOptions(true,'android').allowsEditing,true);
 assert.equal(screenshot.pickerOptions(true,'web').allowsEditing,false);
 assert.equal(screenshot.pickerOptions().allowsMultipleSelection,false);
 assert.equal(screenshot.pickerOptions().exif,false);
});
test('image sizing preserves the entire frame and does not upscale',()=>{
 assert.equal(screenshot.resizedWidth(600,400),null);
 assert.equal(screenshot.resizedWidth(1000,4000),400);
 assert.equal(screenshot.resizedWidth(4000,1000),1600);
 for(const dimensions of [[0,10],[10,-1],[NaN,100],[Infinity,10]])assert.throws(()=>screenshot.resizedWidth(...dimensions));
});
test('feed skips isolated malformed records but rejects corruption',()=>{
 const valid=Array.from({length:100},(_,i)=>'host'+i+'.example').join('\n');
 assert.equal(parseFeed(valid+'\ninvalid/record').size,100);
 assert.throws(()=>parseFeed('valid.example\ninvalid/record'));
});
test('Arabic and English have matching feature labels and four complete recovery branches',()=>{
 const {featureCopy,recoverySteps}=copy;
 assert.deepEqual(Object.keys(featureCopy.en).sort(),Object.keys(featureCopy.ar).sort());
 assert.deepEqual(Object.keys(featureCopy.en.signals).sort(),Object.keys(featureCopy.ar.signals).sort());
 for(const locale of ['en','ar'])for(const branch of ['opened','password','otp','payment'])assert.equal(recoverySteps[locale][branch].length,3);
});
test('HTTP extraction rejects unprepared uploads and dispatches separately from analysis',async()=>{
 let extractions=0,analyses=0;
 const server=createServer({token:'test',getConfig:()=>({key:'secret'}),extractImpl:async()=>{extractions++;return transcription;},analyzeImpl:async()=>{analyses++;return result;}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const post=(path,body,token='test')=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)});
 try{
  assert.equal((await post('/api/extract',{image,locale:'en',consent:true})).status,400);
  assert.equal((await post('/api/extract',{image,prepared:true,locale:'en',consent:true},'bad')).status,401);
  assert.equal((await post('/api/analyze',{...input,image})).status,400);
  const response=await post('/api/extract',{image,prepared:true,locale:'en',consent:true});assert.equal(response.status,200);assert.deepEqual(await response.json(),transcription);
  assert.equal(extractions,1);assert.equal(analyses,0);
  assert.equal((await post('/api/analyze',{...input,source:'reviewed_screenshot',reviewConfirmed:true})).status,200);assert.equal(analyses,1);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
test('HTTP concurrency limit rejects a third request, then releases slots',async()=>{
 let release;const gate=new Promise(resolve=>{release=resolve;});let entered=0;
 const server=createServer({token:'t',analyzeImpl:async()=>{entered++;await gate;return result;}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const post=()=>fetch('http://127.0.0.1:'+server.address().port+'/api/analyze',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer t'},body:JSON.stringify(input)});
 try{const a=post(),b=post();while(entered<2)await new Promise(resolve=>setTimeout(resolve,5));assert.equal((await post()).status,429);release();assert.equal((await a).status,200);assert.equal((await b).status,200);assert.equal((await post()).status,200);}
 finally{release();await new Promise(resolve=>server.close(resolve));}
});
