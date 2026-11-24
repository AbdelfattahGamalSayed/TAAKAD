import { alertsService } from './alerts.mjs';
import { createDemoAuth } from './auth.mjs';
import { createReports } from './reports.mjs';
import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
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

export function createServer({ token, analyzeImpl = analyze, extractImpl = extractText, getConfig = readConfig, alerts = alertsService, auth = createDemoAuth(), reports = createReports(), moderatorToken, supportToken } = {}) {
  let windowStart = Date.now(), requestCount = 0, inFlight = 0;
  return http.createServer(async (req, res) => {
    try {
      if (req.url === '/api/health' && req.method === 'GET') return json(res, 200, { ok: true, configured: Boolean(getConfig().key), service: 'TAAKAD' });
      if(['/api/reports/list','/api/reports/mine','/api/reports/prepare','/api/reports/publish','/api/reports/withdraw','/api/reports/flag','/api/reports/moderation','/api/reports/handoff','/api/reports/support'].includes(req.url)&&req.method==='POST'){
        if(!authorized(req.headers.authorization,token))return json(res,401,{error:'UNAUTHORIZED'});
        const body=await readBody(req,12000),ip=req.socket.remoteAddress||'unknown';
        if(req.url==='/api/reports/support'){
          if(!authorized(req.headers['x-support-token'],supportToken))return json(res,403,{error:'FORBIDDEN'});
          return json(res,200,reports.support(body));
        }
        if(req.url==='/api/reports/moderation'){
          if(!authorized(req.headers['x-moderator-token'],moderatorToken))return json(res,403,{error:'FORBIDDEN'});
          return json(res,200,body.action==='list'?reports.queue():reports.review(body));
        }
        if(req.url==='/api/reports/list')return json(res,200,reports.list());
        if(req.url==='/api/reports/flag')return json(res,200,reports.flag(body,ip));
        const session=auth.requireSession(req.headers['x-session-token']);
        if(req.url==='/api/reports/handoff')return json(res,200,reports.handoff(session,body));
        if(req.url==='/api/reports/mine')return json(res,200,reports.mine(session));
        if(req.url==='/api/reports/prepare')return json(res,200,await reports.prepare(session,body,ip));
        if(req.url==='/api/reports/publish')return json(res,200,reports.publish(session,body));
        return json(res,200,reports.withdraw(session,body));
      }
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
  const moderatorFile=new URL('../.local/report-moderator.json',import.meta.url);
  if(!existsSync(moderatorFile))writeFileSync(moderatorFile,JSON.stringify({token:randomBytes(32).toString('hex')}));
  const supportFile=new URL('../.local/report-support.json',import.meta.url);
  if(!existsSync(supportFile))writeFileSync(supportFile,JSON.stringify({token:randomBytes(32).toString('hex')}));
  const server = createServer({ token: session.token, moderatorToken: JSON.parse(readFileSync(moderatorFile,'utf8')).token, supportToken: JSON.parse(readFileSync(supportFile,'utf8')).token });
  server.requestTimeout = 60_000;
  server.on('listening',()=>alertsService.start());
  server.on('close',()=>alertsService.stop());
  server.on('error',error=>{
    console.error(error.code==='EADDRINUSE'?'TAAKAD backend port 8787 is already in use. Use the running app or stop its original terminal before restarting.':'TAAKAD backend could not start. Check the port and local configuration.');
    process.exitCode=1;
  });
  server.listen(8787, '127.0.0.1', () => console.log('TAAKAD analysis backend listening on localhost:8787. Keys and submitted content are not logged.'));
}
