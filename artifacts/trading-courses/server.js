const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const API_PORT = 8080;
const HTML = path.join(__dirname, 'index.html');

http.createServer((req, res) => {
  // Proxy /api/* → API server on port 8080
  if (req.url.startsWith('/api')) {
    const opts = {
      hostname: 'localhost',
      port: API_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: 'localhost:' + API_PORT },
    };
    const proxy = http.request(opts, (apiRes) => {
      res.writeHead(apiRes.statusCode, apiRes.headers);
      apiRes.pipe(res);
    });
    proxy.on('error', () => { res.writeHead(502); res.end('API unavailable'); });
    req.pipe(proxy);
    return;
  }

  // Serve static files from public/
  const safeUrl = req.url.split('?')[0];
  if (safeUrl !== '/' && !safeUrl.startsWith('/api')) {
    const filePath = path.join(__dirname, 'public', path.normalize(safeUrl).replace(/^(\.\.[/\\])+/, ''));
    if (filePath.startsWith(path.join(__dirname, 'public')) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const types = { '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.webp':'image/webp', '.gif':'image/gif', '.ico':'image/x-icon', '.txt':'text/plain' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=3600' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // Serve index.html for everything else (inject booking endpoint from env)
  fs.readFile(HTML, (err, data) => {
    if (err) { res.writeHead(500); res.end('Error'); return; }
    const endpoint = (process.env.BOOKING_SHEET_URL || '').replace(/["'\\\r\n<]/g, '');
    const html = data.toString().replace('__BOOKING_ENDPOINT__', endpoint);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(html);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
