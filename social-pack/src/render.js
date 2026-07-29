// Renders every .slide in posts.html to social-pack/renders/post-NN.png (1080x1350)
// Usage: node render.js [--only 1,5,12]
const path = require('path');
const { chromium } = require('playwright-core');

(async () => {
  const only = (() => {
    const i = process.argv.indexOf('--only');
    if (i === -1) return null;
    return new Set(process.argv[i + 1].split(',').map(n => String(n).padStart(2, '0')));
  })();

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1500 } });
  await page.goto('file://' + path.resolve(__dirname, 'posts.html'));
  await page.waitForTimeout(600); // let fonts settle
  await page.evaluate(() => document.fonts.ready);

  const ids = await page.$$eval('.slide', els => els.map(e => e.id));
  const outDir = path.resolve(__dirname, '..', 'renders');
  for (const id of ids) {
    const num = id.replace('post-', '');
    if (only && !only.has(num)) continue;
    const el = await page.$('#' + id);
    await el.scrollIntoViewIfNeeded();
    await el.screenshot({ path: path.join(outDir, id + '.png') });
    console.log('rendered', id);
  }
  await browser.close();
})();
