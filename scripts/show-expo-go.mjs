import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import QRCode from 'qrcode';
import {browserDemoOrigin} from './show-browser-demo.mjs';

export async function showExpoGo({open=true,origin=browserDemoOrigin(),directory=new URL('../.local/',import.meta.url),log=console.log}={}){
 const response=await fetch(origin,{headers:{Accept:'application/expo+json','Expo-Platform':'ios'},signal:AbortSignal.timeout(15000)});
 let manifest;try{manifest=await response.json();}catch{/* A web page is not an Expo Go manifest. */}
 if(!response.ok||!manifest?.extra?.expoClient?.sdkVersion)throw Error('The running server did not provide an Expo Go project. Stop it in its original terminal, then run npm start again.');
 const url=new URL(origin);
 const target=(url.protocol==='https:'?'exps:':'exp:')+'//'+url.host;
 const png=new URL('expo-go.png',directory),html=new URL('expo-go.html',directory);
 mkdirSync(directory,{recursive:true});
 await QRCode.toFile(fileURLToPath(png),target,{width:600,margin:3});
 writeFileSync(new URL('expo-go-url.txt',directory),target);
 writeFileSync(html,'<!doctype html><meta name="viewport" content="width=device-width"><title>TAAKAD Expo Go</title><body style="font:22px Arial;text-align:center;padding:30px;color:#0f1b3d;background:#f5f8ff"><h1>TAAKAD</h1><p>Scan with your iPhone Camera and open Expo Go.</p><img alt="TAAKAD development QR for Expo Go" width="360" src="expo-go.png"><p>Sign into the same Expo account in Expo Go and the computer CLI.</p><p>Keep the original server terminal open. Use the same Wi-Fi.</p>');
 log('\nEXPO GO DEVELOPMENT QR: scan with Camera and open Expo Go.');
 log(await QRCode.toString(target,{type:'terminal',small:true}));
 log('Expo Go URL: '+target+'\nQR page: '+fileURLToPath(html));
 log('iPhone: sign into the same Expo account in Expo Go and Expo CLI (npx expo login). Keep the original server terminal open.');
 if(open&&!process.env.CI){
  const [command,args]=process.platform==='win32'?['explorer.exe',[fileURLToPath(html)]]:process.platform==='darwin'?['open',[fileURLToPath(html)]]:['xdg-open',[fileURLToPath(html)]];
  const browser=spawn(command,args,{stdio:'ignore',detached:true});browser.on('error',()=>log('Open the QR page above manually.'));browser.unref();
 }
 return target;
}
