/*
 * tools/preview.mjs — screenshot the running dossier at chosen moments.
 *
 *   node tools/preview.mjs [url-query] [ms,ms,ms]
 *   node tools/preview.mjs "pest=redback-spider&format=reel" 3000,9000
 *
 * Also prints a frame-time sample so the polygon budget stays honest.
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(REPO, '.shots');
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
fs.mkdirSync(OUT, { recursive: true });

const query = process.argv[2] || 'pest=german-cockroach';
const times = (process.argv[3] || '2500,7000,16000').split(',').map(Number);
const size = /format=reel/.test(query) ? { width: 540, height: 960 }
  : /format=square/.test(query) ? { width: 720, height: 720 }
    : { width: 1280, height: 720 };
const tag = (query.match(/pest=([\w-]+)/) || [, 'shot'])[1] + '-' + (query.match(/format=(\w+)/) || [, 'web'])[1];

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });

await page.goto('file://' + path.join(REPO, 'dossier.html') + '?' + query);
let prev = 0;
for (const t of times) {
  await page.waitForTimeout(t - prev);
  prev = t;
  await page.screenshot({ path: path.join(OUT, `${tag}-${t}.png`) });
  console.log('shot at', t + 'ms');
}

const perf = await page.evaluate(() => new Promise(res => {
  const marks = [];
  let last = performance.now();
  let n = 0;
  function tick(now) {
    marks.push(now - last); last = now;
    if (++n < 90) requestAnimationFrame(tick);
    else {
      const s = marks.slice(30).sort((a, b) => a - b);
      res({ median: +s[s.length >> 1].toFixed(2), p90: +s[Math.floor(s.length * 0.9)].toFixed(2) });
    }
  }
  requestAnimationFrame(tick);
}));
console.log('frame ms', perf);
await browser.close();
