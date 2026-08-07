/**
 * Zero-dependency static server for local preview: npm run dev
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 5173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const rel = url === '/' ? 'index.html' : url.replace(/^\/+/, '');
  const file = path.join(ROOT, rel);

  // Never serve anything outside the project root.
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404 - not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    }).end(data);
  });
}).listen(PORT, () => {
  console.log(`Serving ${ROOT}\n  http://localhost:${PORT}`);
});
