# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`bugboss-dashboard` — the planned web dashboard for **Slug-A-Bug Pest Control**
(Brisbane & Gold Coast), surfacing jobs, leads, quotes, and revenue.
Operational data lives in **ServiceM8**, which is the source of truth for any
integration; sessions may have ServiceM8 MCP tools connected (`list_jobs`,
`get_job_details`, `list_forms`, etc.) for live data.

**There is no application code yet.** The repository currently carries the
standing AI agent roster and its documentation. There are no build, lint, or
test commands until the first code lands.

## When application code is added

Follow the conventions in `.claude/agents/dashboard-engineer.md`:

- **Contract first**: features spanning API and UI start with `CONTRACT.md`
  (endpoints, request/response shapes, data model); both sides build against it.
- **Tests ship with the feature**: every endpoint gets request/response tests
  including invalid input; critical UI flows get an end-to-end check. Default
  stack if starting fresh: Node/Express API + React front end + Vitest, one
  command to run locally.
- Secrets come from environment variables with a documented `.env.example`.
- Non-obvious choices get one dated line in `DECISIONS.md`.

## Standing agent roster

Eight custom agents in `.claude/agents/` load automatically in every session
on this repo. Delegate matching work to them rather than doing it inline —
their definitions carry the business rules:

- `lead-hunter`, `landing-page-builder`, `marketing-strategist`,
  `partner-pack-writer`, `outreach-writer` — sales/marketing production
- `compliance-critic` — mandatory final gate on anything customer-facing
- `dashboard-engineer` — all coding work in this repo
- `report-engine` — ServiceM8 Word report templates (.docx). It must load the
  `docx` skill before touching any Word file: templates contain live ServiceM8
  merge fields and Word IF field codes that break if edited as text. Verify
  changes by rendering to PDF and inspecting pages.

Full roster guide: `docs/AGENTS.md`. Ad-hoc multi-agent builds:
`docs/AGENT-TEAM-PLAYBOOK.md`.

## Non-negotiable business rules (apply to all output)

- Australian English in customer-facing text.
- Never invent licence numbers, ABN, pricing, review counts, or client names —
  insert `[PLACEHOLDER]` markers and list them for the user to fill.
- Customer-facing claims must be sourced from supplied material or flagged
  as unverified.
- Anything a customer will see goes through `compliance-critic` before it
  ships.
