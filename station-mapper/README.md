# Slug-A-Bug Station Mapper (Phase 1 prototype)

Offline-first PWA for marking up rodent and Trelona termite stations on a site base map
and exporting a branded, record-quality PDF for manual import into ServiceM8.

No backend, no login, no ServiceM8 API — everything autosaves locally in the browser
(IndexedDB), so work survives refreshes and offline use.

## Run locally

```bash
cd station-mapper
npm install
npm run dev      # http://localhost:5173
```

Production build (for Netlify): `npm run build` → deploy the `dist/` folder.
Netlify settings: base directory `station-mapper`, build command `npm run build`,
publish directory `station-mapper/dist`.

## Using it

1. **Site list** — open the seeded Construction Training Centre site, or hit
   **New site** and upload a PNG / JPG / SVG base map.
2. **Map editor** — pick the layer (Rodent = red square, Trelona = teal circle),
   leave **Place ON** and click the map to drop numbered stations. Drag to move,
   click to select, `Delete` to remove, `Ctrl+Z` / **Undo** to step back.
   Scroll or pinch to zoom, drag empty space to pan, **Fit** to reset.
3. **Register panel** — every station gets a row: editable location label, product,
   condition (Sound / Activity / Damaged / Missing / Replaced / Not checked), plus
   job header fields (site, address, technician, product, date).
4. **Export PDF** — A4 portrait: branded page 1 (logo, plan fitted to page, legend),
   station register table on page 2+, licence/contact footer on every page.
   Filename: `<SiteSlug>_Station_Plan_<YYYY-MM-DD>.pdf`.

## Notes / known gaps

- The legacy `legacy/CTC_markup_prototype.html` referenced in the brief is **not in
  this repository**, so the CTC seed uses a schematic placeholder site plan
  (`src/seed/ctc.ts`). To swap in the real plan: delete the seed site in the app and
  re-create it by uploading the genuine base map.
- There was also no `CLAUDE.md` in the repo; brand colours, credentials and defaults
  were taken from the build brief and centralised in `src/brand.ts`.
- PDF text/markers are vector; the base map itself is rasterized at high resolution
  (SVG maps are drawn at up to 3× so they stay crisp).
