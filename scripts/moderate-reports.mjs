import {readFileSync} from 'node:fs';
const [action='list',id]=process.argv.slice(2);
if(!['list','approve','reject'].includes(action)||(action!=='list'&&!/^[a-f0-9]{32}$/.test(id||'')))throw Error('Use: node scripts/moderate-reports.mjs list | approve ID | reject ID');
const pairing=JSON.parse(readFileSync(new URL('../.local/session.json',import.meta.url),'utf8')).token;
const moderator=JSON.parse(readFileSync(new URL('../.local/report-moderator.json',import.meta.url),'utf8')).token;
const response=await fetch('http://127.0.0.1:8787/api/reports/moderation',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+pairing,'X-Moderator-Token':'Bearer '+moderator},body:JSON.stringify({action,id})});
if(!response.ok)throw Error('Moderation request failed: '+response.status);
console.log(JSON.stringify(await response.json(),null,2));
