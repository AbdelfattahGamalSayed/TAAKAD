import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {setupConfig} from '../scripts/setup.mjs';
test('reviewer setup creates blank configuration and never replaces an existing key',t=>{
 const base=path.resolve(tmpdir()),root=mkdtempSync(path.join(base,'t2akkad-setup-'));
 t.after(()=>{assert.ok(path.resolve(root).startsWith(path.join(base,'t2akkad-setup-')));rmSync(root,{recursive:true,force:true});});
 mkdirSync(path.join(root,'server'));const target=path.join(root,'server','.env');
 writeFileSync(path.join(root,'server','.env.example'),'OPENAI_API_KEY=\nOPENAI_MODEL=gpt-4.1-mini\n');
 assert.equal(setupConfig(root),'created');assert.match(readFileSync(target,'utf8'),/^OPENAI_API_KEY=\n/);
 writeFileSync(target,'OPENAI_API_KEY=synthetic-test-value\n');assert.equal(setupConfig(root),'preserved');assert.equal(readFileSync(target,'utf8'),'OPENAI_API_KEY=synthetic-test-value\n');
});
