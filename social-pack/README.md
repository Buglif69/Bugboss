# Slug-A-Bug Social Pack 01 — Magazine-Style Ad Set

25 unique, magazine-style social media posts on the Slug-A-Bug brand, modelled on the
"Did You Know?" bold-editorial ad format (big display headline, supporting fact, crosshair
target visual, CTA bar, licences in the footer).

## What's here

| Path | What it is |
|---|---|
| `renders/post-01.png … post-25.png` | Final ready-to-post images, 1080×1350 (4:5 — ideal for Facebook & Instagram feed) |
| `captions.md` | Matching caption + hashtags for every post |
| `schedule.md` | 5-week posting calendar (5 posts/week, Mon–Fri) |
| `src/posts.html` | The design system — all 25 posts defined as data over 5 reusable layouts |
| `src/render.js` | Playwright script that renders every post to PNG |
| `src/fonts/` | Anton (display) + Barlow / Barlow Condensed (body), self-hosted woff2 |

## Brand rules baked in

- Colours: red `#EE1C24`, near-black `#150404`, white/bone
- Logo lockup: SLUG-A-BUG wordmark + "PEST CONTROL" with crosshair-target O
- Every post carries: slugabug.com.au · (07) 3113 9666 · QLD Pest Lic PMT 1004307814 · QBCC 1122314 · Family owned, 20+ years
- 5 layout systems: light cover, dark cover, red poster, big-stat editorial, checklist split
- 5 content pillars: Did-You-Know facts · Brisbane seasonal · service spotlights · trust/guarantee · tips & myth-busting

## Re-rendering / building the next weekly pack

```bash
cd social-pack/src
npm install playwright-core   # once, anywhere on the NODE_PATH
node render.js                # renders all 25 → ../renders/
node render.js --only 3,7,12  # re-render specific posts
```

Chromium path defaults to `/opt/pw-browsers/chromium`; override with `CHROMIUM_PATH=...`.

To create a new weekly set of 5, add five new entries to the `POSTS` array in
`src/posts.html` (pick a layout, icon, headline, body, CTA) and render. Every element —
layouts, icons, lockup, CTA bars — is reusable data-driven code, so new posts stay
perfectly on-brand.
