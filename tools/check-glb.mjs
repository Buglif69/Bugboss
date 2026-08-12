/*
 * tools/check-glb.mjs — prove the real-model path still works.
 *
 *   node tools/check-glb.mjs
 *
 * Downloads a known-good glTF sample, loads it through src/glb.js in a real
 * browser, and reports triangle count, load time and frame cost. No fixture is
 * committed — the test fetches what it needs and throws it away.
 *
 * If this passes, dropping your own .glb into assets/models/ will work.
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SAMPLE = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'glbcheck-'));
const file = path.join(tmp, 'sample.glb');

process.stdout.write('fetching a sample model ... ');
const res = await fetch(SAMPLE);
if (!res.ok) {
  console.error('failed (HTTP ' + res.status + ')');
  console.error('No network to the sample host. Drop any .glb at ' + file + ' and re-run.');
  process.exit(1);
}
fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
console.log((fs.statSync(file).size / 1024).toFixed(0) + ' KB');

const page = `<!doctype html><meta charset=utf-8><canvas id=c></canvas>
<script src="${path.join(REPO, 'src/core3d.js')}"></script>
<script src="${path.join(REPO, 'src/glb.js')}"></script>
<script>
(async () => {
  const r = new BB.Renderer(document.getElementById('c'), { tilt: 0.4 });
  r.resize(800, 600, 1);
  const t0 = performance.now();
  const m = await BB.loadModelFile('file://${file}', { faces: 6500 });
  const load = performance.now() - t0;
  m.scale = 2.4 / (m.span || 2.4);
  r.setModel(m);
  const t1 = performance.now();
  for (let i = 0; i < 20; i++) r.render(i * 0.1, 0);
  window.RESULT = { faces: m.faces, loadMs: Math.round(load),
                    frameMs: +((performance.now() - t1) / 20).toFixed(1) };
  window.DONE = 1;
})().catch(e => { window.ERR = e.message; window.DONE = 1; });
</script>`;
const pageFile = path.join(tmp, 'check.html');
fs.writeFileSync(pageFile, page);

const browser = await chromium.launch({ executablePath: EXE, args: ['--allow-file-access-from-files'] });
const p = await browser.newPage({ viewport: { width: 800, height: 600 } });
p.on('pageerror', e => console.error('page error:', e.message));
await p.goto('file://' + pageFile);
await p.waitForFunction(() => window.DONE === 1, { timeout: 40000 });
const err = await p.evaluate(() => window.ERR);
const result = await p.evaluate(() => window.RESULT);
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });

if (err) {
  console.error('FAILED —', err);
  process.exit(1);
}
console.log(`loaded and rendered: ${result.faces} triangles after decimation, ` +
  `${result.loadMs} ms to load, ${result.frameMs} ms a frame`);
console.log('real-model path OK');
