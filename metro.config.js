const { getDefaultConfig } = require('expo/metro-config');
const http = require('node:http');
const config = getDefaultConfig(__dirname);
config.resolver.blockList = /[\\/]\.local[\\/]/;
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => (req, res, next) => {
    if (!req.url?.startsWith('/api/')) return middleware(req, res, next);
    // One development origin for both the bundle and API; works with Expo's tunnel too.
    const upstream = http.request({ hostname: '127.0.0.1', port: 8787, path: req.url, method: req.method,
      headers: { 'content-type': req.headers['content-type'] || 'application/json', authorization: req.headers.authorization || '', 'x-session-token': req.headers['x-session-token'] || '' } }, response => {
      res.writeHead(response.statusCode, response.headers); response.pipe(res);
    });
    upstream.on('error', () => {
      if (!res.headersSent) { res.writeHead(503, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'BACKEND_OFFLINE' })); }
    });
    res.on('close', () => { if (!res.writableEnded) upstream.destroy(); });
    req.pipe(upstream);
  },
};
module.exports = config;
