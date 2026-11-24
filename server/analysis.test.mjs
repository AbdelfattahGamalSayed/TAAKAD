import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, validateInput, validateResult, urlEvidence } from './analysis.mjs';
import { createServer } from './index.mjs';

const input = { text: 'Send me your OTP now.', sender: '', image: null, locale: 'en', consent: true };
const assessment = { status: 'assessed', riskLevel: 5, summary: 'An OTP request is suspicious.', observedSignals: ['Requests your OTP.'], recommendedActions: ['Do not share the code.'], limitations: ['Identity is unverified.'], evidenceQuality: 'strong', evidence: [] };

test('billing exhaustion and unavailable model have distinct sanitized recovery codes',async()=>{
 for(const [providerCode,code] of [['insufficient_quota','API_QUOTA'],['model_not_found','API_MODEL_ERROR']]){
  await assert.rejects(analyze(input,{config:{key:'test',model:'x'},fetchImpl:async()=>new Response(JSON.stringify({error:{code:providerCode,message:'private upstream message'}}),{status:providerCode==='insufficient_quota'?429:404})}),new RegExp(code));
 }
});

test('transport metadata is removed from evidence and uncertainty remains visible',async()=>{
 const raw={...assessment,evidence:[{quote:'OTP',reason:'Requests a code'},{quote:'claimedSender":"Demo only',reason:'Metadata is not message evidence'}]};
 const result=await analyze(input,{config:{key:'test',model:'x'},fetchImpl:async()=>new Response(JSON.stringify({output:[{content:[{type:'output_text',text:JSON.stringify(raw)}]}]})),reputationCheck:async()=>[]});
 assert.deepEqual(result.evidence,[{quote:'OTP',reason:'Requests a code'}]);assert.equal(result.evidenceQuality,'limited');assert.ok(result.limitations.some(x=>x.includes('removed')));
});
test('a high warning with only unsupported quotes becomes insufficient information',async()=>{
 const raw={...assessment,evidence:[{quote:'not present',reason:'Unsupported'}]};
 const result=await analyze(input,{config:{key:'test',model:'x'},fetchImpl:async()=>new Response(JSON.stringify({output:[{content:[{type:'output_text',text:JSON.stringify(raw)}]}]})),reputationCheck:async()=>[]});
 assert.equal(result.status,'insufficient_information');assert.equal(result.riskLevel,null);assert.deepEqual(result.evidence,[]);
});

test('input requires explicit consent and nonempty evidence', () => {
  assert.throws(() => validateInput({ ...input, consent: false }), /CONSENT_REQUIRED/);
  assert.throws(() => validateInput({ ...input, text: ' ' }), /EMPTY_INPUT/);
  assert.throws(() => validateInput({ ...input, text: 'x'.repeat(12001) }), /INVALID_INPUT/);
  assert.throws(() => validateInput({ ...input, image: 'https://example.com/image.png' }), /INVALID_IMAGE/);
  assert.throws(() => validateInput({ ...input, image: 'data:image/png;base64,YWJj' }), /INVALID_IMAGE/);
  assert.equal(validateInput(input).text, input.text);
});
test('unreadable evidence cannot have a reassuring score', () => {
  assert.throws(() => validateResult({ ...assessment, status: 'insufficient_information', riskLevel: 1 }), /INVALID_AI_RESPONSE/);
  assert.throws(() => validateResult({ ...assessment, riskLevel: 9 }), /INVALID_AI_RESPONSE/);
  assert.equal(validateResult({ ...assessment, status: 'insufficient_information', riskLevel: null }).riskLevel, null);
});
test('URL parsing distinguishes actual host from deceptive userinfo without fetching', () => {
  const [entry] = urlEvidence('Visit https://trusted-bank.ae@fraud.example/pay');
  assert.equal(entry.hostname, 'fraud.example');
  assert.ok(entry.signals.includes('credentials_in_url'));
  assert.equal(urlEvidence('example.com')[0].hostname, 'example.com');
});
test('AI call is stateless, structured, and receives screenshot instructions as untrusted data', async () => {
  let sent;
  const result = await analyze(input, { config: { key: 'test-key', model: 'test-model' }, fetchImpl: async (url, options) => {
    sent = JSON.parse(options.body);
    assert.equal(url, 'https://api.openai.com/v1/responses');
    return new Response(JSON.stringify({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify(assessment) }] }] }));
  } });
  assert.equal(sent.store, false);
  assert.equal(sent.text.format.strict, true);
  assert.match(sent.instructions, /UNTRUSTED DATA/);
  assert.equal(result.riskLevel, 5);
  assert.match(result.limitations.at(-1), /not guaranteed safety/);
});
test('provider errors and missing credentials never generate a score', async () => {
  await assert.rejects(analyze(input, { config: { key: '', model: 'x' } }), /API_NOT_CONFIGURED/);
  await assert.rejects(analyze(input, { config: { key: 'test', model: 'x' }, fetchImpl: async () => new Response('{}', { status: 401 }) }), /API_AUTH_ERROR/);
  await assert.rejects(analyze(input, { config: { key: 'test', model: 'x' }, fetchImpl: async () => new Response('{}', { status: 429 }) }), /API_LIMIT/);
  await assert.rejects(analyze(input, { config: { key: 'test', model: 'x' }, fetchImpl: async () => new Response(JSON.stringify({ output: [] })) }), /INVALID_AI_RESPONSE/);
});
test('HTTP endpoint enforces pairing, consent, and sanitized errors', async () => {
  let calls = 0;
  const server = createServer({ token: 'test-pairing', getConfig: () => ({ key: 'secret-never-return' }), analyzeImpl: async () => { calls++; return assessment; } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (data, token = 'test-pairing') => fetch(`${base}/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
  try {
    const status = await fetch(`${base}/api/health`).then(r => r.text());
    assert.ok(!status.includes('secret-never-return'));
    assert.equal((await post(input, 'wrong')).status, 401);
    assert.equal((await post({ ...input, consent: false })).status, 400);
    assert.equal(calls, 0);
    const response = await post(input);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).riskLevel, 5);
    assert.equal(calls, 1);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
test('HTTP endpoint does not leak internal exception contents', async () => {
  const server = createServer({ token: 't', analyzeImpl: async () => { throw new Error('private-information'); } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' }, body: JSON.stringify(input) });
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'SERVER_ERROR' });
  } finally { await new Promise(resolve => server.close(resolve)); }
});
