// Capture current UI using synthetic content only. Requires the running app,
// a configured private AI key for the two real result screens, and Chrome.
import {chromium,expect} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const root=new URL('../',import.meta.url),out=new URL('../submission/assets/ui/',import.meta.url);
mkdirSync(out,{recursive:true});
async function lib(name){return import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(readFileSync(new URL('src/lib/'+name+'.ts',root),'utf8'))).toString('base64'));}
const [{copy},{flowCopy},{cropCopy},{recoveryCopy},{learnCopy},{reportCopy},{featureCopy}]=await Promise.all(['copy','checkFlow','cropCopy','recovery','learnCopy','reports','features'].map(lib));
const url=process.env.TAAKAD_CAPTURE_URL||'http://127.0.0.1:8081';
const browser=await chromium.launch({channel:'chrome'}),records=[];
try{for(const locale of ['en','ar']){
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
 await context.addInitScript(locale=>{localStorage.setItem('t2akkad-welcome','1');localStorage.setItem('t2akkad-language',locale);localStorage.setItem('t2akkad-theme','light');},locale);
 const p=await context.newPage();p.setDefaultTimeout(20000);await p.emulateMedia({reducedMotion:'reduce'});
 const save=async name=>{await p.screenshot({path:new URL(name+'-'+locale+'.png',out).pathname.replace(/^\/([A-Za-z]:)/,'$1')});records.push({screen:name,locale,content:'synthetic demonstration',width:390,height:844});};
 await p.goto(url);await expect(p.getByRole('button',{name:copy[locale].upload,exact:true})).toBeVisible();await save('home');
 const uri=await p.evaluate(locale=>{const c=document.createElement('canvas');c.width=720;c.height=660;const x=c.getContext('2d');x.fillStyle='#FFFFFF';x.fillRect(0,0,720,660);x.fillStyle='#0F1B3D';x.font='bold 30px Arial';x.direction=locale==='ar'?'rtl':'ltr';const xx=locale==='ar'?680:40;
  const lines=locale==='ar'?['مثال توضيحي فقط','سيتم إيقاف حسابك البنكي.','أرسل كلمة المرور ورمز التحقق الآن.','https://example.com/verify']:['SYNTHETIC DEMONSTRATION','Your bank account will be blocked.','Send your password and code now.','https://example.com/verify'];lines.forEach((s,i)=>x.fillText(s,xx,95+i*105));return c.toDataURL('image/png');},locale);
 const chooser=p.waitForEvent('filechooser');await p.getByRole('button',{name:copy[locale].upload,exact:true}).click();await(await chooser).setFiles({name:'synthetic-message.png',mimeType:'image/png',buffer:Buffer.from(uri.split(',')[1],'base64')});
 await p.getByRole('button',{name:cropCopy[locale].crop,exact:true}).click();await p.getByRole('button',{name:cropCopy[locale].scan,exact:true}).scrollIntoViewIfNeeded();await save('crop');
 await p.goto(url);await p.getByRole('button',{name:flowCopy[locale].pasteMessage,exact:true}).click();
 const text=locale==='en'?'DEMO: Your bank account will be blocked. Send your password and verification code now to keep it active. https://example.com/verify':'مثال توضيحي: سيتم إيقاف حسابك البنكي. أرسل كلمة المرور ورمز التحقق الآن لإبقائه نشطاً. https://example.com/verify';
 await p.getByRole('textbox',{name:copy[locale].message,exact:true}).fill(text);await save('message');await p.getByRole('button',{name:flowCopy[locale].next,exact:true}).click();
 await expect(p.getByRole('radio')).not.toHaveCount(0);await save('context');
 for(let i=0;i<2&&await p.getByRole('button',{name:flowCopy[locale].skip,exact:true}).isVisible();i++)await p.getByRole('button',{name:flowCopy[locale].skip,exact:true}).click();
 await p.getByRole('checkbox').check();const response=p.waitForResponse(r=>r.url().endsWith('/api/analyze'),{timeout:65000});await p.getByRole('button',{name:copy[locale].analyze,exact:true}).click();
 const r=await response;expect(r.ok()).toBe(true);const result=await r.json();await expect(p.getByText(copy[locale].actions,{exact:true})).toBeVisible({timeout:65000});await p.evaluate(()=>window.scrollTo(0,0));await save('result');
 records.push({locale,liveResult:result.status,warningLevel:result.riskLevel,source:'real model response to synthetic text',analyzedAt:result.analyzedAt});
 await p.getByRole('button',{name:copy[locale].moreDetails,exact:true}).click();await p.getByText(featureCopy[locale].evidence,{exact:true}).scrollIntoViewIfNeeded();await save('details');
 await p.goto(url+'/recovery');const rc=recoveryCopy[locale];await p.getByRole('button',{name:rc.start,exact:true}).click();
 for(const value of ['no','no','no','yes','no']){await p.getByRole('radio',{name:rc[value],exact:true}).click();await p.getByRole('button',{name:rc.next,exact:true}).click();}
 await expect(p.getByText(rc.titles.password,{exact:true})).toBeVisible();await save('recovery');
 await p.goto(url+'/learn');await p.getByRole('button',{name:learnCopy[locale].watch+' — '+(locale==='en'?'Keep your codes private':'احتفظ برموزك لنفسك'),exact:true}).click();
 await expect(p.locator('video')).toHaveCount(1);await expect.poll(()=>p.locator('video').evaluate(v=>v.readyState)).toBeGreaterThan(1);await p.locator('video').evaluate(v=>{v.currentTime=10;});await expect.poll(()=>p.locator('video').evaluate(v=>!v.seeking&&v.readyState>=3)).toBe(true);await p.getByRole('button',{name:learnCopy[locale].play,exact:true}).click();await expect.poll(()=>p.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(10.2);await p.getByRole('button',{name:learnCopy[locale].pause,exact:true}).click();await save('learn');
 await p.goto(url+'/community');await p.getByRole('button',{name:reportCopy[locale].start,exact:true}).click();await save('community');
 await context.close();console.log(locale+': captured current bilingual UI and a live synthetic result.');
}}finally{await browser.close();}
writeFileSync(new URL('capture-manifest.json',out),JSON.stringify({capturedOn:'2026-11-24',sourceCommit:'bb0a74d',note:'Current application UI. Synthetic inputs only. Result screens use real model responses; this is not an accuracy benchmark.',records},null,2));
