import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import QRCode from 'qrcode';
export async function showPreview({open=true}={}){
  let url,settings;
  try{
    url=readFileSync(new URL('../.local/committee-preview-url.txt',import.meta.url),'utf8').trim();
    settings=JSON.parse(readFileSync(new URL('../.local/preview-settings.json',import.meta.url),'utf8'));
  }catch{throw Error('No published preview is configured here. See docs/DEMO.md or use npm start for development.');}
  const target=new URL(url);
  if(target.protocol!=='exp:'||target.hostname!=='u.expo.dev')throw Error('Unexpected published-preview URL. Republish using npm run publish:preview.');
  const response=await fetch(settings.apiUrl+'/api/health',{signal:AbortSignal.timeout(4000)}).then(r=>r.json()).catch(()=>null);
  if(response?.service!=='TAAKAD')throw Error('The published preview cannot reach its saved API address. Check Wi-Fi and republish after a network/IP change.');
  await QRCode.toFile(fileURLToPath(new URL('../.local/committee-preview.png',import.meta.url)),url,{width:600,margin:3});
  const html=new URL('../.local/committee-preview.html',import.meta.url);
  writeFileSync(html,'<!doctype html><meta name="viewport" content="width=device-width"><title>TAAKAD restricted Expo Go preview</title><body style="font:22px Arial;text-align:center;padding:30px;color:#0f1b3d;background:#f5f8ff"><h1>TAAKAD</h1><p>Account-restricted Expo Go preview</p><p>Expo Go requires signing into the owning account or an account belonging to its organisation. This QR does not work while signed out.</p><img alt="Account-member preview only" width="360" src="committee-preview.png"><p>Keep this computer running. Phones must use the same trusted Wi-Fi.</p>');
  console.log('\nACCOUNT-MEMBER PREVIEW: this published Expo Go QR requires access to the owning account.');
  console.log(await QRCode.toString(url,{type:'terminal',small:true}));
  console.log('QR page: '+fileURLToPath(html));
  console.log('Keep the original server terminal open. Signed-out access is blocked by Expo Go policy.');
  if(open&&!process.env.CI){
    const [command,args]=process.platform==='win32'?['explorer.exe',[fileURLToPath(html)]]:process.platform==='darwin'?['open',[fileURLToPath(html)]]:['xdg-open',[fileURLToPath(html)]];
    const browser=spawn(command,args,{stdio:'ignore',detached:true});browser.on('error',()=>console.log('Open the QR page above in your browser.'));browser.unref();
  }
}
