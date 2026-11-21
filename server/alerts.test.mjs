import test from 'node:test';
import assert from 'node:assert/strict';
import {SOURCES,ROBOTS_URL,INTERVAL,MAX_STALE,createAlertsService,parseFeed,relevant,officialLink,plainText} from './alerts.mjs';
import {createServer} from './index.mjs';
const NOW=Date.parse('2026-11-19T12:00:00Z');
const source=SOURCES[0];
const xml=(items)=>'<rss version="2.0"><channel>'+items+'</channel></rss>';
const item=({title='Police warn against phishing scams',url='https://www.mediaoffice.abudhabi/en/security/scam-warning/',date='Wed, 18 Nov 2026 00:00:00 +0400',description='Never share your OTP.'}={})=>'<item><title>'+title+'</title><link>'+url+'</link><pubDate>'+date+'</pubDate><description>'+description+'</description></item>';
const feed=()=>new Response(xml(item()),{headers:{'content-type':'application/rss+xml',etag:'test-etag'}});
function service(fetchImpl,now=()=>NOW){return createAlertsService({fetchImpl,now,sleep:async()=>{}});}
test('RSS allows only official UAE links and rejects redirects encoded in URLs',()=>{
 assert.ok(officialLink('https://www.mediaoffice.abudhabi/en/security/test/?x=1#part','en'));
 for(const url of ['https://evil.example/en/test','http://www.mediaoffice.abudhabi/en/test','https://www.mediaoffice.abudhabi.evil.example/en/test','https://user@www.mediaoffice.abudhabi/en/test','https://www.mediaoffice.abudhabi/en/%2f%2fevil.example','javascript:alert(1)','https://www.mediaoffice.abudhabi/ar/test'])assert.equal(officialLink(url,'en'),null);
});
test('RSS filters relevance and keeps source publication time',()=>{
 const r=parseFeed(xml(item()+item({title:'Sports festival',description:'A football event.',url:'https://www.mediaoffice.abudhabi/en/sport/event/'})),source,NOW);
 assert.equal(r.length,1);assert.equal(r[0].publishedAt,'2026-11-17T20:00:00.000Z');assert.equal(r[0].older,false);
});
test('Arabic and English cyber topics are recognized without broad AI keyword matching',()=>{
 for(const t of ['phishing alert','Cyber Security Council','online safety','احتيال إلكتروني','الأمن السيبراني'])assert.equal(relevant(t),true);
 for(const t of ['AI sedan launch','road safety','military parade','مهرجان رياضي'])assert.equal(relevant(t),false);
});
test('HTML and entities become text; script contents do not survive',()=>{
 assert.equal(plainText('&lt;b&gt;OTP&lt;/b&gt; &amp; <script>secret()</script> safety'),'OTP & safety');
 assert.equal(parseFeed(xml(item({title:'Scam&#039;s warning'})),source,NOW)[0].title,"Scam's warning");
});
test('invalid, future and more-than-year-old dates are omitted',()=>{
 for(const date of ['invalid','Thu, 19 Nov 2027 00:00:00 GMT','Tue, 1 Jan 2024 00:00:00 GMT'])assert.equal(parseFeed(xml(item({date})),source,NOW).length,0);
 assert.equal(parseFeed(xml(item({date:'Wed, 1 Jul 2026 00:00:00 GMT'})),source,NOW)[0].older,true);
});
test('malformed XML, DTDs, entities, HTML pages and oversize content fail closed',()=>{
 for(const data of ['<rss>','<!DOCTYPE rss><rss/>','<!ENTITY a "x"><rss/>','<html>Denied</html>','x'.repeat(2097153)])assert.throws(()=>parseFeed(data,source,NOW));
 assert.deepEqual(parseFeed(xml(''),source,NOW),[]);
});
test('collector uses only allowlisted URLs, checks robots, deduplicates and caches',async()=>{
 const seen=[];const s=service(async(url,opt)=>{seen.push(url);assert.equal(opt.redirect,'error');return url===ROBOTS_URL?new Response('User-agent: *\nDisallow: /admin/'):feed();});
 await Promise.all([s.refresh(),s.refresh()]);assert.equal(seen.length,7);
 assert.deepEqual(seen,[ROBOTS_URL,...SOURCES.map(s=>s.url)]);
 const r=s.snapshot('en');assert.equal(r.items.length,1);assert.equal(r.sources.length,3);assert.equal(r.sources[0].status,'ready');
 await s.refresh();s.get('ar');assert.equal(seen.length,7);
});
test('robots denial prevents all feed requests and removes cached content',async()=>{
 let time=NOW,deny=false,calls=0;
 const s=service(async url=>{calls++;return url===ROBOTS_URL?new Response('User-agent: *\nDisallow: '+(deny?'/':'/admin/')):feed();},()=>time);
 await s.refresh();assert.equal(s.snapshot('en').items.length,1);deny=true;time+=INTERVAL;await s.refresh();
 assert.equal(calls,8);assert.equal(s.snapshot('en').items.length,0);assert.equal(s.snapshot('en').sources[0].error,'ROBOTS_DISALLOWED');
});
test('robots failure or HTML challenge never triggers feed fetching',async()=>{
 for(const response of [()=>new Response('denied',{status:403}),()=>new Response('<html>Challenge</html>')]){
 let count=0;const s=service(async()=>{count++;return response();});await s.refresh();assert.equal(count,1);assert.equal(s.snapshot().sources[0].status,'unavailable');}
});
test('feed failure retains a stale cache only for the bounded period',async()=>{
 let time=NOW,fail=false;const s=service(async url=>url===ROBOTS_URL?new Response('User-agent: *\nAllow: /'):fail?new Response('',{status:503}):feed(),()=>time);
 await s.refresh();fail=true;time+=INTERVAL;await s.refresh();assert.equal(s.snapshot().items[0].stale,true);
 time+=MAX_STALE;await s.refresh();assert.equal(s.snapshot().items.length,0);assert.equal(s.snapshot().sources[0].status,'unavailable');
});
test('conditional revalidation sends ETag and preserves publication dates',async()=>{
 let time=NOW,second=false;
 const s=service(async(url,opt)=>{if(url===ROBOTS_URL)return new Response('User-agent: *\nAllow: /');if(second){assert.equal(opt.headers['If-None-Match'],'test-etag');return new Response(null,{status:304});}return feed();},()=>time);
 await s.refresh();const date=s.snapshot().items[0].publishedAt;second=true;time+=INTERVAL;await s.refresh();assert.equal(s.snapshot().items[0].publishedAt,date);assert.equal(s.snapshot().sources[0].status,'ready');
});
test('Retry-After pauses source requests beyond the normal hourly interval',async()=>{
 let time=NOW,calls=0;const s=service(async()=>{calls++;return new Response('',{status:429,headers:{'retry-after':'7200'}});},()=>time);
 await s.refresh();time+=INTERVAL;await s.refresh();assert.equal(calls,1);
});
test('failed or oversized feed does not become an empty successful feed',async()=>{
 for(const response of [()=>new Response('<html>Challenge</html>',{headers:{'content-type':'text/html'}}),()=>new Response('x',{headers:{'content-type':'application/xml','content-length':'9000000'}})]){
 const s=service(async url=>url===ROBOTS_URL?new Response('User-agent: *\nAllow: /'):response());await s.refresh();assert.equal(s.snapshot().sources[0].status,'unavailable');}
});
test('alerts API enforces pairing, locale and no arbitrary source parameters',async()=>{
 let calls=0;const server=createServer({token:'t',alerts:{get(locale){calls++;return {locale,items:[]};}}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const get=(query,token='t')=>fetch('http://127.0.0.1:'+server.address().port+'/api/alerts'+query,{headers:{Authorization:'Bearer '+token}});
 try{assert.equal((await get('?locale=en','bad')).status,401);assert.equal((await get('?locale=xx')).status,400);assert.equal((await get('?url=https://evil.example')).status,400);assert.equal(calls,0);const r=await get('?locale=ar');assert.equal(r.status,200);assert.deepEqual(await r.json(),{locale:'ar',items:[]});}
 finally{await new Promise(resolve=>server.close(resolve));}
});

test('feed rate limit stops the remaining requests on that host',async()=>{
 let count=0;const s=service(async url=>{count++;return url===ROBOTS_URL?new Response('User-agent: *\nAllow: /'):new Response('',{status:429,headers:{'retry-after':'60'}});});
 await s.refresh();assert.equal(count,2);assert.equal(s.snapshot().sources[0].status,'unavailable');
});
