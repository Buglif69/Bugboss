# Slug-A-Bug Social Pack 01 — 5-Week Posting Schedule

**Cadence:** 5 posts per week, Monday–Friday. Suggested posting time: **7:30–8:00am AEST** (catches the school-run/commute scroll; Brisbane audience).
Each week mixes the pillars — one fact, one seasonal, one service, one trust, one tip — so the feed never repeats itself.

| Week | Mon | Tue | Wed | Thu | Fri |
|---|---|---|---|---|---|
| **1** (Mon 3 Aug) | 01 Did You Know: termite damage | 08 Pests don't take winter off | 13 One visit, every pest | 18 1,200+ five-star reviews | 25 Prevention 101 checklist |
| **2** (Mon 10 Aug) | 02 Roach survives a week headless | 09 Termite swarm alert | 12 1-in-3 termite inspections | 19 30-day guarantee | 23 5 termite signs |
| **3** (Mon 17 Aug) | 05 20mm rat gap | 10 After the rain, ants move in | 15 Termite barriers | 20 Family owned, Brisbane grown | 14 Something in your roof? |
| **4** (Mon 24 Aug) | 03 Spraying one ant does nothing | 11 Summer roach season | 16 Commercial: one roach closes a kitchen | 21 Licensed + Afterpay | 22 Myth: surface spray |
| **5** (Mon 31 Aug) | 07 95% of fleas aren't on your pet | 04 Redbacks love your meter box | 17 Don't buy their termites | 06 Bed bugs wait months | 24 DIY vs pro |

## Why this order

- **Monday** = hook fact (highest curiosity, best share rate) → warms the algorithm for the week.
- **Tuesday** = seasonal/urgency (winter now; swarm/summer posts are pre-loaded for when the season turns — swap 09/11 later in the year if preferred).
- **Wednesday** = service spotlight (mid-week is the strongest "book a job" day for trades).
- **Thursday** = trust/social proof (supports anyone who saw Mon–Wed and is still deciding).
- **Friday** = tips/checklist (high save-and-share content going into the weekend, when people do house jobs).

## Ongoing weekly packs (after approval)

Once this pack and the style are approved, each following week gets **5 brand-new posts** built from the same approved template system (`src/posts.html`) — new facts, new seasonal angles, new offers, never repeats. The build is fully scripted, so a weekly pack render is one command:

```
cd social-pack/src && node render.js
```

Ask Claude to "build Week N pack" and a fresh `renders/` set + captions + updated schedule row will be generated on this same design system.
