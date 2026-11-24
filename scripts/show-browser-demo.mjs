import {networkInterfaces} from 'node:os';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import QRCode from 'qrcode';

export function browserDemoOrigin(interfaces=networkInterfaces(),preferred=process.env.TAAKAD_DEMO_HOST){
 const addresses=Object.entries(interfaces).flatMap(([name,list])=>(list||[]).filter(a=>a.family==='IPv4'&&!a.internal&&!a.address.startsWith('169.254.')).map(a=>({name,address:a.address})));
 if(preferred){if(!addresses.some(a=>a.address===preferred))throw Error('TAAKAD_DEMO_HOST must be an IPv4 address assigned to this computer.');return 'http://'+preferred+':8081';}
 addresses.sort((a,b)=>Number(/virtual|vEthernet|docker|vpn|wsl/i.test(a.name))-Number(/virtual|vEthernet|docker|vpn|wsl/i.test(b.name)));
 if(!addresses.length)throw Error('No LAN address found. Connect this computer to trusted Wi-Fi and try again.');
 return 'http://'+addresses[0].address+':8081';
}

export async function showBrowserDemo({open=true}={}){
 const url=browserDemoOrigin();
 const r=await fetch(url+'/api/health',{signal:AbortSignal.timeout(4000)});
 if(!r.ok||(await r.json()).service!=='TAAKAD')throw Error('The app backend is not reachable at this computer\'s LAN address. Check the server and trusted network.');
 const app=await fetch(url,{signal:AbortSignal.timeout(20000)});
 if(!app.ok||!app.headers.get('content-type')?.includes('text/html'))throw Error('The browser app did not load. Check the server terminal.');
 await app.body?.cancel();
 const html=new URL('../.local/browser-demo.html',import.meta.url);
 await QRCode.toFile(fileURLToPath(new URL('../.local/browser-demo.png',import.meta.url)),url,{width:600,margin:3});
 writeFileSync(new URL('../.local/browser-demo-url.txt',import.meta.url),url);
 writeFileSync(html,'<!doctype html><meta name="viewport" content="width=device-width"><title>TAAKAD browser demo</title><body style="font:22px Arial;text-align:center;padding:30px;color:#0f1b3d;background:#f5f8ff"><h1>TAAKAD</h1><p>Scan to open in Safari or Chrome</p><p>No Expo account or installation needed.</p><img alt="Scan to open TAAKAD in your browser" width="360" src="browser-demo.png"><p><a href="'+url+'">Open TAAKAD in this browser</a></p><p>Keep this computer running. Phones must use the same trusted Wi-Fi.</p>');
 console.log('\nBROWSER DEMO: scan with Camera to open Safari or Chrome. No Expo login or installation.');
 console.log(await QRCode.toString(url,{type:'terminal',small:true}));
 console.log('App URL: '+url+'\nQR page: '+fileURLToPath(html));
 console.log('Keep the original server terminal open and use the same trusted Wi-Fi.');
 if(open&&!process.env.CI){
  const [command,args]=process.platform==='win32'?['explorer.exe',[fileURLToPath(html)]]:process.platform==='darwin'?['open',[fileURLToPath(html)]]:['xdg-open',[fileURLToPath(html)]];
  const browser=spawn(command,args,{stdio:'ignore',detached:true});browser.on('error',()=>console.log('Open the QR page above manually.'));browser.unref();
 }
}
