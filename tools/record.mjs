/*
 * tools/record.mjs — turn a dossier into a finished, postable video.
 *
 * Records the page as video, captures the synthesised terminal audio straight
 * off the Web Audio graph, and muxes the two into an MP4 that can go on
 * Reels, TikTok, YouTube Shorts or into Meta Ads Manager as-is.
 *
 *   node tools/record.mjs --pest=german-cockroach --format=reel
 *   node tools/record.mjs --pest=redback-spider --format=square --speed=1.3
 *   node tools/record.mjs --all --format=reel
 *
 * Options
 *   --pest=<id>|all   specimen (default german-cockroach)
 *   --format=reel|square|wide|web   canvas shape (default reel)
 *   --speed=1.2       typing speed multiplier
 *   --items=3         list items per section
 *   --out=<dir>       output directory (default dist/video)
 *   --silent          skip audio capture
 *   --hold=2.5        seconds to linger on the CTA before cutting
 */
import { chromium } from 'playwright';
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import ffmpegPath from 'ffmpeg-static';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const SIZES = {
  reel: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  wide: { width: 1920, height: 1080 },
  web: { width: 1920, height: 1080 }
};

const arg = (k, d) => {
  const hit = process.argv.find(a => a.startsWith('--' + k + '='));
  return hit ? hit.split('=').slice(1).join('=') : (process.argv.includes('--' + k) ? true : d);
};

const format = arg('format', 'reel');
const size = SIZES[format] || SIZES.reel;
const speed = arg('speed', format === 'reel' ? '1.75' : format === 'square' ? '1.5' : '1');
const items = arg('items', format === 'wide' || format === 'web' ? '4' : '3');
const outDir = path.resolve(REPO, arg('out', 'dist/video'));
const silent = !!arg('silent', false);
const tail = parseFloat(arg('hold', '2.6'));

fs.mkdirSync(outDir, { recursive: true });

const ids = arg('all', false)
  ? JSON.parse(fs.readFileSync(path.join(REPO, 'dist', 'pest-ids.json'), 'utf8'))
  : [arg('pest', 'german-cockroach')];

for (const id of ids) {
  await record(id);
}

async function record(pestId) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bbrec-'));
  const browser = await chromium.launch({
    executablePath: EXE,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--disable-features=AudioServiceOutOfProcess',
      '--mute-audio=false'
    ]
  });
  const ctx = await browser.newContext({
    viewport: size,
    deviceScaleFactor: 1,
    recordVideo: { dir: tmp, size }
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('  page error:', e.message));

  const q = new URLSearchParams({
    pest: pestId, format, speed, items,
    chrome: '0', sound: '1', hold: '1'
  });
  await page.goto('file://' + path.join(REPO, 'dossier.html') + '?' + q);
  await page.waitForFunction(() => !!window.BBStage && !!window.BB.sfx.ctx, { timeout: 20000 });
  await page.waitForTimeout(600);          // let the first frame settle

  // Tap the Web Audio master so the synthesised clatter lands in the file.
  if (!silent) {
    await page.evaluate(() => {
      const sfx = window.BB.sfx;
      const dest = sfx.ctx.createMediaStreamDestination();
      sfx.master.connect(dest);
      const rec = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus' });
      window.__chunks = [];
      rec.ondataavailable = e => { if (e.data.size) window.__chunks.push(e.data); };
      rec.start(200);
      window.__rec = rec;
    });
  }

  const t0 = Date.now();
  await page.evaluate(() => window.BBStage.play());
  console.log(`recording ${pestId} (${format} ${size.width}x${size.height}) ...`);

  await page.waitForSelector('.bb-cta.is-in', { timeout: 240000 });
  await page.waitForTimeout(tail * 1000);
  const duration = (Date.now() - t0) / 1000;

  let audioFile = null;
  if (!silent) {
    const b64 = await page.evaluate(async () => {
      window.__rec.stop();
      await new Promise(r => (window.__rec.onstop = r));
      const blob = new Blob(window.__chunks, { type: 'audio/webm' });
      const buf = await blob.arrayBuffer();
      let s = '';
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return btoa(s);
    });
    audioFile = path.join(tmp, 'audio.webm');
    fs.writeFileSync(audioFile, Buffer.from(b64, 'base64'));
  }

  const videoPath = await page.video().path();
  await ctx.close();                        // flushes the video file
  await browser.close();

  // The screencast starts at context creation; playback starts later. Trim the
  // difference so the video opens on the boot sequence, keeping a short lead.
  const lead = 0.35;
  const rawLen = probeDuration(videoPath);
  const offset = Math.max(0, (rawLen - duration) - lead);

  const out = path.join(outDir, `${pestId}-${format}.mp4`);
  const args = ['-y', '-ss', offset.toFixed(2), '-i', videoPath];
  if (audioFile) args.push('-i', audioFile);
  args.push(
    '-t', (duration + lead).toFixed(2),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-pix_fmt', 'yuv420p', '-r', '30',
    '-movflags', '+faststart'
  );
  if (audioFile) args.push('-c:a', 'aac', '-b:a', '128k', '-shortest');
  args.push(out);

  const r = spawnSync(ffmpegPath, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stderr.split('\n').slice(-12).join('\n'));
    throw new Error('ffmpeg failed for ' + pestId);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  const mb = (fs.statSync(out).size / 1e6).toFixed(1);
  console.log(`  → ${path.relative(REPO, out)}  ${duration.toFixed(1)}s  ${mb} MB`);
}

function probeDuration(file) {
  const r = spawnSync(ffmpegPath, ['-i', file], { encoding: 'utf8' });
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr || '');
  return m ? (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]) : 0;
}
