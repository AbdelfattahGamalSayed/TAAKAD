// Original silent storyboard clips, rendered locally; no downloaded footage or audio.
// Requires Chrome, the project Playwright dependency and ffmpeg on PATH.
import {chromium} from '@playwright/test';
import {readFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const lessons=JSON.parse(readFileSync(path.join(root,'src/lib/learning.json'),'utf8'));
const frames=path.join(root,'.local/learning-frames'),out=path.join(root,'assets/learning');mkdirSync(frames,{recursive:true});mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:720,height:720},deviceScaleFactor:1});
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const drawings=[
 '<rect x="48" y="12" width="104" height="156" rx="20"/><path d="M80 32h40M78 64h44M78 84h44M78 104h24"/><circle cx="148" cy="136" r="36" fill="#fff"/><path d="M148 114v27m0 10v2"/>',
 '<path d="M100 15l63 24v47c0 48-63 81-63 81S37 134 37 86V39z"/><path d="M71 88l20 20 40-45"/>',
 '<rect x="48" y="12" width="104" height="156" rx="20"/><path d="M80 32h40M76 91l18 18 32-38M86 148h28"/>'
];
try{for(const lesson of lessons.filter(x=>x.video))for(const locale of ['en','ar']){
 for(let i=0;i<3;i++){
 const [title,body]=lesson[locale].steps[i];
 await page.setContent(`<html lang="${locale}" dir="${locale==='ar'?'rtl':'ltr'}"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#f4f7ff;color:#102c50;font-family:Arial,sans-serif;text-align:center;padding:32px}header{font-size:24px;font-weight:bold;color:#215bce}svg{display:block;margin:25px auto 18px;width:160px;height:160px;stroke:#245eea;stroke-width:9;stroke-linecap:round;stroke-linejoin:round;fill:none}h1{font-size:44px;margin:20px 0;line-height:1.4}p{font-size:38px;line-height:1.45;margin:0}footer{position:absolute;bottom:32px;left:0;right:0;color:#365987;font-size:24px}</style><header>T2AKKAD · ${escape(lesson[locale].title)}</header><svg viewBox="0 0 200 185">${drawings[i]}</svg><h1>${escape(title)}</h1><p>${escape(body)}</p><footer>${i+1} / 3</footer></html>`);
 await page.screenshot({path:path.join(frames,`${lesson.id}-${locale}-${i}.png`)});
 }
 const args=['-y','-hide_banner','-loglevel','error','-framerate','1/8','-i',path.join(frames,`${lesson.id}-${locale}-%d.png`),'-t','24','-r','24','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart','-an',path.join(out,`${lesson.id}-${locale}.mp4`)];
 const result=spawnSync('ffmpeg',args,{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr||'ffmpeg failed');
 console.log(`Created ${lesson.id}-${locale}.mp4 (24 seconds, silent)`);
}}finally{await browser.close();}
