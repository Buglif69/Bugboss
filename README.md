# bugboss-dashboard

**`index.html`** — the consolidated Slug-A-Bug Marketing Machine: one self-contained,
single-file web app that combines four previously separate artifacts into one tabbed hub.

## What's inside

| Tab | What it is |
| --- | --- |
| **Review Card Studio** | Interactive tool — paste a real Google review, get a branded 1080×1450 PNG card plus ready-to-paste Facebook / Instagram / Google Business captions. Saves drafts to the browser. |
| **Photo Library** | "Best Of" gallery of 44 real marketing photos (crew, branded utes, PPE, termite & pest work). |
| **Social Content Pack** | Six ready-to-post sets built from real photos, each with platform-tuned captions, hashtags and alt text. |
| **BugBoss Playbook** | The full Online Presence Playbook (GBP, Bing, Apple, AU directories, SEO keyword map, seasonal calendar, guardrails). |

## Import / host it anywhere

`index.html` is **fully self-contained** — all CSS, JavaScript and images (base64) are inlined,
with no external dependencies or network calls. To use it:

- **Open locally** — double-click `index.html`.
- **Host it** — drop the single file on any static host (Bluehost `public_html`, Netlify,
  GitHub Pages, an S3 bucket, etc.). Deep links work via URL hash: `#studio`, `#gallery`,
  `#social`, `#playbook`.
- **Embed it** — the four tools are each rendered in an isolated `<iframe>`, so styles never
  collide; you can also lift any single `<template>` block out into its own page.

> Note: the copy-to-clipboard and PNG-download buttons need a secure context — they work when
> the page is served over `https://` (or opened directly from disk in most browsers), the same
> as the original artifacts.
