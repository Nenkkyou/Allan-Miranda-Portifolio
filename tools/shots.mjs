// Captura screenshots do site em desktop e mobile para inspeção visual.
// Uso: npm run shots  (requer o servidor rodando em http://localhost:3000)
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const CHROME = process.env.CHROME_BIN || [
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:/Program Files/Google/Chrome/Application/chrome.exe'
].find(arquivo => fs.existsSync(arquivo));
if (!CHROME) throw new Error('Chrome não encontrado. Defina CHROME_BIN com o caminho do navegador.');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = fileURLToPath(new URL('../shots/', import.meta.url));

fs.mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'tablet-820', width: 820, height: 1000, mobile: true },
  { name: 'mobile-420', width: 420, height: 900, mobile: true },
  { name: 'mobile', width: 390, height: 844, mobile: true }
];

// Âncoras reais: as capturas continuam úteis após ajustes no espaçamento.
const stops = [
  ['01-topo', '.hero'],
  ['02-manifesto', '.reveal-text', .5],
  ['03-trabalhos-head', '.work__head'],
  ['04-projeto-1-entrada', '.project--pbox', .08],
  ['05-projeto-1-leitura', '.project--pbox', .48],
  ['06-projeto-1-saida', '.project--pbox', .94],
  ['07-projeto-2-leitura', '.project--paraty', .48],
  ['08-sobre', '.about'],
  ['09-contato', '.contact']
];

const errors = [];

for (const vp of viewports) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--hide-scrollbars', '--force-device-scale-factor=1', ...(process.env.CHROME_NO_SANDBOX === '1' ? ['--no-sandbox'] : [])]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.mobile, hasTouch: vp.mobile });
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${vp.name}] console: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${vp.name}] página: ${e.message}`));
  page.on('requestfailed', r => errors.push(`[${vp.name}] requisição falhou: ${r.url()}`));

  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000)); // loader + fontes
  await page.evaluate(() => document.documentElement.style.scrollBehavior = 'auto');

  const scrollMax = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflowX > 0) errors.push(`[${vp.name}] overflow horizontal de ${overflowX}px`);

  for (const [label, selector, phase = 0] of stops) {
    await page.evaluate(({ selector, phase }) => {
      const el = document.querySelector(selector), top = el.getBoundingClientRect().top + scrollY;
      if (selector.startsWith('.project--')) window.scrollTo(0, top + (el.offsetHeight - innerHeight) * phase);
      else if (selector === '.reveal-text') {
        const start = top - innerHeight * .78, end = top + el.offsetHeight - innerHeight * .42;
        window.scrollTo(0, start + (end - start) * phase);
      } else window.scrollTo(0, top - 94);
    }, { selector, phase });
    await new Promise(r => setTimeout(r, selector === '.about' ? 1900 : 1400));
    await page.screenshot({ path: `${OUT}${vp.name}-${label}.png` });
  }

  // Menu mobile aberto
  if (vp.mobile) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 600));
    await page.click('.nav__toggle');
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: `${OUT}${vp.name}-10-menu.png` });
  }

  await browser.close();
  console.log(`${vp.name}: ok (scrollMax=${scrollMax})`);
}

if (errors.length) {
  console.log('\nPROBLEMAS DETECTADOS:');
  errors.forEach(e => console.log(' - ' + e));
  process.exitCode = 1;
} else {
  console.log('\nSem erros de console nem overflow horizontal.');
}
