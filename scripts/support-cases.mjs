import {readFileSync} from 'node:fs';
const [action='list',id]=process.argv.slice(2);
if(!['list','open','close'].includes(action)||(action!=='list'&&!/^[a-f0-9]{32}$/.test(id||'')))throw Error('Use: node scripts/support-cases.mjs list | open ID | close ID');
const pairing=JSON.parse(readFileSync(new URL('../.local/session.json',import.meta.url),'utf8')).token;
const support=JSON.parse(readFileSync(new URL('../.local/report-support.json',import.meta.url),'utf8')).token;
const response=await fetch('http://127.0.0.1:8787/api/reports/support',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+pairing,'X-Support-Token':'Bearer '+support},body:JSON.stringify({action,id})});
if(!response.ok)throw Error('Demo support request failed: '+response.status);
console.log('DEMONSTRATION ONLY — no authority contacted.');
console.log(JSON.stringify(await response.json(),null,2));
