# Slug-A-Bug Partner Packs

Recreates the 7-page Slug-A-Bug Partner Pack flyer set as code, and builds one
pack per sector from `data/SlugABug_BulkCreate_AllSectors_v4.csv`.

**14 sectors x 7 pages, ready in `out/`.**

| Page | What it is |
|---|---|
| 1 | Cover / Partner Pack — tag, subhead, body, four tiles, what's inside |
| 2 | Service Overview — five promise tiles, common areas, typical program |
| 3 | Sample Service Report — always badged EXAMPLE ONLY |
| 4 | Case Study — challenge / solution / result, why it matters, quote |
| 5 | Quote Request & Site Scope Checklist — fillable |
| 6 | Pest Prevention Guide — everyday tips, urgent issues |
| 7 | Capability Statement — overview, capabilities, snapshot, why us |

Canvas is the original Canva artboard: **1449 x 2048 px = 1086.75 x 1536 pt**,
so a page drops straight back into the Canva file at 1:1.

## Build

```bash
cd partner-packs

python3 scripts/build_packs.py --list        # sector keys
python3 scripts/build_packs.py --validate    # length-check every copy slot
python3 scripts/build_packs.py --all         # all 14 packs -> out/*.pdf
python3 scripts/build_packs.py childcare     # just one
python3 scripts/build_packs.py --all --html-only   # build/*.html, no PDF

python3 scripts/build_bulk_create.py         # Canva Bulk Create .xlsx
```

Requires Python 3 and a Chromium binary. The build finds Playwright's Chromium
automatically; otherwise set `CHROME_PATH=/path/to/chrome`. The workbook step
needs `openpyxl`.

## Outputs

- `out/SlugABug_Partner_Pack_<Sector>.pdf` — the finished 7-page pack.
- `out/SlugABug_BulkCreate_PartnerPacks.xlsx` — 7 sheets (one per page), one
  row per sector, for driving the Canva template with Bulk Create. Sheet
  `1_Cover` keeps the exact headers of the source CSV so an existing cover-page
  Bulk Create connection keeps working.

## Where the words come from

- **`data/SlugABug_BulkCreate_AllSectors_v4.csv`** — the cover page and the
  footer strap for every sector. Edit here to change cover copy.
- **`scripts/profiles.py`** — the authored per-sector fields (areas, scope,
  case study, tips, capabilities, sample report). One block per sector.
- **`scripts/engine.py`** — expands a profile + CSV row into ~120 copy slots
  and length-checks each one against the locked layout.
- **`scripts/brand.py`** — phone, web, QBCC, PMT, ABN, colours, sample dates.

### Adding a sector

1. Add a row to the CSV.
2. Copy a `PROFILES` block in `profiles.py`, rename the key, fill the fields,
   and add its three `_EXTRA` fields.
3. `python3 scripts/build_packs.py --validate`, trim anything it flags.
4. `python3 scripts/build_packs.py <key>`.

## Length discipline

Every slot has a character budget in `engine.BUDGETS`, mirrored from the
approved Child Care pack. `--validate` prints the slot name and the offending
text for anything over budget. **Do not ship with warnings** — trim and re-run.
The current set builds clean with zero warnings.

## Photos

Each page carries a hero area, top right. Drop a photo in as
`assets/photos/<sector-key>.jpg` (or .png/.jpeg/.webp) and it is picked up on
the next build — greyscaled and faded into the page automatically. With no
photo present the page falls back to the branded hex plate, which is what the
current PDFs use.

## Brand and compliance

Pulled from `scripts/brand.py`, so a fix there fixes all 14 packs:

- QBCC **1122314** · PMT **1004307814** · ABN **81 644 370 525**
- 07 3113 9666 · slugabug.com.au · Brisbane and the Gold Coast

Two defects in the original Canva flyer set are corrected here:

- Capability Statement printed **QBCC 1223514** — the correct number is
  **1122314**.
- Prevention Guide printed "Small **hiabits** make a big difference."

Australian spelling throughout. The Sample Service Report always carries the
**EXAMPLE ONLY** badge and must never be presented as a real job.

## Assets

`assets/logo.png` is the Slug-A-Bug mark lifted from the approved pack and
cleaned to a white background (it is composited with `mix-blend-mode:multiply`).
Fonts are bundled as woff2 under `assets/fonts/`: Anton (display), Oswald
(labels), Montserrat (body).
