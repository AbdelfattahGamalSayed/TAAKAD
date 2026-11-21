import { domainToUnicode } from 'node:url';
import { isIP } from 'node:net';

export const FEED_URL = 'https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-domains-ACTIVE.txt';
export const FEED_SOURCE = 'https://github.com/Phishing-Database/Phishing.Database';
export const TTL_MS = 60 * 60 * 1000;
export const MAX_STALE_MS = 24 * 60 * 60 * 1000;
const MAX_BYTES = 40 * 1024 * 1024;

export function urlEvidence(text) {
  const tokens = text.match(/https?:\/\/[^\s<>"\u060C]+|www\.[^\s<>"\u060C]+|[^\s<>"\u060C]+/giu) || [];
  const seen = new Set();
  const entries = [];
  for (let raw of tokens) {
    raw = raw.replace(/^[([{]+/, '').replace(/[)\]},;!،؛。]+$/, '');
    if (raw.endsWith('.') && !raw.endsWith('..')) raw = raw.slice(0, -1);
    const explicit = /^https?:\/\//i.test(raw);
    if (!explicit && (raw.includes('@') || !/^[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+(?:[/:?#]\S*)?$/u.test(raw))) continue;
    try {
      const url = new URL(explicit ? raw : 'https://' + raw);
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) continue;
      const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
      if (seen.has(url.href)) continue;
      seen.add(url.href);
      const signals = [];
      if (url.protocol === 'http:') signals.push('unencrypted_http');
      if (url.username || url.password) signals.push('credentials_in_url');
      if (hostname.includes('xn--')) signals.push('internationalized_domain');
      if (isIP(hostname.replace(/^\[|\]$/g, ''))) signals.push('ip_address_host');
      if (['bit.ly', 'tinyurl.com', 't.co', 'shorturl.at'].includes(hostname)) signals.push('shortened_link');
      if (hostname.split('.').length > 4) signals.push('many_subdomains');
      if (url.port) signals.push('unusual_port');
      entries.push({ url: raw, hostname, unicodeHostname: domainToUnicode(hostname) || hostname, signals });
    } catch { /* Non-URLs are ordinary message text. */ }
  }
  return entries.slice(0, 10);
}

export function parseFeed(text) {
  const domains = new Set();
  let invalid = 0, total = 0;
  for (const line of text.split(/\r?\n/)) {
    const value = line.trim().toLowerCase();
    if (!value || value.startsWith('#')) continue;
    total++;
    if (!/^[a-z0-9_-]+(?:\.[a-z0-9_-]+)+\.?$/.test(value)) { invalid++; continue; }
    domains.add(value.replace(/\.$/, ''));
  }
  // The upstream community list contains occasional malformed records. Reject
  // corrupt downloads, but skip isolated invalid hostnames (at most 1%).
  if (!domains.size || invalid / total > 0.01) throw new Error('Invalid or empty feed');
  return domains;
}

export function createReputationService({ fetchImpl = fetch, now = Date.now } = {}) {
  let cached = null;
  let inFlight = null;
  let retryAfter = 0;
  async function refresh() {
    const response = await fetchImpl(FEED_URL, { redirect: 'error', signal: AbortSignal.timeout(15000), headers: { Accept: 'text/plain' } });
    if (!response.ok || !response.body) throw new Error('Feed unavailable');
    if (Number(response.headers.get('content-length')) > MAX_BYTES) throw new Error('Feed too large');
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BYTES) throw new Error('Feed too large');
        chunks.push(Buffer.from(value));
      }
    } finally { await reader.cancel().catch(() => {}); }
    cached = { domains: parseFeed(Buffer.concat(chunks).toString('utf8')), fetchedAt: now() };
    retryAfter = 0;
  }
  return async function check(entries) {
    if (!entries.length) return [];
    if ((!cached || now() - cached.fetchedAt >= TTL_MS) && now() >= retryAfter) {
      if (!inFlight) inFlight = refresh().catch(() => { retryAfter = now() + 60000; }).finally(() => { inFlight = null; });
      await inFlight;
    }
    const usable = cached && now() - cached.fetchedAt < MAX_STALE_MS;
    const stale = Boolean(usable && now() - cached.fetchedAt >= TTL_MS);
    return entries.map(entry => ({
      ...entry,
      reputation: {
        status: !usable ? 'unavailable' : cached.domains.has(entry.hostname) ? 'listed' : 'not_listed',
        source: 'Phishing.Database', sourceUrl: FEED_SOURCE,
        fetchedAt: usable ? new Date(cached.fetchedAt).toISOString() : null,
        checkedAt: new Date(now()).toISOString(), stale,
        matchType: usable && cached.domains.has(entry.hostname) ? 'exact_hostname' : null,
      },
    }));
  };
}
export const checkReputation = createReputationService();
