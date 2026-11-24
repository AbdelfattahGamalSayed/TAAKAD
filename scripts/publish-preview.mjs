import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import QRCode from 'qrcode';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const stateFile=new URL('../.local/preview-settings.json',import.meta.url);
if(!existsSync(stateFile)){console.error('Preview publishing is optional. Configure your own Expo project and API origin in .local/preview-settings.json; see docs/DEMO.md.');process.exit(1);}
const settings=JSON.parse(readFileSync(stateFile,'utf8'));
const health=await fetch(settings.apiUrl+'/api/health',{signal:AbortSignal.timeout(6000)}).then(r=>r.json()).catch(()=>null);
if(!health?.ok){console.error('Start npm start first, then publish. The preview needs this backend during the demo.');process.exit(1);}
console.log('Publishing an account-restricted Expo Go preview. Recipients must sign in as members of the owning account; this cannot provide a signed-out committee demo.');
const npx=process.platform==='win32'?'npx.cmd':'npx';
const args=['--yes','eas-cli@latest','update','--branch','committee','--environment','preview','--platform','all','--message','TAAKAD-committee-preview','--non-interactive','--input-dir','.local/committee-update','--clear-cache'];
const result=spawnSync(npx,args,{cwd:root,env:{...process.env,TAAKAD_PUBLISH_PREVIEW:'1'},stdio:'inherit',shell:process.platform==='win32'});
if(result.status!==0)process.exit(result.status??1);
const query=new URLSearchParams({projectId:settings.projectId,runtimeVersion:'exposdk:58.0.0',channel:'committee',format:'url'});
const response=await fetch('https://qr.expo.dev/eas-update?'+query,{signal:AbortSignal.timeout(15000)});
if(!response.ok)throw Error('Published, but QR generation failed. Open the update in the Expo dashboard.');
const url=(await response.text()).trim();
await QRCode.toFile(fileURLToPath(new URL('../.local/committee-preview.png',import.meta.url)),url,{width:600,margin:3});
writeFileSync(new URL('../.local/committee-preview-url.txt',import.meta.url),url);
console.log('Published-preview QR saved to .local/committee-preview.png. Expo Go URL: '+url);
