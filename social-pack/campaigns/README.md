# Slug-A-Bug — Daily Campaign Calendar

100 days of daily posting (starting **Mon 3 Aug 2026**), organised into 8 campaigns that
rotate so no theme runs two days straight:

**Did You Know · Seasonal · Services · Trust & Offers · Myth-Busting · Pro Tips · Suburb Spotlight · Commercial · Q&A**

## Posting times (AEST — chosen per platform)

| Platform | Time | Why |
|---|---|---|
| Facebook | 7:30am | commute/school-run scroll, strongest FB slot for local services |
| Google Business Profile | 9:00am | indexed while people search "pest control near me" during work hours |
| Instagram feed | 11:45am | lunchtime peak |
| Instagram Story | 5:30pm | evening wind-down, highest story views |

## Files

- `campaign-calendar.csv` — the master: one row per day with campaign, caption and all 4 image URLs
- `facebook.csv`, `instagram-feed.csv`, `instagram-story.csv`, `google-business.csv` —
  per-platform, scheduler-ready (`date,time,text,media_url`), with the right posting time baked in

Image URLs are pinned to a git commit, so they work permanently — schedulers can fetch them directly.

## Three ways to put this live

1. **Free & official — Meta Business Suite** (Facebook + Instagram, incl. stories):
   business.facebook.com → Planner → schedule posts. Use the calendar CSV as your worksheet;
   drag in images from the platform folders. ~1 hour to load a month of posts.
2. **CSV bulk import — Publer / Metricool / Buffer** (adds Google Business + auto-publishing):
   connect your accounts once, import the per-platform CSV, done. These tools accept
   date/time/text/media-URL columns exactly as provided (map columns on import).
3. **Fully hands-off — Zapier**: a scheduled Zap reads each day's row from this calendar and
   publishes to Facebook Pages, Instagram for Business and Google Business Profile
   automatically. Needs your Zapier account connected — Claude can wire this up with you.

## Regenerating

After adding posts or new captions:

```bash
cd social-pack/src && node gen-campaigns.js   # rewrites campaigns/ pinned to current commit
```
