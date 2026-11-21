import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const {recoveryTopics,recoveryQuestions,recoveryCopy,helpSources}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(readFileSync(new URL('../src/lib/recovery.ts',import.meta.url),'utf8'))).toString('base64'));
test('all 243 answer combinations produce only relevant, deduplicated recovery in urgency order',()=>{
  for(let n=0;n<243;n++){
    let value=n;const answers={};for(const key of recoveryQuestions){answers[key]=['yes','no','unsure'][value%3];value=Math.floor(value/3);}
    const possible=key=>answers[key]!=='no';
    const expected=[...(possible('payment')||possible('card')?['payment']:[]),...['otp','password','opened'].filter(possible),'protect'];
    assert.deepEqual(recoveryTopics(answers),expected);
  }
  assert.deepEqual(recoveryTopics({}),['protect']);
});
test('bilingual recovery keys and guide lengths agree; help links use fixed official hosts',()=>{
  const keys=obj=>Object.keys(obj).sort();assert.deepEqual(keys(recoveryCopy.en),keys(recoveryCopy.ar));
  for(const locale of ['en','ar']){assert.deepEqual(keys(recoveryCopy[locale].questions),[...recoveryQuestions].sort());for(const guide of ['apple','google','whatsapp'])assert.equal(recoveryCopy[locale].guidesText[guide].length,3);}
  for(const url of Object.values(helpSources)){const parsed=new URL(url);assert.equal(parsed.protocol,'https:');assert.ok(['srv.adpolice.gov.ae','support.apple.com','support.google.com','faq.whatsapp.com'].includes(parsed.hostname));}
});
