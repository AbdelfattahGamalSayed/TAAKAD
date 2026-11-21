import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
mkdirSync(new URL('../.local/', import.meta.url), { recursive: true });
const session = new URL('../.local/session.json', import.meta.url);
if (!existsSync(session)) writeFileSync(session, JSON.stringify({ token: randomBytes(24).toString('hex') }));
const api = spawn(process.execPath, ['server/index.mjs'], { cwd: root, stdio: 'inherit' });
const expo = spawn(process.execPath, ['node_modules/expo/bin/cli', 'start', '--port', '8081', ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });
let stopping = false;
function stop(code = 0) { if (stopping) return; stopping = true; api.kill(); expo.kill(); process.exit(code); }
api.on('exit', code => stop(code || 0)); expo.on('exit', code => stop(code || 0));
process.on('SIGINT', () => stop()); process.on('SIGTERM', () => stop());
