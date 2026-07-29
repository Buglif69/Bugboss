# Slug-A-Bug Social Pack — 100 Magazine-Style Posts × 4 Platforms

100 unique, magazine-style social media posts on the Slug-A-Bug brand, modelled on the
"Did You Know?" bold-editorial ad format (big display headline, supporting fact, crosshair
target visual, photo-style scene backdrop, CTA bar, licences in the footer).

## What's here

| Path | What it is |
|---|---|
| `facebook/post-001…100.jpg` | 1080×1350 (4:5) — Facebook feed |
| `instagram-feed/post-001…100.jpg` | 1080×1350 (4:5) — Instagram feed |
| `instagram-story/post-001…100.jpg` | 1080×1920 (9:16) — IG/FB Stories & Reels covers |
| `square/post-001…100.jpg` | 1080×1080 (1:1) — Google Business Profile, LinkedIn |
| `captions.md` | Matching caption + hashtags for every post |
| `schedule.md` | 20-week posting calendar (5 posts/week, Mon–Fri, auto pillar rotation) |
| `src/posts.html` | The design system — all 100 posts defined as data over 5 reusable layouts |
| `src/render.js` | Playwright script: renders all platforms + regenerates captions/schedule |
| `src/photos/` | **Swappable real-photo slots** (see below) |
| `src/fonts/` | Anton (display) + Barlow / Barlow Condensed (body), self-hosted woff2 |

## Swappable real photos

Every post has a changeable photo slot. Drop a real photo (job photos, techs, before/afters)
at `src/photos/post-NNN.jpg` (or `.png`) and re-render — that post's generated scene backdrop
is automatically replaced by the real photo, under a brand-colour scrim that keeps the text
readable. Remove the file to go back to the generated scene.

## Brand rules baked in

- Colours: red `#EE1C24`, near-black `#150404`, white/bone
- Logo lockup: SLUG-A-BUG wordmark + "PEST CONTROL" with crosshair-target O
- Every post carries: slugabug.com.au · (07) 3113 9666 · QLD Pest Lic PMT 1004307814 · QBCC 1122314 · Family owned, 20+ years
- 5 layout systems: light cover, dark cover, red poster, big-stat editorial, checklist split
- 10 content pillars: The Pest Files (facts) · Season Watch · Service Spotlight · Know the Signs · Why Slug-A-Bug · Myth vs Fact · Pro Tips · Local Areas (suburbs) · Industry Watch (commercial) · Ask Slug-A-Bug (Q&A)

## Re-rendering / building the next weekly pack

```bash
cd social-pack/src
npm install playwright-core    # once, anywhere on the NODE_PATH
node render.js                 # renders all 100 × 4 platforms + regenerates docs
node render.js --only 3,7,12   # re-render specific posts only
```

Chromium path defaults to `/opt/pw-browsers/chromium`; override with `CHROMIUM_PATH=...`.

To add new posts, append entries to the `POSTS` array in `src/posts.html` (pick a layout,
icon, headline, body, caption, CTA) and run `node render.js` — platform images, captions
and the schedule all regenerate automatically. An overflow audit pattern lives in git
history if layouts are changed. Every element — layouts, icons, scenes, lockup, CTA bars —
is reusable data-driven code, so new posts stay perfectly on-brand.
