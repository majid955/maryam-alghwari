const http = require('http');
const fs = require('fs');
const path = require('path');
const { createProxyServer } = require('http');

const PORT = process.env.PORT || 3000;
const API_PORT = 8080;
const HTML = path.join(__dirname, 'index.html');

http.createServer((req, res) => {
  // Proxy /api/* to the API server
  if (req.url.startsWith('/api')) {
    const options = {
      hostname: 'localhost',
      port: API_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${API_PORT}` },
    };
    const proxy = http.request(options, (apiRes) => {
      res.writeHead(apiRes.statusCode, apiRes.headers);
      apiRes.pipe(res);
    });
    proxy.on('error', () => {
      res.writeHead(502);
      res.end('API unavailable');
    });
    req.pipe(proxy);
    return;
  }

  // Serve index.html for everything else
  fs.readFile(HTML, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading page');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`مريم الجهوري site running on port ${PORT}`);
});
