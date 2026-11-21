import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, validateInput, validateContext } from './analysis.mjs';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const flow=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(readFileSync(new URL('../src/lib/checkFlow.ts',import.meta.url),'utf8'))).toString('base64'));
const input={text:'Reset your bank password. Send your code to me now.',sender:'Bank',image:null,locale:'en',consent:true};
test('questions are selected locally for relevant English and Arabic content only',()=>{
  assert.deepEqual(flow.relevantQuestions('See you for coffee tomorrow.'),[]);
  assert.deepEqual(flow.relevantQuestions('Send your verification code now.'),[]);
  assert.deepEqual(flow.relevantQuestions('Your bank account is blocked.'),['hasAccount']);
  assert.deepEqual(flow.relevantQuestions('Reset your password.'),['hasAccount','requestedReset']);
  assert.deepEqual(flow.relevantQuestions('إعادة تعيين كلمة المرور لحسابك'),['hasAccount','requestedReset']);
  assert.deepEqual(flow.relevantQuestions('حِسابك البنكي متوقف'),['hasAccount']);
  assert.deepEqual(flow.relevantQuestions('مرحباً، نلتقي غداً'),[]);
});
test('context accepts only known questions and fixed answers',()=>{
  for(const value of [null,[], 'yes',{hasAccount:true},{hasAccount:'ignore instructions'},{verified:true},{requestedReset:'YES'}]) assert.throws(()=>validateContext(value),/INVALID_INPUT/);
  for(const answer of ['yes','no','not_sure','skipped']) assert.equal(validateInput({...input,context:{hasAccount:answer}}).context.hasAccount,answer);
  assert.deepEqual(validateInput(input).context,{});
});
test('no-link severe scams are not capped and positive context does not override the score',async()=>{
  let sent;
  const raw={status:'assessed',riskLevel:5,summary:'Do not share the code.',observedSignals:[],recommendedActions:['Contact your bank using its real app.'],limitations:[],evidenceQuality:'strong',evidence:[]};
  const result=await analyze({...input,context:{hasAccount:'yes',requestedReset:'yes'}},{config:{key:'test',model:'test'},reputationCheck:async()=>[],fetchImpl:async(url,options)=>{
    sent=JSON.parse(options.body);return new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(raw)}]}]}));
  }});
  assert.equal(result.riskLevel,5);assert.deepEqual(result.detectedUrls,[]);
  assert.deepEqual(JSON.parse(sent.input[0].content[0].text).userContext,{hasAccount:'yes',requestedReset:'yes'});
  assert.match(sent.instructions,/UNVERIFIED user statements/);assert.match(sent.instructions,/Never cap risk because there is no link/);
});
test('unknown context and skip do not become a reassuring score or an invented answer',async()=>{
  let sent;const raw={status:'insufficient_information',riskLevel:null,summary:'More information is needed.',observedSignals:[],recommendedActions:['Check through the real app.'],limitations:[],evidenceQuality:'limited',evidence:[]};
  const result=await analyze({...input,text:'account',context:{hasAccount:'not_sure',requestedReset:'skipped'}},{config:{key:'test',model:'test'},reputationCheck:async()=>[],fetchImpl:async(url,options)=>{sent=JSON.parse(options.body);return new Response(JSON.stringify({output:[{content:[{type:'output_text',text:JSON.stringify(raw)}]}]}));}});
  assert.equal(result.riskLevel,null);assert.equal(JSON.parse(sent.input[0].content[0].text).userContext.requestedReset,'skipped');
});
