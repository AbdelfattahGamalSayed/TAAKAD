import { alertsService } from './alerts.mjs';
import { createDemoAuth } from './auth.mjs';
import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analyze, extractText, AnalysisError, readConfig, validateInput } from './analysis.mjs';

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(body));
}
function authorized(given, expected) {
  if (!given || !expected) return false;
  const a = Buffer.from(given), b = Buffer.from(`Bearer ${expected}`);
  return a.length === b.length && timingSafeEqual(a, b);
}
async function readBody(req, maxBytes = 7_100_000) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new AnalysisError('INVALID_INPUT', 415);
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new AnalysisError('IMAGE_TOO_LARGE', 413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AnalysisError('INVALID_INPUT'); }
}

export function createServer({ token, analyzeImpl = analyze, extractImpl = extractText, getConfig = readConfig, alerts = alertsService, auth = createDemoAuth() } = {}) {
  let windowStart = Date.now(), requestCount = 0, inFlight = 0;
  return http.createServer(async (req, res) => {
    try {
      if (req.url === '/api/health' && req.method === 'GET') return json(res, 200, { ok: true, configured: Boolean(getConfig().key), service: 'T2AKKAD' });
      if (['/api/auth/start','/api/auth/verify','/api/auth/logout','/api/community/preview'].includes(req.url) && req.method === 'POST') {
        if (!authorized(req.headers.authorization, token)) return json(res,401,{error:'UNAUTHORIZED'});
        const body = await readBody(req, 12000), ip = req.socket.remoteAddress || 'unknown';
        const session = req.headers['x-session-token'];
        if (req.url === '/api/auth/start') return json(res,200,auth.start(body,ip));
        if (req.url === '/api/auth/verify') return json(res,200,auth.verify(body,ip));
        if (req.url === '/api/auth/logout') { auth.logout(session); return json(res,200,{ok:true}); }
        return json(res,200,auth.preview(session,body,ip));
      }
      if (req.url?.split('?')[0] === '/api/alerts' && req.method === 'GET') {
        if (!authorized(req.headers.authorization, token)) return json(res,401,{error:'UNAUTHORIZED'});
        const params=new URL(req.url,'http://localhost').searchParams;
        const locale=params.get('locale')||'en';
        if(!['en','ar'].includes(locale)||[...params.keys()].some(k=>k!=='locale'))return json(res,400,{error:'INVALID_INPUT'});
        return json(res,200,alerts.get(locale));
      }
      if (!['/api/analyze','/api/extract'].includes(req.url) || req.method !== 'POST') return json(res, 404, { error: 'NOT_FOUND' });
      if (!authorized(req.headers.authorization, token)) return json(res, 401, { error: 'UNAUTHORIZED' });
      if (Date.now() - windowStart > 60_000) { requestCount = 0; windowStart = Date.now(); }
      if (++requestCount > 12 || inFlight >= 2) return json(res, 429, { error: 'RATE_LIMIT' });
      inFlight++;
      try {
        const extracting = req.url === '/api/extract';
        const input = validateInput(await readBody(req), { purpose: extracting ? 'extract' : 'analysis' });
        const result = await (extracting ? extractImpl : analyzeImpl)(input);
        return json(res, 200, result);
      } finally { inFlight--; }
    } catch (error) {
      const known = error instanceof AnalysisError;
      if (!res.headersSent) json(res, known ? error.status : 500, { error: known ? error.code : 'SERVER_ERROR' });
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const session = JSON.parse(readFileSync(new URL('../.local/session.json', import.meta.url), 'utf8'));
  const server = createServer({ token: session.token });
  server.requestTimeout = 60_000;
  server.on('listening',()=>alertsService.start());
  server.on('close',()=>alertsService.stop());
  server.listen(8787, '127.0.0.1', () => console.log('T2AKKAD analysis backend listening on localhost:8787. Keys and submitted content are not logged.'));
}
