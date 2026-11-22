import { randomBytes, randomInt, createHmac, timingSafeEqual } from 'node:crypto';
import { AnalysisError } from './model.mjs';

// Demo only. Never use a returned demo code to establish real phone ownership.
export function createDemoAuth({ now = Date.now } = {}) {
  const secret = randomBytes(32), challenges = new Map(), latest = new Map(), sessions = new Map(), limits = new Map();
  const digest = value => createHmac('sha256', secret).update(value).digest('hex');
  const fail = (code, status = 400) => { throw new AnalysisError(code, status); };
  function prune() {
    for (const [key, value] of challenges) if (value.expiresAt <= now()) challenges.delete(key);
    for (const [key, value] of sessions) if (value.expiresAt <= now()) sessions.delete(key);
    for (const [key, value] of limits) if (value.until <= now()) limits.delete(key);
    for (const [key, value] of latest) if (value.until <= now()) latest.delete(key);
  }
  function throttle(key, max, duration) {
    const value = limits.get(key);
    if (value && value.until > now()) { if (value.count >= max) fail('AUTH_RATE_LIMIT', 429); value.count++; }
    else limits.set(key, { count: 1, until: now() + duration });
  }
  function start(body, ip) {
    prune(); throttle('start:global', 100, 3600000); throttle('start:'+digest(ip), 20, 3600000);
    if (!body || typeof body.phone !== 'string' || body.phone.length > 32) fail('AUTH_PHONE');
    const phone = body.phone.replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) fail('AUTH_PHONE');
    const phoneKey = digest(phone), prior = latest.get(phoneKey);
    if (prior && prior.resendAt > now()) fail('AUTH_RESEND', 429);
    throttle('phone:'+phoneKey, 5, 3600000);
    if (prior) challenges.delete(prior.id);
    const id = randomBytes(24).toString('hex'), code = String(randomInt(1000000)).padStart(6, '0');
    const expiresAt = now()+300000, resendAt = now()+30000;
    challenges.set(id, { hash: digest(id+code), expiresAt, attempts: 0 });
    latest.set(phoneKey, { id, resendAt, until: now()+3600000 });
    return { mode: 'demo', challengeId: id, demoCode: code, expiresAt, resendAt, serverNow: now() };
  }
  function verify(body, ip) {
    prune(); throttle('verify:global', 300, 3600000); throttle('verify:'+digest(ip), 30, 600000);
    if (!body || typeof body.challengeId !== 'string' || body.challengeId.length > 64 || typeof body.code !== 'string' || !/^\d{6}$/.test(body.code)) fail('AUTH_CODE');
    const entry = challenges.get(body.challengeId);
    if (!entry) fail('AUTH_EXPIRED');
    if (++entry.attempts > 5) { challenges.delete(body.challengeId); fail('AUTH_ATTEMPTS', 429); }
    const given = digest(body.challengeId+body.code);
    if (!timingSafeEqual(Buffer.from(entry.hash), Buffer.from(given))) {
      if (entry.attempts === 5) { challenges.delete(body.challengeId); fail('AUTH_ATTEMPTS', 429); }
      fail('AUTH_CODE');
    }
    challenges.delete(body.challengeId);
    const token = randomBytes(32).toString('hex'), expiresAt = now()+3600000;
    const session = { mode: 'demo', phoneVerified: false, expiresAt };
    sessions.set(digest(token), { ...session, ownerId: randomBytes(24).toString('hex') });
    return { ...session, token };
  }
  function requireSession(token) {
    prune();
    const session = typeof token === 'string' && token.length === 64 ? sessions.get(digest(token)) : null;
    if (!session) fail('AUTH_REQUIRED', 401);
    return session;
  }
  function logout(token) { if (typeof token === 'string' && token.length === 64) sessions.delete(digest(token)); }
  function preview(token, body, ip) {
    requireSession(token); throttle('post:'+digest(ip), 10, 60000);
    if (!body || body.action !== 'preview') fail('AUTH_DRAFT');
    // Validate access only. The draft stays on the device, not in this request.
    return { mode: 'demo', published: false };
  }
  return { start, verify, requireSession, logout, preview };
}
