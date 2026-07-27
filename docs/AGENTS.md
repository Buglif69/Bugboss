# Slug-A-Bug Agent Roster

This repo carries a standing roster of custom AI agents in `.claude/agents/`.
They load automatically in **every Claude Code session opened on this
repository** — web, desktop, or mobile. You don't need to recreate them per
chat: just describe the task and the matching agent is used, or ask for one
by name ("use the lead-hunter to…").

## The roster

| Agent | What it does | Model |
|---|---|---|
| `lead-hunter` | Finds and scores commercial pest-control prospects (strata, childcare, hospitality, warehousing, aged care, medical) with ranked briefs | Sonnet |
| `landing-page-builder` | Builds and audits conversion-focused landing pages (PPC, SEO, suburb, pest-type pages) as ready-to-host HTML | Sonnet |
| `marketing-strategist` | SEO/ads/competitor research and prioritised marketing plans grounded in Brisbane & Gold Coast data | Opus |
| `partner-pack-writer` | Adapts the 7-page partner pack to any industry vertical, ready for the Canva template | Sonnet |
| `outreach-writer` | Cold outreach, follow-up sequences, and email campaigns — Spam Act-compliant, Australian tone | Sonnet |
| `compliance-critic` | Final pass/fail gate on anything customer-facing: claims, licensing, spam law, brand safety | Opus |
| `dashboard-engineer` | Builds and tests the BugBoss dashboard itself, contract-first with tests required | Sonnet |
| `report-engine` | Creates, audits, and repairs premium ServiceM8 Word report templates — merge fields, IF field codes, conditional-collapse, three-pass engineer/design/QC workflow | Opus |

## How they work together

A typical pipeline: **lead-hunter** researches → **outreach-writer** drafts
from that research → **compliance-critic** gates it before sending. Or:
**marketing-strategist** picks the keyword → **landing-page-builder** builds
the page → **compliance-critic** reviews it. The critic is deliberately the
last step for anything a customer will see.

## Shared rules baked into every agent

- Never invent licence numbers, ABN, pricing, review counts, or client
  names — placeholders are marked `[LIKE THIS]` and listed for you to fill.
- Claims a customer could read are sourced or flagged as unverified.
- Australian English, local framing (Brisbane & Gold Coast, ServiceM8).

## Scope notes

- These agents live with the repo, so they're available wherever this repo
  is: any Claude Code session on `bugboss`. Regular claude.ai chats (not
  Code sessions) instead use your claude.ai Skills, which already cover
  similar ground.
- These are *subagents*: spawned on demand within a session, gone when the
  task ends, nothing runs in the background. For big parallel builds you
  can still spin up an ad-hoc agent team (see the Agent Team Playbook) —
  the two combine fine.
- To add or tune an agent, edit its file in `.claude/agents/` and commit.
