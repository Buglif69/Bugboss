/*
 * build.js — bundle the source into self-contained HTML files.
 *
 *   node build.js
 *
 * Produces, in dist/:
 *   pest-dossier.html        the whole thing in one file — upload it anywhere,
 *                            works offline, no CDN, no build step on the host
 *   pests/<id>.html          same file with one specimen baked in as default
 *   embed-snippets.html      copy-paste iframe code for the website
 *   pest-ids.json            id list, used by tools/record.mjs --all
 *
 * There is no minifier and no dependency: concatenation is the whole build.
 * Anyone who can open a text editor can maintain this.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const SCRIPTS = ['core3d.js', 'anatomy.js', 'brand.js', 'pests.js', 'photos.js', 'sfx.js', 'dossier.js'];
// the gallery bundle carries the dossier too, so index.html is one
// self-contained file with no iframe to another URL
const GALLERY_SCRIPTS = ['core3d.js', 'anatomy.js', 'brand.js', 'pests.js', 'photos.js', 'sfx.js', 'dossier.js', 'gallery.js'];

const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const bundle = list => list.map(f => `/* ---- ${f} ---- */\n${read(f)}`).join('\n');
const css = read('styles.css');

/* The photographs go in as data URIs: the whole point of the distribution is
 * one file that works with no server, no CDN and no broken image icons. */
function photoData(onlyPest) {
  const dir = path.join(ROOT, 'assets', 'photos');
  const mf = path.join(dir, 'manifest.json');
  if (!fs.existsSync(mf)) {
    if (!photoData.warned) {
      console.warn('! no assets/photos/manifest.json — run tools/fetch-photos.mjs for the real photos');
      photoData.warned = true;
    }
    return '';
  }
  const list = JSON.parse(fs.readFileSync(mf, 'utf8')).filter(m => !onlyPest || m.pest === onlyPest);
  const out = {};
  let bytes = 0;
  for (const m of list) {
    const f = path.join(dir, m.file);
    if (!fs.existsSync(f)) continue;
    const b = fs.readFileSync(f);
    bytes += b.length;
    out[m.file] = 'data:image/jpeg;base64,' + b.toString('base64');
  }
  if (!onlyPest) {
    photoData.count = Object.keys(out).length;
    photoData.kb = Math.round(bytes / 1024);
  }
  return `\n/* ---- inlined field photographs ---- */\nwindow.BB.PHOTO_DATA = ${JSON.stringify(out)};\n`;
}

const js = bundle(SCRIPTS);

function page(opts) {
  const boot = opts.pest
    ? `BB.mountDossier('#bb-mount', { pest: qsPest() || ${JSON.stringify(opts.pest)} });`
    : `BB.mountDossier('#bb-mount');`;
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="${opts.index ? 'index,follow' : 'noindex'}">
<title>${opts.title}</title>
<meta name="description" content="${opts.desc}">
<style>
${css}
</style>
</head>
<body>
<div id="bb-mount" style="width:100%;height:100%"></div>
<script>
${js}${photoData(opts.pest)}
</script>
<script>
function qsPest() {
  var m = /[?&]pest=([\\w-]+)/.exec(location.search);
  return m ? m[1] : null;
}

${boot}
</script>
</body>
</html>
`;
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'pests'), { recursive: true });

// the pest list, read straight out of the source of truth
const stub = { window: {} };
new Function('window', read('brand.js'))(stub.window);
new Function('window', read('pests.js'))(stub.window);
const PESTS = stub.window.BB.PESTS;
const BRAND = stub.window.BB.BRAND;

fs.writeFileSync(path.join(DIST, 'pest-dossier.html'), page({
  title: 'Pest Dossier — ' + BRAND.company,
  desc: 'Rotating 3D pest specimens with a full identification dossier: habits, evidence and treatment. ' + BRAND.company + ', ' + BRAND.area + '.'
}));

for (const p of PESTS) {
  fs.writeFileSync(path.join(DIST, 'pests', p.id + '.html'), page({
    pest: p.id,
    index: true,
    title: p.name + ' — ID, Habits & Treatment | ' + BRAND.company,
    desc: `What a ${p.name.toLowerCase()} (${p.sci}) looks like in 3D, how to identify it, where it hides and how ${BRAND.company} treats it in ${BRAND.area}.`
  }));
}

fs.writeFileSync(path.join(DIST, 'pest-ids.json'), JSON.stringify(PESTS.map(p => p.id), null, 2));

/* The photographs as loose files too — handy for social posts and print, and
 * required reading for anyone reusing them, since the credits travel with. */
const photoDir = path.join(ROOT, 'assets', 'photos');
if (fs.existsSync(path.join(photoDir, 'manifest.json'))) {
  const list = JSON.parse(fs.readFileSync(path.join(photoDir, 'manifest.json'), 'utf8'));
  fs.mkdirSync(path.join(DIST, 'photos'), { recursive: true });
  for (const m of list) {
    const from = path.join(photoDir, m.file);
    if (fs.existsSync(from)) fs.copyFileSync(from, path.join(DIST, 'photos', m.file));
  }
  const credits = list.map(m =>
    `${m.file}\n  ${PESTS.find(p => p.id === m.pest)?.name || m.pest}\n  Photo: ${m.credit} — ${m.licence} — via ${m.source}\n  ${m.url}`
  ).join('\n\n');
  fs.writeFileSync(path.join(DIST, 'photos', 'CREDITS.txt'),
    'Field photographs used in the Pest Dossier\n' +
    '=========================================\n\n' +
    'These images are other people\'s work, reused under Creative Commons.\n' +
    'The licence requires the photographer credit to stay with the image\n' +
    'wherever it appears — including on social posts and in print.\n\n' +
    credits + '\n');
}

/* ------------------------------------------------------------------ *
 * index.html — the gallery that fronts the dossiers
 * ------------------------------------------------------------------ */
fs.writeFileSync(path.join(DIST, 'index.html'), `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pest Identification Files — ${BRAND.company}</title>
<meta name="description" content="Spin a 3D specimen and read the full file on the pests we treat across ${BRAND.area} — how to identify them, where they hide, and how they get treated.">
<style>
${css}
${read('gallery.css')}
html, body { height: auto; min-height: 100%; }
</style>
</head>
<body>
<div class="gal" id="gal"></div>
<script>
${bundle(GALLERY_SCRIPTS)}${photoData()}
</script>
<script>
BB.mountGallery('#gal');
</script>
</body>
</html>
`);

/* ------------------------------------------------------------------ *
 * A copy-paste sheet, so putting this on the website is a 60-second job
 * ------------------------------------------------------------------ */
const rows = PESTS.map(p => `
  <tr>
    <td>${p.name}</td>
    <td><code>&lt;iframe src="/pest-dossier.html?pest=${p.id}" style="width:100%;aspect-ratio:16/9;border:0" loading="lazy" title="${p.name} dossier"&gt;&lt;/iframe&gt;</code></td>
  </tr>`).join('');

fs.writeFileSync(path.join(DIST, 'embed-snippets.html'), `<!doctype html>
<meta charset="utf-8">
<title>Pest Dossier — embed snippets</title>
<style>
  body { font: 15px/1.6 Arial, Helvetica, sans-serif; margin: 32px auto; max-width: 980px; color: #150404; }
  h1 { font-family: "Arial Black", Arial, sans-serif; }
  code { background: #f4f0ef; padding: 2px 5px; font-size: 12.5px; display: block; overflow-x: auto; }
  td { vertical-align: top; padding: 7px 10px; border-bottom: 1px solid #eee; }
  .note { background: #fff5f5; border-left: 4px solid #ee1c24; padding: 12px 16px; }
</style>
<h1>Pest Dossier — embed snippets</h1>
<p class="note">Upload <b>pest-dossier.html</b> to the site root (or Media Library), then paste one of these
into a WordPress <b>Custom HTML</b> block. Sound starts muted and switches on at the visitor's first tap,
which is what every browser requires.</p>
<h2>Per pest (16:9)</h2>
<table>${rows}</table>
<h2>Vertical, for a mobile-first page</h2>
<code>&lt;iframe src="/pest-dossier.html?pest=german-cockroach&amp;format=reel" style="width:100%;max-width:420px;aspect-ratio:9/16;border:0" loading="lazy" title="German cockroach dossier"&gt;&lt;/iframe&gt;</code>
<h2>Random specimen each load — good for a home page</h2>
<code>&lt;iframe src="/pest-dossier.html?pest=random" style="width:100%;aspect-ratio:16/9;border:0" loading="lazy" title="Pest dossier"&gt;&lt;/iframe&gt;</code>
<h2>Clean version for screen recording (no buttons)</h2>
<code>/pest-dossier.html?pest=redback-spider&amp;format=reel&amp;chrome=0&amp;speed=1.2&amp;items=3</code>
<h2>Parameters</h2>
<ul>
  <li><code>pest</code> — ${PESTS.map(p => p.id).join(', ')}, or <code>random</code></li>
  <li><code>format</code> — web (16:9), reel (9:16), square (1:1), wide</li>
  <li><code>speed</code> — typing speed multiplier, e.g. 1.4</li>
  <li><code>items</code> — how many lines per section (3 for reels, 5 for the site)</li>
  <li><code>chrome=0</code> — hide the picker and buttons</li>
  <li><code>cta=0</code> — hide the booking panel</li>
  <li><code>loop=1</code> — restart automatically</li>
</ul>
`);

console.log('dist/index.html');
console.log('dist/pest-dossier.html');
for (const p of PESTS) console.log('dist/pests/' + p.id + '.html');
console.log('dist/photos/  (' + (photoData.count || 0) + ' images + CREDITS.txt)');
console.log('dist/embed-snippets.html');
console.log('dist/pest-ids.json');
const kb = (fs.statSync(path.join(DIST, 'pest-dossier.html')).size / 1024).toFixed(0);
console.log(`\n${PESTS.length} species · ${photoData.count || 0} field photos inlined (${photoData.kb || 0} KB)`);
console.log(`single-file size: ${kb} KB (no external requests)`);
