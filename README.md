# Bugboss — Pest Dossier Engine

The assassin-movie target dossier, for pests.

A specimen rotates in 3D on the left. Down the right, a terminal types out the
file on it — species, common name, threat level, what it's guilty of, how it
operates, what evidence it leaves, where it hides, and how it gets treated —
with the clatter of the keys under it.

Built for **Slug-A-Bug Pest Control** (Brisbane & Gold Coast). One codebase
serves three jobs:

| Job | What you use |
|---|---|
| **Website** | `dist/index.html` (gallery) and `dist/pest-dossier.html` (embed in an iframe) |
| **Social posts / UGC ads** | `node tools/record.mjs` → an MP4 with sound, sized for Reels, TikTok, Shorts or Meta Ads |
| **In person / on the tools** | Open the same page on a phone or tablet and hand it to the customer |

No 3D files, no stock footage, no CDN, no licensing. Every specimen is
generated from numbers, every sound is synthesised in the browser, and the
whole thing ships as a single 105 KB HTML file that works offline.

---

## The eight specimens

German cockroach · American cockroach · subterranean termite (soldier) ·
black house ant · redback spider · bed bug · roof rat · paper wasp

Each one carries its own dossier copy, written for South-East Queensland
conditions, and its own body-plan numbers.

## Quick start

```bash
npm install          # only needed for the video recorder
node build.js        # writes dist/
```

Then open `dist/index.html` in a browser. During development, open
`index.html` or `dossier.html` from the repo root — they load `src/` directly,
so there is no build step in the loop.

## Putting it on the website

1. Upload `dist/pest-dossier.html` (and `dist/index.html` if you want the
   gallery page) anywhere on the site — the root, or the WordPress Media
   Library.
2. Drop a **Custom HTML** block where you want it:

```html
<iframe src="/pest-dossier.html?pest=german-cockroach"
        style="width:100%;aspect-ratio:16/9;border:0"
        loading="lazy" title="German cockroach dossier"></iframe>
```

`dist/embed-snippets.html` has the copy-paste snippet for every pest plus the
vertical and random-specimen variants.

### URL parameters

| Parameter | Values | Notes |
|---|---|---|
| `pest` | any id, or `random` | see `dist/pest-ids.json` |
| `format` | `web` · `reel` · `square` · `wide` | 16:9, 9:16, 1:1, 16:9 |
| `speed` | e.g. `1.4` | typing speed multiplier |
| `items` | e.g. `3` | lines per section — fewer for reels |
| `chrome` | `0` | hide the picker and buttons |
| `cta` | `0` | hide the booking panel |
| `loop` | `1` | restart when it finishes |
| `hold` | `1` | build, but wait for `BBStage.play()` (used by the recorder) |

Sound is off until the visitor's first tap. That is a browser rule, not a
setting — no page anywhere can start audio before someone interacts with it.

## Making videos

```bash
npx playwright install chromium          # once
node tools/record.mjs --pest=redback-spider --format=reel
node tools/record.mjs --all --format=reel        # every specimen
```

Writes `dist/video/<pest>-<format>.mp4` — H.264 + AAC, 30 fps, with the
terminal audio captured straight off the Web Audio graph. 1080×1920 for
`reel`, 1080×1080 for `square`, 1920×1080 for `wide`.

Options: `--speed=1.3` `--items=3` `--hold=3` (seconds on the end card)
`--silent` `--out=some/dir`.

A reel runs about 26 seconds. Post it as-is, or drop it into your editor and
cut a talking-head intro in front of it.

## Adding a pest

Everything about a species lives in one object in `src/pests.js`: the dossier
copy and the body-plan numbers that generate the 3D model. Copy the closest
existing entry, change the numbers, run `node build.js`. Nothing else in the
system needs to know.

To check the shape, `node tools/shoot.mjs <pest-id>` renders a nine-angle
contact sheet to `.shots/` — much faster than watching the animation.

To change phone numbers, licences, the booking link or the call-to-action
wording, edit `src/brand.js`. It is the only place those strings exist.

## How it works

| File | Job |
|---|---|
| `src/core3d.js` | The 3D engine: matrices, mesh primitives, and a painter's-algorithm renderer on canvas 2D. Smooth vertex normals, per-face colour and alpha, weak perspective, ground shadow. ~500 lines, no dependencies. |
| `src/anatomy.js` | Three body plans — insect, arachnid, rodent — assembled from ellipsoids and swept tubes. Species markings (pronotum stripes, wasp bands, the redback's blaze) are colour functions evaluated per face. |
| `src/pests.js` | The database: dossier copy plus body-plan numbers. |
| `src/sfx.js` | Every sound, synthesised: key clicks, scan sweep, stamp, alarm, and the low drone under it all. |
| `src/dossier.js` | The sequence — boot, scan, lock, identity, threat meter, sections, call to action — plus formats, drag-to-rotate and skip. |
| `src/gallery.js` | The index page of specimens. |
| `build.js` | Inlines everything into self-contained HTML. Concatenation is the whole build. |
| `tools/` | Dev and export tools: `shoot.mjs` (contact sheets), `preview.mjs` (screenshots + frame times), `record.mjs` (MP4). |

Why canvas 2D and not three.js: the output has to survive being pasted into
WordPress, opened offline, and rendered by a headless recorder. A dependency-
free file does all three; 600 KB of WebGL library for eight bugs does not.

## Honest limits

- The specimens are **stylised, not scientific illustration**. They are built
  to be recognisable at a glance and to look good turning — a technician can
  tell a German from an American cockroach in these, but do not use them as
  an identification key.
- The dossier copy is marketing copy grounded in the biology. Check anything
  you plan to put a number on in an ad.
- Older phones will render the turntable closer to 30 fps than 60. It stays
  smooth; it is not free.
