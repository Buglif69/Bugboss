// Renders every post in posts.html into per-platform folders, and generates
// captions + posting schedule from the post data.
//
//   social-pack/facebook/         1080x1350 (4:5 feed)
//   social-pack/instagram-feed/   1080x1350 (4:5 feed)
//   social-pack/instagram-story/  1080x1920 (9:16, framed)
//   social-pack/square/           1080x1080 (1:1 for Google Business / LinkedIn)
//
// Real photos: drop post-NNN.jpg/.png into src/photos/ and that post's scene
// backdrop is replaced by the photo (under a brand scrim) on next render.
//
// Usage: node render.js [--only 1,5,12]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const SRC = __dirname;
const ROOT = path.resolve(SRC, '..');
const PLATFORMS = ['facebook', 'instagram-feed', 'instagram-story', 'square'];
const BAND = { light: '#E8E2D7', dark: '#0C0202', red: '#C8141B' }; // story/square frame fill
const JPEG = { type: 'jpeg', quality: 92 };
const START_MONDAY = '2026-08-03'; // week 1 of the posting schedule

(async () => {
  const only = (() => {
    const i = process.argv.indexOf('--only');
    if (i === -1) return null;
    return new Set(process.argv[i + 1].split(',').map(n => String(n).padStart(3, '0')));
  })();

  for (const p of PLATFORMS) fs.mkdirSync(path.join(ROOT, p), { recursive: true });

  // photo overrides: src/photos/post-NNN.(jpg|jpeg|png)
  const photosDir = path.join(SRC, 'photos');
  const photos = {};
  if (fs.existsSync(photosDir)) {
    for (const f of fs.readdirSync(photosDir)) {
      const m = f.match(/^(post-\d{3})\.(jpe?g|png)$/i);
      if (m) photos[m[1]] = f;
    }
  }

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 2000 } });
  await page.addInitScript(map => { window.PHOTOS = map; }, photos);
  await page.goto('file://' + path.resolve(SRC, 'posts.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const slides = await page.$$eval('.slide', els => els.map(e => ({ id: e.id, tone: e.dataset.tone })));

  for (const { id, tone } of slides) {
    const num = id.replace('post-', '');
    if (only && !only.has(num)) continue;
    const el = await page.$('#' + id);
    await el.scrollIntoViewIfNeeded();

    const feed = path.join(ROOT, 'facebook', id + '.jpg');
    await el.screenshot({ path: feed, ...JPEG });
    fs.copyFileSync(feed, path.join(ROOT, 'instagram-feed', id + '.jpg'));

    // framed variants share one wrapper: slide clone centered on a brand-band canvas
    for (const [folder, w, h, scale] of [['instagram-story', 1080, 1920, 1], ['square', 1080, 1080, 0.8]]) {
      await page.evaluate(({ id, w, h, scale, band }) => {
        const box = document.createElement('div');
        box.id = 'shootbox';
        box.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;background:${band};overflow:hidden;z-index:999`;
        const clone = document.getElementById(id).cloneNode(true);
        clone.removeAttribute('id');
        const sw = 1080 * scale, sh = 1350 * scale;
        clone.style.cssText += `;margin:0;position:absolute;left:${(w - sw) / 2}px;top:${(h - sh) / 2}px;transform:scale(${scale});transform-origin:top left`;
        box.appendChild(clone);
        document.body.prepend(box);
        window.scrollTo(0, 0);
      }, { id, w, h, scale, band: BAND[tone] || '#150404' });
      const box = await page.$('#shootbox');
      await box.screenshot({ path: path.join(ROOT, folder, id + '.jpg'), ...JPEG });
      await page.evaluate(() => document.getElementById('shootbox').remove());
    }
    console.log('rendered', id, photos[id] ? '(real photo)' : '(scene)');
  }

  // ---- docs: captions + schedule from post data ----
  const meta = await page.evaluate(() =>
    POSTS.map((p, i) => ({
      num: String(i + 1).padStart(3, '0'),
      tag: p.tag,
      title: p.title || p.head.replace(/<[^>]+>/g, '').slice(0, 44),
      caption: p.caption || null,
    })));
  await browser.close();

  // captions.md: keep the hand-written 1–25 section, regenerate 26–100
  const capPath = path.join(ROOT, 'captions.md');
  const MARKER = '\n---\n\n# Posts 26–100 (generated from src/posts.html)\n';
  let cap = fs.existsSync(capPath) ? fs.readFileSync(capPath, 'utf8') : '';
  cap = cap.split(MARKER)[0];
  cap += MARKER + '\n' + meta.filter(m => m.caption)
    .map(m => `**${m.num} — ${m.title}**\n${m.caption}\n`).join('\n');
  fs.writeFileSync(capPath, cap);

  // schedule.md: 5/week Mon–Fri, round-robin across pillars so no week repeats a theme twice
  const groups = {};
  for (const m of meta) (groups[m.tag] = groups[m.tag] || []).push(m);
  const tags = Object.keys(groups);
  const order = [];
  let t = 0;
  while (order.length < meta.length) {
    for (let k = 0; k < tags.length && order.length < meta.length; k++) {
      const g = groups[tags[(t + k) % tags.length]];
      if (g.length) { order.push(g.shift()); t = t + k + 1; break; }
    }
  }
  // keep the "Post No. 100" finale as the very last slot
  const fin = order.findIndex(m => m.num === '100');
  if (fin !== -1) order.push(order.splice(fin, 1)[0]);

  const start = new Date(START_MONDAY + 'T00:00:00Z');
  const fmt = d => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  let sched = `# Slug-A-Bug — Posting Schedule (100 posts, 5/week Mon–Fri)\n\nSuggested time: 7:30–8:00am AEST. Post the same file from the folder matching each platform\n(\`facebook/\`, \`instagram-feed/\`, \`instagram-story/\`, \`square/\`). Captions in \`captions.md\`.\n\n| Week | Mon | Tue | Wed | Thu | Fri |\n|---|---|---|---|---|---|\n`;
  for (let wk = 0; wk < Math.ceil(order.length / 5); wk++) {
    const d = new Date(start); d.setUTCDate(d.getUTCDate() + wk * 7);
    const cells = order.slice(wk * 5, wk * 5 + 5).map(m => `${m.num} ${m.title}`);
    while (cells.length < 5) cells.push('—');
    sched += `| **${wk + 1}** (${fmt(d)}) | ${cells.join(' | ')} |\n`;
  }
  sched += `\nPillar rotation is automatic: each week cycles through ${tags.length} content pillars (${tags.join(' · ')}) so the feed never repeats a theme two days running.\n`;
  fs.writeFileSync(path.join(ROOT, 'schedule.md'), sched);
  console.log('docs written: captions.md, schedule.md');
})();
