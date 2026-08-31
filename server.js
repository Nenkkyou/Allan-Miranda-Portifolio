// Servidor estático zero-dependência para desenvolvimento local.
// Uso: npm run dev  →  http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.normalize(path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath));

  // Impede acesso fora da pasta do projeto.
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Não encontrado');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

// Se a porta estiver ocupada, tenta a próxima (até 10 tentativas).
server.on('listening', () => console.log(`Servidor rodando em http://localhost:${server.address().port}`));
function listen(port, tentativas) {
  server.once('error', err => {
    if (err.code === 'EADDRINUSE' && tentativas > 0) {
      console.log(`Porta ${port} ocupada, tentando ${port + 1}...`);
      listen(port + 1, tentativas - 1);
    } else {
      throw err;
    }
  });
  server.listen(port);
}

listen(Number(PORT), 10);
