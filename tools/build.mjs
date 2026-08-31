// Gera a pasta dist/ pronta para deploy na Hostinger (hospedagem Apache).
// Uso: npm run build  →  suba o CONTEÚDO de dist/ para public_html.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIST = path.join(ROOT, 'dist');

const ARQUIVOS = ['index.html', 'style.css', 'script.js'];
const PASTAS = ['imagens'];

const HTACCESS = `# Portfólio Allan Miranda — Hostinger (Apache)
AddDefaultCharset utf-8
DirectoryIndex index.html
Options -Indexes

# Força HTTPS (SSL gratuito da Hostinger)
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Compressão de texto
<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>

# Cache no navegador
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType text/html "access plus 0 seconds"
ExpiresByType text/css "access plus 7 days"
ExpiresByType application/javascript "access plus 7 days"
ExpiresByType image/jpeg "access plus 30 days"
ExpiresByType image/png "access plus 30 days"
ExpiresByType image/webp "access plus 30 days"
ExpiresByType image/svg+xml "access plus 30 days"
</IfModule>
`;

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

let total = 0;
const copiar = (origem, destino) => {
  fs.copyFileSync(origem, destino);
  const kb = (fs.statSync(origem).size / 1024).toFixed(1);
  total += fs.statSync(origem).size;
  console.log(`  ${path.relative(ROOT, destino)} (${kb} KB)`);
};

console.log('Gerando dist/:');
for (const arquivo of ARQUIVOS) copiar(path.join(ROOT, arquivo), path.join(DIST, arquivo));
for (const pasta of PASTAS) {
  fs.mkdirSync(path.join(DIST, pasta), { recursive: true });
  for (const arquivo of fs.readdirSync(path.join(ROOT, pasta))) {
    copiar(path.join(ROOT, pasta, arquivo), path.join(DIST, pasta, arquivo));
  }
}
fs.writeFileSync(path.join(DIST, '.htaccess'), HTACCESS);
console.log('  .htaccess');
console.log(`\nPronto: dist/ com ${(total / 1024).toFixed(0)} KB. Suba o conteúdo de dist/ para public_html na Hostinger.`);
