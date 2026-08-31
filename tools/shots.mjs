// Captura screenshots do site em desktop e mobile para inspeção visual.
// Uso: npm run shots  (requer o servidor rodando em http://localhost:3000)
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = fileURLToPath(new URL('../shots/', import.meta.url));

fs.mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'mobile', width: 390, height: 844, mobile: true }
];

// Posições de scroll a inspecionar (fração da altura total da página).
const stops = [
  ['01-topo', 0],
  ['02-manifesto', 0.14],
  ['03-trabalhos-head', 0.28],
  ['04-projeto-1-meio', 0.42],
  ['05-projeto-1-fim', 0.52],
  ['06-projeto-2-meio', 0.64],
  ['07-sobre', 0.8],
  ['08-contato', 1]
];

const errors = [];

for (const vp of viewports) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'shell',
    args: ['--hide-scrollbars', '--force-device-scale-factor=1']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.mobile, hasTouch: vp.mobile });
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${vp.name}] console: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${vp.name}] página: ${e.message}`));
  page.on('requestfailed', r => errors.push(`[${vp.name}] requisição falhou: ${r.url()}`));

  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500)); // loader + fontes

  const scrollMax = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflowX > 0) errors.push(`[${vp.name}] overflow horizontal de ${overflowX}px`);

  for (const [label, frac] of stops) {
    await page.evaluate(y => window.scrollTo(0, y), Math.round(scrollMax * frac));
    await new Promise(r => setTimeout(r, 1100)); // deixa o ScrollTrigger assentar
    await page.screenshot({ path: `${OUT}${vp.name}-${label}.png` });
  }

  // Menu mobile aberto
  if (vp.mobile) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 600));
    await page.click('.nav__toggle');
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: `${OUT}mobile-09-menu.png` });
  }

  await browser.close();
  console.log(`${vp.name}: ok (scrollMax=${scrollMax})`);
}

if (errors.length) {
  console.log('\nPROBLEMAS DETECTADOS:');
  errors.forEach(e => console.log(' - ' + e));
} else {
  console.log('\nSem erros de console nem overflow horizontal.');
}
