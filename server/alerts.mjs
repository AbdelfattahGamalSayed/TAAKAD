import { XMLParser, XMLValidator } from 'fast-xml-parser';
import robotsParser from 'robots-parser';
import { decode } from 'he';
import { createHash } from 'node:crypto';

export const ORIGIN = 'https://www.mediaoffice.abudhabi';
export const ROBOTS_URL = ORIGIN + '/robots.txt';
export const PERMISSION_URL = ORIGIN + '/en/rss-news-feeds-abu-dhabi-media-office/';
export const TERMS_URL = ORIGIN + '/en/terms-conditions/';
export const AGENT = 'TAAKADAlerts/1.0';
export const INTERVAL = 60 * 60 * 1000;
export const MAX_STALE = 24 * INTERVAL;
const MAX_BYTES = 2 * 1024 * 1024;
export const SOURCES = Object.freeze(['en','ar'].flatMap(locale=>['security','technology','community'].map(category=>Object.freeze({
 id:'admo-'+locale+'-'+category, locale, category, url:ORIGIN+'/'+locale+'/'+category+'/rss/',
 publisher:'Abu Dhabi Media Office', permissionUrl:PERMISSION_URL, termsUrl:TERMS_URL, reviewedAt:'2026-11-19',
}))));
const FETCH_URLS = new Set([ROBOTS_URL,...SOURCES.map(s=>s.url)]);
const parser = new XMLParser({ignoreAttributes:true,parseTagValue:false,trimValues:true,processEntities:false});
export function plainText(value) {
 if(typeof value!=='string')return '';
 return decode(value).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ').replace(/\s+/g,' ').trim();
}
export function officialLink(value,locale) {
 if(typeof value!=='string')return null;
 try {
  const u=new URL(decode(value));
  if(u.origin!==ORIGIN||u.username||u.password||u.port||!u.pathname.startsWith('/'+locale+'/')||u.pathname.includes('/rss')||/[%\\]/.test(u.pathname))return null;
  u.hash='';u.search='';return u.href;
 }catch{return null;}
}
export function relevant(text) {
 const t=text.normalize('NFKC').replace(/[\u064b-\u065f\u0670]/g,'');
 return /\b(cyber(?:security)?|phishing|smishing|vishing|ransomware|malware|scams?|fraud(?:ulent)?|online safety|digital safety|data breach|identity theft|one.time password)\b/i.test(t)
 || /سيبراني|تصيد|احتيال|ابتزاز|برمجيات خبيثة|فيروسات|فدية|أمان الإنترنت|أمن المعلومات|السلامة الرقمية|الأمان الرقمي|اختراق|رمز التحقق/.test(t);
}
export function parseFeed(xml,source,now=Date.now()) {
 if(typeof xml!=='string'||Buffer.byteLength(xml)>MAX_BYTES||/<!DOCTYPE|<!ENTITY/i.test(xml)||XMLValidator.validate(xml)!==true)throw Error('INVALID_FEED');
 const doc=parser.parse(xml);if(!doc.rss||!Object.hasOwn(doc.rss,'channel'))throw Error('INVALID_FEED');
 const raw=doc.rss.channel.item;const list=raw?(Array.isArray(raw)?raw:[raw]):[];
 if(list.length>500)throw Error('INVALID_FEED');
 const out=[];
 for(const item of list){
  const title=plainText(item.title).slice(0,500),description=plainText(item.description),url=officialLink(item.link,source.locale);
  const timestamp=typeof item.pubDate==='string'?Date.parse(item.pubDate):NaN;
  if(!title||!url||!Number.isFinite(timestamp)||timestamp>now||now-timestamp>365*24*INTERVAL||!relevant(title+' '+description))continue;
  out.push({id:createHash('sha256').update(url).digest('hex').slice(0,20),title,excerpt:description.slice(0,360)+(description.length>360?'…':''),url,
   publishedAt:new Date(timestamp).toISOString(),locale:source.locale,sourceId:source.id,publisher:source.publisher,older:now-timestamp>30*24*INTERVAL});
 }
 return out;
}
async function limitedText(response,limit) {
 if(Number(response.headers.get('content-length'))>limit||!response.body)throw Error('RESPONSE_TOO_LARGE');
 const reader=response.body.getReader();let size=0;const chunks=[];
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit)throw Error('RESPONSE_TOO_LARGE');chunks.push(Buffer.from(value));}}
 finally{await reader.cancel().catch(()=>{});}
 return Buffer.concat(chunks).toString('utf8');
}
export function createAlertsService({fetchImpl=fetch,now=Date.now,sleep=ms=>new Promise(r=>setTimeout(r,ms))}={}) {
 const cache=new Map();let active=null,nextAttempt=0,pausedUntil=0,timer=null,lastCheckedAt=null;
 async function fetchFixed(url,headers={}) {
  if(!FETCH_URLS.has(url))throw Error('SOURCE_NOT_ALLOWED');
  const response=await fetchImpl(url,{redirect:'error',signal:AbortSignal.timeout(12000),headers:{'User-Agent':AGENT,Accept:'application/rss+xml, application/xml, text/plain',...headers}});
  if([429,503].includes(response.status)){
   const retry=response.headers.get('retry-after');const delay=retry&&/^\d+$/.test(retry)?Number(retry)*1000:Date.parse(retry||'')-now();
   pausedUntil=now()+(Number.isFinite(delay)&&delay>0?delay:INTERVAL);
   nextAttempt=Math.max(nextAttempt,pausedUntil);
  }
  return response;
 }
 async function collect(){
  lastCheckedAt=new Date(now()).toISOString();nextAttempt=now()+INTERVAL;
  let robots;
  try{
   const response=await fetchFixed(ROBOTS_URL);
   if(!response.ok)throw Error('ROBOTS_UNAVAILABLE');
   const text=await limitedText(response,128*1024);
   if(/<html|<!doctype/i.test(text))throw Error('ROBOTS_UNAVAILABLE');
   robots=robotsParser(ROBOTS_URL,text);
  }catch{
   for(const source of SOURCES)cache.set(source.id,{...cache.get(source.id),error:'ROBOTS_UNAVAILABLE'});
   return;
  }
  const delay=Math.max(500,Number(robots.getCrawlDelay(AGENT)||0)*1000);
  for(const source of SOURCES){
   const previous=cache.get(source.id)||{};
   if(robots.isAllowed(source.url,AGENT)!==true||delay>60000){
    // A new disallow removes previously cached items from the public response.
    cache.set(source.id,{error:'ROBOTS_DISALLOWED'});continue;
   }
   if(now()<pausedUntil){cache.set(source.id,{...previous,error:'SOURCE_UNAVAILABLE'});continue;}
   await sleep(delay);
   try{
    const headers={};
    if(previous.etag)headers['If-None-Match']=previous.etag;
    if(previous.modified)headers['If-Modified-Since']=previous.modified;
    const response=await fetchFixed(source.url,headers);
    if(response.status===304&&previous.items){cache.set(source.id,{...previous,checkedAt:now(),error:null});continue;}
    if(!response.ok)throw Error('SOURCE_UNAVAILABLE');
    const type=response.headers.get('content-type')||'';
    if(!/xml/i.test(type))throw Error('INVALID_FEED');
    const items=parseFeed(await limitedText(response,MAX_BYTES),source,now());
    cache.set(source.id,{items,checkedAt:now(),etag:response.headers.get('etag'),modified:response.headers.get('last-modified'),error:null});
   }catch(error){cache.set(source.id,{...previous,error:['INVALID_FEED','RESPONSE_TOO_LARGE'].includes(error.message)?'INVALID_FEED':'SOURCE_UNAVAILABLE'});}
  }
 }
 function refresh(){
  if(active)return active;
  if(now()<nextAttempt)return Promise.resolve();
  active=collect().catch(()=>{nextAttempt=now()+INTERVAL;}).finally(()=>{active=null;});
  return active;
 }
 function snapshot(locale='en') {
  if(!['en','ar'].includes(locale))throw Error('INVALID_LANGUAGE');
  const items=new Map();
  const sources=SOURCES.filter(s=>s.locale===locale).map(source=>{
   const c=cache.get(source.id);
   const usable=c?.items&&Number.isFinite(c.checkedAt)&&now()-c.checkedAt<MAX_STALE&&c.error!=='ROBOTS_DISALLOWED';
   const stale=Boolean(usable&&(c.error||now()-c.checkedAt>=INTERVAL));
   if(usable)for(const entry of c.items){if(now()-Date.parse(entry.publishedAt)<=365*24*INTERVAL)items.set(entry.url,{...entry,older:now()-Date.parse(entry.publishedAt)>30*24*INTERVAL,stale});}
   return {...source,status:usable?(stale?'stale':'ready'):'unavailable',lastSuccessAt:usable?new Date(c.checkedAt).toISOString():null,error:c?.error||null};
  });
  const sorted=[...items.values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).slice(0,40);
  return {items:sorted,sources,refreshing:Boolean(active),checkedAt:lastCheckedAt,nextCheckAt:nextAttempt?new Date(nextAttempt).toISOString():null,
   recentCount:sorted.filter(i=>!i.older).length,permissionUrl:PERMISSION_URL,publisherCount:1};
 }
 return {
  refresh,snapshot,
  get(locale){if(now()>=nextAttempt)void refresh();return snapshot(locale);},
  start(){void refresh();timer=setInterval(()=>void refresh(),INTERVAL);timer.unref();},
  stop(){if(timer)clearInterval(timer);timer=null;},
 };
}
export const alertsService=createAlertsService();
