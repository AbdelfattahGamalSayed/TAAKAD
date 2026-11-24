import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('bundled replacement videos exactly match the team-supplied files',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets/learning/media.json',import.meta.url),'utf8'));
 for(const item of manifest.files){const data=readFileSync(new URL('../assets/learning/'+item.file,import.meta.url));assert.equal(createHash('sha256').update(data).digest('hex'),item.sha256);assert.equal(data.subarray(4,8).toString(),'ftyp');}
});
