# Real 3D models go here

Drop a `.glb` in this folder and point a species at it in `src/pests.js`:

```js
model: { file: 'german-cockroach.glb', faces: 6500, yaw: 0, fit: 1 }
```

The dossier shows the generated specimen immediately and swaps in the real
model when the file loads, so a missing or slow model never leaves a blank
stage — it just falls back. The HUD label changes from `LIVE SPECIMEN SCAN`
to `SCANNED SPECIMEN` when a real one is in use.

Options: `faces` (decimation budget, default 6500) · `yaw` `pitch` `roll`
(radians, for a model exported facing the wrong way) · `upAxis: 'z'` (for
Blender/3ds exports) · `fit` (size multiplier) · `gloss`.

Check the loader still works: `node tools/check-glb.mjs`

## Where to get them

**Photogrammetry of your own specimen — best result, costs nothing but time.**
You have the specimens. Put one on a turntable, take 60–100 photos all the way
around at two or three heights, run them through Meshroom (free) or RealityScan
(free). This is how museums scan insects. It is your animal, your image, no
licence questions, and nothing else looks as convincing.

**AI image-to-3D — fastest, works from a handful of photos.** Meshy, Tripo3D,
Rodin and Hunyuan3D turn one to four photographs into a textured mesh in about
a minute, free tiers included. Watch the known weakness: thin structures.
Legs, antennae and wings come out fused or melted far more often than not, so
check the model from every angle before committing to it.

**Buy one.** TurboSquid and CGTrader have properly built insect models for
roughly $20–80 with a commercial licence. Cheapest route to one good hero.

## Licensing

A model generated from someone else's photograph is a derivative of that
photograph. If the source was CC BY, the photographer's credit follows the
model. Your own photos have no such string attached — another reason to shoot
your own specimens.

`.glb` files are not committed to this repository (they are large binaries);
`build.js` copies whatever is here into `dist/models/`.
