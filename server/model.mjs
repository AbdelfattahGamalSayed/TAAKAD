import { readFileSync } from 'node:fs';
export class AnalysisError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}
export function readConfig() {
  const values = {};
  try {
    for (const line of readFileSync(new URL('./.env', import.meta.url), 'utf8').split(/\r?\n/)) {
      const match = line.trim().match(/^([A-Z_]+)\s*=\s*(.*)$/);
      if (match) values[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    }
  } catch { /* Configuration may be absent during setup. */ }
  return { key: values.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '', model: values.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini' };
}
const retryCodes=new Set(['AI_TIMEOUT','AI_UNREACHABLE','AI_UNAVAILABLE','API_LIMIT','INVALID_AI_RESPONSE']);
function pause(ms,signal){
 return new Promise((resolve,reject)=>{
  const abort=()=>{clearTimeout(timer);reject(new AnalysisError('REQUEST_CANCELLED',499));};
  const timer=setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve();},ms);
  if(signal?.aborted)return abort();signal?.addEventListener('abort',abort,{once:true});
 });
}
function retryAfter(value){
 if(!value)return 0;const seconds=Number(value);
 return Number.isFinite(seconds)?Math.max(0,seconds*1000):Math.max(0,Date.parse(value)-Date.now())||0;
}
async function attemptCall(payload,{config,fetchImpl,signal,timeoutMs,validate}){
 const controller=new AbortController();let timer,onAbort;
 const stopped=new Promise((_,reject)=>{
  onAbort=()=>{reject(new AnalysisError('REQUEST_CANCELLED',499));controller.abort();};
  timer=setTimeout(()=>{reject(new AnalysisError('AI_TIMEOUT',503));controller.abort();},timeoutMs);
  if(signal?.aborted)onAbort();else signal?.addEventListener('abort',onAbort,{once:true});
 });
 try{
  if(signal?.aborted)return await stopped;
  const operation=(async()=>{
   let response;
   try{response=await fetchImpl('https://api.openai.com/v1/responses',{
    method:'POST',headers:{Authorization:'Bearer '+config.key,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal
   });}catch(error){throw new AnalysisError(['TimeoutError','AbortError'].includes(error.name)?'AI_TIMEOUT':'AI_UNREACHABLE',503);}
   if(!response.ok){
    let providerCode;try{providerCode=(await response.json())?.error?.code;}catch{}
    if(providerCode==='insufficient_quota')throw new AnalysisError('API_QUOTA',503);
    if(providerCode==='model_not_found')throw new AnalysisError('API_MODEL_ERROR',503);
    if([401,403].includes(response.status))throw new AnalysisError('API_AUTH_ERROR',503);
    const error=new AnalysisError(response.status===429?'API_LIMIT':'AI_UNAVAILABLE',response.status===429?429:502);
    error.retryable=response.status===429||response.status===408||response.status>=500;
    error.retryAfterMs=retryAfter(response.headers.get('retry-after'));throw error;
   }
   let data;
   try{data=await response.json();}catch{throw new AnalysisError('INVALID_AI_RESPONSE',502);}
   const parts=(Array.isArray(data?.output)?data.output:[]).flatMap(item=>Array.isArray(item?.content)?item.content:[]).filter(Boolean);
   if(parts.some(item=>item.type==='refusal')){
    const error=new AnalysisError('INVALID_AI_RESPONSE',502);error.retryable=false;throw error;
   }
   let result;
   try{
    if(data?.status&&data.status!=='completed')throw Error();
    result=JSON.parse(parts.filter(item=>item.type==='output_text').map(item=>item.text).join(''));
   }catch{throw new AnalysisError('INVALID_AI_RESPONSE',502);}
   return validate?validate(result):result;
  })();
  return await Promise.race([operation,stopped]);
 }finally{clearTimeout(timer);signal?.removeEventListener('abort',onAbort);}
}
export async function structuredCall({ instructions, text, image = null, schema, name, validate }, {
 config = readConfig(), fetchImpl = fetch, signal, maxAttempts=3, timeoutMs=42000, attemptTimeoutMs=18000,
 retryDelayMs=300, sleepImpl=pause, onRetry=()=>{}
} = {}) {
  if (!config.key || config.key.includes('YOUR_')) throw new AnalysisError('API_NOT_CONFIGURED', 503);
  const content = [{ type: 'input_text', text }];
  if (image) content.push({ type: 'input_image', image_url: image, detail: 'high' });
  const payload={model:config.model,instructions,input:[{role:'user',content}],store:false,max_output_tokens:4000,text:{format:{type:'json_schema',name,strict:true,schema}}};
  const deadline=Date.now()+timeoutMs,limit=Math.max(1,Math.min(3,maxAttempts));
  for(let attempt=1;attempt<=limit;attempt++){
   if(signal?.aborted)throw new AnalysisError('REQUEST_CANCELLED',499);
   const remaining=deadline-Date.now();if(remaining<=0)throw new AnalysisError('AI_TIMEOUT',503);
   try{return await attemptCall(payload,{config,fetchImpl,signal,validate,timeoutMs:Math.min(attemptTimeoutMs,remaining)});}
   catch(error){
    if(attempt===limit||error.retryable===false||!retryCodes.has(error.code))throw error;
    const delay=Math.max(retryDelayMs*2**(attempt-1),error.retryAfterMs||0);
    if(delay>=deadline-Date.now())throw error;
    onRetry({attempt,code:error.code});await sleepImpl(delay,signal);
   }
  }
}
