/*
 * tools/shoot.mjs — still-frame contact sheet.
 *
 * Renders each specimen at several turntable angles so the anatomy can be
 * eyeballed without sitting through the animation. Dev tool, not shipped.
 *
 *   node tools/shoot.mjs [pestId ...]
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const root = path.dirname(fileURLToPath(new URL('..', import.meta.url))) + '/Bugboss';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.env.SHOT_DIR || path.join(REPO, '.shots');
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: EXE, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });

await page.goto('file://' + path.join(REPO, 'tools', 'specimen-lab.html'));
await page.waitForFunction(() => window.LAB_READY === true, { timeout: 15000 });

const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : await page.evaluate(() => BB.PESTS.map(p => p.id));

for (const id of ids) {
  await page.evaluate((pid) => window.labLoad(pid), id);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, id + '.png') });
  console.log('shot', id);
}

await browser.close();
