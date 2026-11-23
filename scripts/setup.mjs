import {copyFileSync,constants,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export function setupConfig(root){
 const target=path.join(root,'server','.env');
 if(existsSync(target))return 'preserved';
 try{copyFileSync(path.join(root,'server','.env.example'),target,constants.COPYFILE_EXCL);return 'created';}
 catch(error){if(error.code==='EEXIST')return 'preserved';throw error;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [major,minor]=process.versions.node.split('.').map(Number);
 if(major<22||(major===22&&minor<18)){console.error('Use Node.js 22.18 or newer, then run npm run setup again.');process.exitCode=1;}
 else{
  const result=setupConfig(fileURLToPath(new URL('../',import.meta.url)));
  console.log(result==='created'?'Created private server/.env from the blank example.':'Kept existing server/.env unchanged.');
  console.log('For real AI checks, privately set OPENAI_API_KEY in server/.env. No key is needed to browse the app or run automated tests.');
  console.log('Phone: npm start. Account-free browser review: npm run review.');
  console.log('Physical iPhone: Expo CLI and Expo Go must use the reviewer\'s own matching Expo account; the author\'s account is not required.');
 }
}
