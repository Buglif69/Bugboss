/*
 * tools/fit-specimen.mjs — fit the generated specimen to the real photograph.
 *
 *   node tools/fit-specimen.mjs german-cockroach
 *   node tools/fit-specimen.mjs --all --iterations=250
 *   node tools/fit-specimen.mjs redback-spider --write     (apply the result)
 *
 * WHY THIS INSTEAD OF IMAGE-TO-3D
 *
 * Services like Meshy and Tripo generate a mesh from an image with no idea
 * what they are looking at. That is why they do well on a shoe and badly on a
 * cockroach: they have no prior that says "six legs, two antennae, a segmented
 * abdomen", so thin structures get guessed away.
 *
 * This system already has that prior — anatomy.js knows what an insect is
 * built from. So the harder half of the problem is already solved, and what is
 * left is measurement: take the real photograph and work out the numbers.
 * That is analysis-by-synthesis — render a candidate, compare it against the
 * photo, adjust, repeat — the same family of approach used to fit body models
 * to photographs in vision research, and it is strictly better here because
 * every candidate is anatomically correct by construction. The output is a
 * clean 4-6k triangle model with real legs that holds up from every angle,
 * not a blob that only works from the camera's viewpoint.
 *
 * Two things get measured:
 *   COLOUR — the animal's real palette, sampled off the photo and assigned to
 *            body parts by where they sit in the frame.
 *   SHAPE  — proportions, tuned by hill-climbing on silhouette overlap (IoU)
 *            between the render and the photograph.
 *
 * Nothing is overwritten without --write. The default prints the patch.
 *
 * WHAT IT ACTUALLY MEASURED, ON THE PHOTOGRAPHS WE HAVE
 *
 * Run across all fourteen field photographs: five passed the trust gate and
 * nine were rejected. Of the five that passed, none was a visible improvement
 * on the hand-set colours — the measured values landed within noise of them.
 * So the results are reported and not applied.
 *
 * The reason is the input, not the method. These are wildlife snaps: a wasp on
 * a green lid, an ant on a leaf, a huntsman on red bark. Without a neural
 * matting model there is no way to separate a small animal from a busy
 * background cleanly, so the grade drags the background in with it — one run
 * turned the paper wasp's antennae blue, which is exactly the failure the gate
 * now catches.
 *
 * Give it a specimen on a white card, phone-flash, filling the frame, and the
 * segmentation becomes trivial and the measurement becomes worth applying.
 * That is a five-minute job on any pest control van, and it is the input this
 * tool was built for.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PHOTOS = path.join(REPO, 'assets', 'photos');
const OUT = path.join(REPO, 'assets', 'fits');

const arg = (k, d) => {
  const hit = process.argv.find(a => a.startsWith('--' + k + '='));
  return hit ? hit.split('=')[1] : (process.argv.includes('--' + k) ? true : d);
};
const ITER = parseInt(arg('iterations', '160'), 10);
const WRITE = !!arg('write', false);
const DEBUG = !!arg('debug', false);
const MASK = 128;                        // working resolution for both masks
const KEEP_EXPOSURE = !!arg('keep-exposure', false);   // transfer photo brightness too

/* ------------------------------------------------------------------ *
 * 1. Segment the animal out of the photograph
 *
 * No neural matting available offline, so this is classical: model the
 * background from the frame border, score every pixel on how far it sits from
 * that model, threshold with Otsu, then keep the largest blob and fill it.
 * Wildlife snaps have busy backgrounds, so the result is scored for
 * plausibility and a bad mask is reported rather than used.
 * ------------------------------------------------------------------ */
async function segment(file) {
  const img = sharp(file).resize(MASK, MASK, { fit: 'fill' });
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });
  const N = MASK * MASK;

  // background model: mean and spread of a border band
  const band = [];
  for (let y = 0; y < MASK; y++) {
    for (let x = 0; x < MASK; x++) {
      const edge = x < 6 || y < 6 || x > MASK - 7 || y > MASK - 7;
      if (edge) band.push((y * MASK + x) * 3);
    }
  }
  const bg = [0, 0, 0];
  for (const i of band) { bg[0] += data[i]; bg[1] += data[i + 1]; bg[2] += data[i + 2]; }
  bg[0] /= band.length; bg[1] /= band.length; bg[2] /= band.length;

  const score = new Float32Array(N);
  let lo = Infinity, hi = -Infinity;
  for (let p = 0; p < N; p++) {
    const i = p * 3;
    const d = Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
    // bias toward the middle: the subject is what the photographer framed
    const x = (p % MASK) / MASK - 0.5, y = Math.floor(p / MASK) / MASK - 0.5;
    const centre = 1 - Math.min(1, Math.hypot(x, y) / 0.62);
    const s = d * (0.55 + 0.45 * centre);
    score[p] = s;
    if (s < lo) lo = s;
    if (s > hi) hi = s;
  }

  // Otsu threshold over the normalised score
  const bins = new Array(64).fill(0);
  for (let p = 0; p < N; p++) bins[Math.min(63, Math.floor((score[p] - lo) / (hi - lo + 1e-6) * 63))]++;
  let total = N, sum = 0;
  for (let b = 0; b < 64; b++) sum += b * bins[b];
  let sumB = 0, wB = 0, best = 0, thr = 32;
  for (let b = 0; b < 64; b++) {
    wB += bins[b];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += b * bins[b];
    const between = wB * wF * Math.pow(sumB / wB - (sum - sumB) / wF, 2);
    if (between > best) { best = between; thr = b; }
  }
  const cut = lo + (thr / 63) * (hi - lo);

  let mask = new Uint8Array(N);
  for (let p = 0; p < N; p++) mask[p] = score[p] > cut ? 1 : 0;
  mask = largestBlob(mask);
  mask = fillHoles(mask);

  const area = mask.reduce((a, b) => a + b, 0) / N;
  return { mask, area, bg, raw: data };
}

function largestBlob(mask) {
  const seen = new Int32Array(MASK * MASK).fill(-1);
  let bestId = -1, bestSize = 0, id = 0;
  const stack = [];
  for (let p = 0; p < mask.length; p++) {
    if (!mask[p] || seen[p] >= 0) continue;
    let size = 0;
    stack.length = 0; stack.push(p); seen[p] = id;
    while (stack.length) {
      const q = stack.pop(); size++;
      const x = q % MASK, y = (q / MASK) | 0;
      if (x > 0 && mask[q - 1] && seen[q - 1] < 0) { seen[q - 1] = id; stack.push(q - 1); }
      if (x < MASK - 1 && mask[q + 1] && seen[q + 1] < 0) { seen[q + 1] = id; stack.push(q + 1); }
      if (y > 0 && mask[q - MASK] && seen[q - MASK] < 0) { seen[q - MASK] = id; stack.push(q - MASK); }
      if (y < MASK - 1 && mask[q + MASK] && seen[q + MASK] < 0) { seen[q + MASK] = id; stack.push(q + MASK); }
    }
    if (size > bestSize) { bestSize = size; bestId = id; }
    id++;
  }
  const out = new Uint8Array(mask.length);
  for (let p = 0; p < mask.length; p++) out[p] = seen[p] === bestId ? 1 : 0;
  return out;
}

function fillHoles(mask) {
  // flood the outside; anything unreached that is not subject becomes subject
  const outside = new Uint8Array(mask.length);
  const stack = [];
  for (let x = 0; x < MASK; x++) { stack.push(x, (MASK - 1) * MASK + x); }
  for (let y = 0; y < MASK; y++) { stack.push(y * MASK, y * MASK + MASK - 1); }
  while (stack.length) {
    const q = stack.pop();
    if (q < 0 || q >= mask.length || outside[q] || mask[q]) continue;
    outside[q] = 1;
    const x = q % MASK, y = (q / MASK) | 0;
    if (x > 0) stack.push(q - 1);
    if (x < MASK - 1) stack.push(q + 1);
    if (y > 0) stack.push(q - MASK);
    if (y < MASK - 1) stack.push(q + MASK);
  }
  const out = new Uint8Array(mask.length);
  for (let p = 0; p < mask.length; p++) out[p] = mask[p] || !outside[p] ? 1 : 0;
  return out;
}

/* ------------------------------------------------------------------ *
 * 2. Read the animal's real palette off the masked pixels
 *
 * k-means in RGB over the subject only, then the clusters are assigned to
 * body parts by where their pixels sit: the darkest cluster tends to be legs
 * and eyes, the largest is the body, and a cluster that is both saturated and
 * rare is a marking worth keeping.
 * ------------------------------------------------------------------ */
function palette(seg, k = 5) {
  const pts = [];
  for (let p = 0; p < seg.mask.length; p++) {
    if (!seg.mask[p]) continue;
    const i = p * 3;
    pts.push([seg.raw[i], seg.raw[i + 1], seg.raw[i + 2], (p % MASK), (p / MASK) | 0]);
  }
  if (pts.length < 40) return null;

  // k-means++ style spread of initial centres, then a few Lloyd iterations
  const centres = [pts[(Math.random() * pts.length) | 0].slice(0, 3)];
  while (centres.length < k) {
    let far = null, farD = -1;
    for (let t = 0; t < 240; t++) {
      const c = pts[(Math.random() * pts.length) | 0];
      let d = Infinity;
      for (const q of centres) d = Math.min(d, (c[0] - q[0]) ** 2 + (c[1] - q[1]) ** 2 + (c[2] - q[2]) ** 2);
      if (d > farD) { farD = d; far = c.slice(0, 3); }
    }
    centres.push(far);
  }
  let assign = new Int32Array(pts.length);
  for (let it = 0; it < 12; it++) {
    for (let p = 0; p < pts.length; p++) {
      let bi = 0, bd = Infinity;
      for (let c = 0; c < centres.length; c++) {
        const d = (pts[p][0] - centres[c][0]) ** 2 + (pts[p][1] - centres[c][1]) ** 2 + (pts[p][2] - centres[c][2]) ** 2;
        if (d < bd) { bd = d; bi = c; }
      }
      assign[p] = bi;
    }
    const sums = centres.map(() => [0, 0, 0, 0]);
    for (let p = 0; p < pts.length; p++) {
      const s = sums[assign[p]];
      s[0] += pts[p][0]; s[1] += pts[p][1]; s[2] += pts[p][2]; s[3]++;
    }
    for (let c = 0; c < centres.length; c++) {
      if (sums[c][3]) centres[c] = [sums[c][0] / sums[c][3], sums[c][1] / sums[c][3], sums[c][2] / sums[c][3]];
    }
  }
  const stats = centres.map((c, i) => {
    let n = 0;
    for (let p = 0; p < pts.length; p++) if (assign[p] === i) n++;
    const lum = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
    const mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]);
    return { rgb: c.map(v => Math.round(v)), share: n / pts.length, lum, sat: mx ? (mx - mn) / mx : 0 };
  }).sort((a, b) => b.share - a.share);
  return stats;
}

/* ------------------------------------------------------------------ *
 * 2b. Grade the model's palette onto the animal's real one
 *
 * Not a per-part colour swap — that throws away hand-tuned relationships and
 * usually makes things worse. Instead the whole palette is shifted and scaled
 * so its mean and spread match the masked photo pixels, the way a colour grade
 * works: the German cockroach keeps its pale shield and dark stripes, but the
 * overall hue and tone become the ones in the photograph.
 *
 * Diagnostic markings live in spec.markings and are never touched here — the
 * redback's red stripe is an identification feature, not a lighting condition.
 * ------------------------------------------------------------------ */
const GRADE_KEYS = ['body', 'abdomen', 'thorax', 'pronotum', 'head', 'leg', 'antenna', 'wing'];

function photoStats(seg) {
  let n = 0;
  const mean = [0, 0, 0];
  for (let p = 0; p < seg.mask.length; p++) {
    if (!seg.mask[p]) continue;
    const i = p * 3;
    mean[0] += seg.raw[i]; mean[1] += seg.raw[i + 1]; mean[2] += seg.raw[i + 2];
    n++;
  }
  if (!n) return null;
  mean[0] /= n; mean[1] /= n; mean[2] /= n;
  const va = [0, 0, 0];
  for (let p = 0; p < seg.mask.length; p++) {
    if (!seg.mask[p]) continue;
    const i = p * 3;
    va[0] += (seg.raw[i] - mean[0]) ** 2;
    va[1] += (seg.raw[i + 1] - mean[1]) ** 2;
    va[2] += (seg.raw[i + 2] - mean[2]) ** 2;
  }
  return { mean, std: va.map(v => Math.sqrt(v / n)), n };
}

function hueOf(c) {
  const r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d < 1e-6) return null;                       // grey has no hue
  let h;
  if (mx === r) h = ((g - b) / d) % 6;
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return (h + 360) % 360;
}
function chromaOf(c) {
  const mx = Math.max(...c), mn = Math.min(...c);
  return mx ? (mx - mn) / mx : 0;
}
function hueGap(a, b) {
  if (a === null || b === null) return 0;
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Decide whether a graded palette can be trusted.
 *
 * The hand-set colours encode what the species actually is: a European wasp is
 * yellow, a redback is black. A photograph is one animal under one light on one
 * background, and when segmentation leaks — a wasp on a green lid, an ant on a
 * leaf — the grade will happily reassign the hue and destroy the identification.
 *
 * So the photo is allowed to refine tone and shade, and not allowed to change
 * what colour the animal is. Hue moves beyond a quarter-turn, or chroma
 * collapsing, means the measurement is wrong rather than the species.
 */
function gradeTrustworthy(before, after) {
  const reasons = [];
  // every graded key, not just the body: a wasp whose antennae come out blue
  // is just as wrong as one whose abdomen does, and the eye goes to the error
  for (const k of GRADE_KEYS) {
    if (!Array.isArray(before[k]) || !Array.isArray(after[k])) continue;
    const gap = hueGap(hueOf(before[k]), hueOf(after[k]));
    if (gap > 22) reasons.push(`${k} hue moved ${gap.toFixed(0)}°`);
    const cb = chromaOf(before[k]), ca = chromaOf(after[k]);
    if (cb > 0.25 && ca < cb * 0.55) {
      reasons.push(`${k} lost ${((1 - ca / cb) * 100).toFixed(0)}% of its colour`);
    }
  }
  return reasons;
}

function gradePalette(colors, stats) {
  const keys = GRADE_KEYS.filter(k => Array.isArray(colors[k]));
  if (!keys.length || !stats) return null;

  const mean = [0, 0, 0];
  for (const k of keys) for (let c = 0; c < 3; c++) mean[c] += colors[k][c] / keys.length;
  const std = [0, 0, 0];
  for (const k of keys) for (let c = 0; c < 3; c++) std[c] += (colors[k][c] - mean[c]) ** 2;
  for (let c = 0; c < 3; c++) std[c] = Math.sqrt(std[c] / keys.length) || 1;

  // Take the colour, not the exposure. A photo shot in shade is dark because
  // of the light that day, not because the animal is dark, and the renderer
  // applies its own lighting on top — transferring raw photo luminance would
  // darken everything twice. So the photo mean is rescaled to sit at the
  // model's existing brightness first, and only hue and relative spread move.
  const lum = c => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  const target = stats.mean.slice();
  if (!KEEP_EXPOSURE) {
    const k = lum(mean) / (lum(stats.mean) || 1);
    for (let c = 0; c < 3; c++) target[c] = Math.min(255, stats.mean[c] * k);
  }

  // clamp the stretch: a photo of a shadowed animal should not flatten the model
  const gain = std.map((sd, c) => Math.max(0.55, Math.min(1.7, stats.std[c] / sd)));

  const out = {};
  for (const k of Object.keys(colors)) {
    const v = colors[k];
    if (!Array.isArray(v)) { out[k] = v; continue; }
    if (!keys.includes(k)) { out[k] = v.slice(); continue; }   // eyes, nose, tail keep their own colour
    out[k] = v.map((ch, c) =>
      Math.round(Math.max(0, Math.min(255, target[c] + (ch - mean[c]) * gain[c])))
    );
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 3. Render a candidate and score it against the photo silhouette
 * ------------------------------------------------------------------ */
async function makeRenderer() {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: MASK * 2, height: MASK * 2 } });
  page.on('pageerror', e => console.error('page error:', e.message));
  const html = `<!doctype html><meta charset=utf-8><style>html,body{margin:0;background:#000}
    canvas{display:block}</style><canvas id=c></canvas>
    <script src="${path.join(REPO, 'src/core3d.js')}"></script>
    <script src="${path.join(REPO, 'src/anatomy.js')}"></script>
    <script>
      window.R = new BB.Renderer(document.getElementById('c'), {
        tilt: 0.42, fov: 2.9, fovY: 0.92, ambient: 1.6, key: 0, fillI: 0, rimI: 0, exposure: 1
      });
      R.resize(${MASK}, ${MASK}, 2);
      window.silhouette = function (spec, spin) {
        const m = BB.anatomy.build(spec);
        m.scale = (spec.fit || 1) * (2.4 / (m.span || 2.4));
        R.shadow = false;
        R.setModel(m);
        R.render(spin, 0);
        return document.getElementById('c').toDataURL('image/png');
      };
    </script>`;
  const file = path.join(OUT, '.fit-render.html');
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(file, html);
  await page.goto('file://' + file);
  await page.waitForFunction(() => !!window.silhouette, { timeout: 20000 });
  return {
    page,
    async mask(spec, spin) {
      const url = await page.evaluate(([s, sp]) => window.silhouette(s, sp), [spec, spin]);
      const buf = Buffer.from(url.split(',')[1], 'base64');
      const { data } = await sharp(buf).resize(MASK, MASK, { fit: 'fill' }).greyscale().raw()
        .toBuffer({ resolveWithObject: true });
      const out = new Uint8Array(MASK * MASK);
      for (let p = 0; p < out.length; p++) out[p] = data[p] > 24 ? 1 : 0;
      return out;
    },
    close: () => browser.close()
  };
}

/** Overlap of two masks after normalising each to its own bounding box. */
function iou(a, b) {
  const A = normalise(a), B = normalise(b);
  let inter = 0, union = 0;
  for (let p = 0; p < A.length; p++) {
    if (A[p] && B[p]) inter++;
    if (A[p] || B[p]) union++;
  }
  return union ? inter / union : 0;
}

function normalise(mask) {
  let minX = MASK, minY = MASK, maxX = -1, maxY = -1;
  for (let p = 0; p < mask.length; p++) {
    if (!mask[p]) continue;
    const x = p % MASK, y = (p / MASK) | 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (maxX < 0) return mask;
  const w = maxX - minX + 1, h = maxY - minY + 1;
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < MASK; y++) {
    for (let x = 0; x < MASK; x++) {
      const sx = minX + Math.floor(x / MASK * w);
      const sy = minY + Math.floor(y / MASK * h);
      out[y * MASK + x] = mask[sy * MASK + sx];
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 4. The search: hill-climb a handful of proportion knobs
 * ------------------------------------------------------------------ */
const KNOBS = [
  ['abdomenW', 0.6, 1.5], ['abdomenH', 0.6, 1.6], ['abdomenL', 0.7, 1.4],
  ['thoraxW', 0.7, 1.4], ['headW', 0.7, 1.5], ['headL', 0.7, 1.5],
  ['stand', 0.5, 1.8]
];

function tweak(spec, key, factor) {
  const out = JSON.parse(JSON.stringify(spec));
  out.colors = spec.colors;
  out.markings = spec.markings;
  if (out[key] === undefined) return null;
  out[key] = out[key] * factor;
  return out;
}

async function fitShape(renderer, spec, target, iterations) {
  const spins = [0, Math.PI * 0.5, Math.PI]; // front, side, back — one view is not enough
  async function score(s) {
    let total = 0;
    for (const sp of spins) total += iou(await renderer.mask(s, sp), target);
    return total / spins.length;
  }
  let best = JSON.parse(JSON.stringify(spec));
  best.colors = spec.colors; best.markings = spec.markings;
  let bestScore = await score(best);
  const start = bestScore;

  let step = 0.16;
  for (let i = 0; i < iterations; i++) {
    const [key] = KNOBS[i % KNOBS.length];
    const dir = Math.random() < 0.5 ? 1 + step : 1 - step;
    const cand = tweak(best, key, dir);
    if (!cand) continue;
    const [, lo, hi] = KNOBS.find(k => k[0] === key);
    const ratio = cand[key] / spec[key];
    if (ratio < lo || ratio > hi) continue;
    const s = await score(cand);
    if (s > bestScore) { bestScore = s; best = cand; }
    if (i % KNOBS.length === KNOBS.length - 1) step = Math.max(0.02, step * 0.9);
  }
  return { spec: best, start, best: bestScore };
}

/* ------------------------------------------------------------------ *
 * main
 * ------------------------------------------------------------------ */
const manifestFile = path.join(PHOTOS, 'manifest.json');
if (!fs.existsSync(manifestFile)) {
  console.error('No photographs yet — run tools/fetch-photos.mjs first.');
  process.exit(1);
}
const photos = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const byPest = {};
for (const p of photos) (byPest[p.pest] = byPest[p.pest] || []).push(p);

const pestsSrc = fs.readFileSync(path.join(REPO, 'src', 'pests.js'), 'utf8');
const stub = { window: {} };
new Function('window', fs.readFileSync(path.join(REPO, 'src', 'brand.js'), 'utf8'))(stub.window);
new Function('window', pestsSrc)(stub.window);
const PESTS = stub.window.BB.PESTS;

const targets = arg('all', false)
  ? Object.keys(byPest)
  : [process.argv.find(a => !a.startsWith('--') && !a.endsWith('.mjs') && !a.includes('/'))].filter(Boolean);

if (!targets.length) {
  console.error('Usage: node tools/fit-specimen.mjs <pest-id> [--all] [--write] [--iterations=N]');
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });
const renderer = await makeRenderer();
const report = [];

for (const id of targets) {
  const pest = PESTS.find(p => p.id === id);
  if (!pest) { console.error('unknown pest: ' + id); continue; }
  if (!byPest[id]) { console.error(id + ': no photograph on file, skipping'); continue; }

  const file = path.join(PHOTOS, byPest[id][0].file);
  const seg = await segment(file);
  const pal = palette(seg);
  const stats = photoStats(seg);

  if (DEBUG) {
    const png = Buffer.alloc(MASK * MASK * 3);
    for (let p = 0; p < seg.mask.length; p++) {
      png[p * 3] = seg.mask[p] ? 255 : 0;
      png[p * 3 + 1] = seg.mask[p] ? 255 : 0;
      png[p * 3 + 2] = seg.mask[p] ? 255 : 0;
    }
    await sharp(png, { raw: { width: MASK, height: MASK, channels: 3 } })
      .png().toFile(path.join(OUT, id + '-mask.png'));
  }

  // a mask covering almost everything or almost nothing means segmentation
  // failed on a busy background — say so rather than fitting to noise
  const usable = seg.area > 0.04 && seg.area < 0.72;
  let shape = null;
  if (usable) shape = await fitShape(renderer, pest.spec, seg.mask, ITER);

  let graded = usable ? gradePalette(pest.spec.colors, stats) : null;
  let rejected = null;
  if (graded) {
    const reasons = gradeTrustworthy(pest.spec.colors, graded);
    if (reasons.length) { rejected = reasons; graded = null; }
  }
  report.push({ id, area: seg.area, usable, palette: pal, shape, colors: graded, rejected });
  const line = usable
    ? `${id.padEnd(24)} silhouette IoU ${shape.start.toFixed(3)} → ${shape.best.toFixed(3)}` +
      `  (+${((shape.best - shape.start) * 100).toFixed(1)} pts)`
    : `${id.padEnd(24)} segmentation unusable (subject ${(seg.area * 100).toFixed(0)}% of frame) — skipped`;
  console.log(line);
  if (pal) {
    console.log('  photo palette: ' + pal.slice(0, 4)
      .map(c => `rgb(${c.rgb.join(',')}) ${(c.share * 100).toFixed(0)}%`).join('  '));
  }
  if (graded) {
    const shown = Object.keys(graded).filter(k => GRADE_KEYS.includes(k)).slice(0, 3);
    console.log('  ACCEPTED  ' + shown.map(k =>
      `${k} ${pest.spec.colors[k].join(',')} → ${graded[k].join(',')}`).join('  |  '));
  } else if (rejected) {
    console.log('  rejected  ' + rejected.join('; ') + ' — the photograph is not measuring the animal');
  }
}

await renderer.close();

fs.writeFileSync(path.join(OUT, 'fit-report.json'), JSON.stringify(report, null, 2));
console.log('\nwrote assets/fits/fit-report.json');

function specRegion(src, id) {
  const start = src.indexOf(`id: '${id}'`);
  if (start < 0) return null;
  let end = src.indexOf("id: '", start + 10);
  if (end < 0) end = src.length;
  return { start, end };
}

if (WRITE) {
  let src = pestsSrc;
  let changed = 0;

  // colours first — the reliable half of the measurement
  if (!arg('no-colour', false)) {
    for (const r of report) {
      if (!r.colors) continue;
      const reg = specRegion(src, r.id);
      if (!reg) continue;
      let region = src.slice(reg.start, reg.end);
      const pest = PESTS.find(p => p.id === r.id);
      for (const k of GRADE_KEYS) {
        const before = pest.spec.colors[k];
        const after = r.colors[k];
        if (!Array.isArray(before) || !Array.isArray(after)) continue;
        if (before.every((v, i) => v === after[i])) continue;
        const re = new RegExp('(' + k + ': )\\[\\s*' + before.join(',\\s*') + '\\s*\\]');
        if (!re.test(region)) continue;
        region = region.replace(re, `$1[${after.join(', ')}]`);
        changed++;
      }
      src = src.slice(0, reg.start) + region + src.slice(reg.end);
    }
  }

  for (const r of report) {
    if (!r.shape || r.shape.best - r.shape.start < 0.01) continue;
    if (arg('no-shape', false)) continue;
    const pest = PESTS.find(p => p.id === r.id);
    const reg = specRegion(src, r.id);
    if (!reg) continue;
    let region = src.slice(reg.start, reg.end);
    for (const [key] of KNOBS) {
      if (pest.spec[key] === undefined || r.shape.spec[key] === undefined) continue;
      const before = pest.spec[key], after = +r.shape.spec[key].toFixed(4);
      if (Math.abs(before - after) < 1e-6) continue;
      const re = new RegExp('(' + key + ': )(-?[\\d.]+)');
      if (!re.test(region)) continue;
      region = region.replace(re, `$1${after}`);
      changed++;
    }
    src = src.slice(0, reg.start) + region + src.slice(reg.end);
  }
  fs.writeFileSync(path.join(REPO, 'src', 'pests.js'), src);
  console.log(`applied ${changed} fitted value(s) to src/pests.js`);
} else {
  console.log('(dry run — pass --write to apply the fitted proportions)');
}
