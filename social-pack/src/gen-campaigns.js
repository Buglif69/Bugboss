// Generates the daily campaign calendar + scheduler-ready CSVs in social-pack/campaigns/.
// Image URLs are pinned to a commit SHA so they keep working forever.
// Usage: node gen-campaigns.js <commit-sha>
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright-core');

const SRC = __dirname;
const ROOT = path.resolve(SRC, '..');
const OUT = path.join(ROOT, 'campaigns');
const START = '2026-08-03'; // day 1 (Monday)

const SHA = process.argv[2] || execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
const BASE = `https://raw.githubusercontent.com/Buglif69/Bugboss/${SHA}/social-pack`;

const CAMPAIGN = {
  'The Pest Files': 'Did You Know',
  'Season Watch': 'Seasonal',
  'Service Spotlight': 'Services',
  'Know the Signs': 'Services',
  'Why Slug-A-Bug': 'Trust & Offers',
  'Myth vs Fact': 'Myth-Busting',
  'Pro Tips': 'Pro Tips',
  'Local Areas': 'Suburb Spotlight',
  'Industry Watch': 'Commercial',
  'Ask Slug-A-Bug': 'Q&A',
};
// platform -> [folder, local posting time AEST]
const PLATFORMS = {
  facebook: ['facebook', '07:30'],
  'instagram-feed': ['instagram-feed', '11:45'],
  'instagram-story': ['instagram-story', '17:30'],
  'google-business': ['square', '09:00'],
};

const csvEsc = s => '"' + String(s).replace(/"/g, '""') + '"';

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('file://' + path.join(SRC, 'posts.html'));
  await page.waitForTimeout(300);
  const meta = await page.evaluate(() =>
    POSTS.map((p, i) => ({
      num: String(i + 1).padStart(3, '0'),
      tag: p.tag,
      title: p.title || p.head.replace(/<[^>]+>/g, '').slice(0, 44),
      caption: p.caption || '',
    })));
  await browser.close();

  // captions for posts 1-25 live in captions.md — pull them in
  const capFile = fs.readFileSync(path.join(ROOT, 'captions.md'), 'utf8');
  for (const m of meta) {
    if (m.caption) continue;
    const rx = new RegExp('\\*\\*0?' + Number(m.num) + ' — [^\\n]*\\*\\*\\n([^\\n]+(?:\\n[^\\n*#]+)*)');
    const hit = capFile.match(rx);
    if (hit) m.caption = hit[1].trim().replace(/\n/g, ' ');
  }

  // same pillar round-robin as schedule.md, finale pinned last
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
  const fin = order.findIndex(m => m.num === '100');
  if (fin !== -1) order.push(order.splice(fin, 1)[0]);

  fs.mkdirSync(OUT, { recursive: true });
  const start = new Date(START + 'T00:00:00Z');
  const rows = order.map((m, i) => {
    const d = new Date(start); d.setUTCDate(d.getUTCDate() + i); // daily, 7 days/week
    return {
      date: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString('en-AU', { weekday: 'short', timeZone: 'UTC' }),
      campaign: CAMPAIGN[m.tag] || m.tag,
      ...m,
    };
  });

  // master calendar
  let master = 'date,day,campaign,post,title,caption,facebook_image,instagram_image,story_image,square_image\n';
  for (const r of rows) {
    master += [r.date, r.day, csvEsc(r.campaign), r.num, csvEsc(r.title), csvEsc(r.caption),
      `${BASE}/facebook/post-${r.num}.jpg`, `${BASE}/instagram-feed/post-${r.num}.jpg`,
      `${BASE}/instagram-story/post-${r.num}.jpg`, `${BASE}/square/post-${r.num}.jpg`].join(',') + '\n';
  }
  fs.writeFileSync(path.join(OUT, 'campaign-calendar.csv'), master);

  // per-platform scheduler CSVs (Publer/Metricool-style: Date, Time, Text, Media URL)
  for (const [name, [folder, time]] of Object.entries(PLATFORMS)) {
    let csv = 'date,time,text,media_url,campaign,post\n';
    for (const r of rows) {
      csv += [r.date, time, csvEsc(r.caption), `${BASE}/${folder}/post-${r.num}.jpg`,
        csvEsc(r.campaign), r.num].join(',') + '\n';
    }
    fs.writeFileSync(path.join(OUT, name + '.csv'), csv);
  }
  console.log(`campaigns/ written: ${rows.length} days from ${START}, URLs pinned to ${SHA.slice(0, 7)}`);
})();
