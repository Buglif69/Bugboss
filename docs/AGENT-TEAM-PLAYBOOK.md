# BugBoss AI Agent Team Playbook

A complete strategy for running Claude Code **Agent Teams** — built from the full video method, upgraded where the demo was weak.

---

## 1. The core principles

1. **Goal first.** Agents wake up with zero context — the first thing in your prompt is the goal and why the team exists.
2. **Own territory.** Every agent owns specific files/directories and its own deliverables. Nobody edits outside their territory (prevents overwrites).
3. **Direct messaging.** Teammates talk to each other without routing through the main session. Name the recipients: "when done, message X."
4. **Defined outputs.** No vague deliverables. Every agent produces a named artifact (a file, a report, a running service).
5. **2–5 agents max.** Each teammate is a full session: 3 agents ≈ 3× cost, 5 ≈ 5×. Swarms of 10+ are 10× the price for worse coordination.
6. **Explicit dependencies.** State who waits for whom. An idle agent means the prompt didn't assign dependencies.
7. **Full context up front.** No history is given beforehand — include everything each role needs in the team prompt.

## 2. When to use a team (and when not to)

**Use an agent team when:**
- The work is genuinely parallel (front end + back end + tests)
- Multiple specialized areas need to cross-check each other
- You want a quality loop where one agent pushes back on another's work

**Don't use a team when:**
- The process is sequential (step 1 → 2 → 3) → use subagents
- Everything needs one shared conversation history → single session
- It's a small fix → single session (teams are slower and more expensive)

## 3. Operating rules

- **Permissions inherit from the main session.** Bypass mode on the main session = bypass on every teammate. Pre-approve routine tools in project settings so agents don't stall asking for approval.
- **Plan approval mode.** Have every teammate submit a plan first; approve plans (yourself or via a lead agent) before building starts.
- **Monitor live.** You can watch teammates in a tmux split-pane view and message any individual agent mid-run — to redirect, approve, or add info.
- **Token control.** If tokens burn too fast, drop the agent count. Have agents store progress in temporary notes files they can re-read, instead of re-deriving context.
- **Clean shutdown.** Ending the run: the main agent tells everyone "you're done, save your work," and each teammate confirms saving before shutdown. Never kill agents mid-write.

## 4. The upgraded team pattern

The video's demo (front-end dev + back-end dev + QA, all Sonnet) worked but had four weaknesses. Fix all four:

| Weakness in the demo | The fix |
|---|---|
| No shared contract — devs built on assumptions, QA found 3 critical issues | An **Architect** writes CONTRACT.md (API spec, data model, file ownership) *before* devs start |
| QA was the only check | Architect doubles as reviewer for cross-cutting decisions |
| Vague acceptance criteria ("confirm it works") | Numbered, testable acceptance criteria written before building |
| One model for every role | Opus for judgment (architecture/review), Sonnet for well-specified build/test work |

## 5. Paste-ready prompt — BugBoss Dashboard build team

```
GOAL: Build a working BugBoss dashboard — a web app for my pest control
business showing jobs, leads, quotes, and revenue. A REST API backend with
seeded demo data, and a React front end. End result: a running app on
localhost, a test report showing pass/fail per acceptance criterion, and a
DECISIONS.md documenting what was built and key choices.

ACCEPTANCE CRITERIA (the QA gate — all must pass):
1. App starts with one command and loads at localhost with no console errors
2. Dashboard shows job list, lead list, and a revenue summary from the API
3. Creating and editing a job via the UI persists through the API
4. All API endpoints return correct data and handle invalid input gracefully
5. No secrets or credentials hardcoded anywhere

PROCESS: Work in plan approval mode — each teammate submits its plan to the
architect for approval before building. Each agent keeps a running notes
file in /notes/<role>.md so progress survives and context isn't re-derived.

Create a team of 4 teammates:

1. ARCHITECT (Opus) — Goes first, alone. Writes CONTRACT.md: the API
   spec (endpoints, request/response shapes), data model, file ownership
   map, and the acceptance criteria above broken into testable checks.
   Owns: CONTRACT.md, DECISIONS.md, /notes. When done, message the backend
   dev and frontend dev to start. Then acts as reviewer: approves teammate
   plans, resolves blockers, and is the only agent allowed to edit
   CONTRACT.md.

2. BACKEND DEV (Sonnet) — Waits for the architect's go message. Submits a
   plan, then builds the REST API exactly to CONTRACT.md, with seed data.
   Owns: /server only. Never touches /client. When endpoints are live,
   message the frontend dev; when done, message QA.

3. FRONTEND DEV (Sonnet) — Waits for the architect's go message. Submits a
   plan, then builds the React UI against the contract (mock the API until
   the backend dev messages that endpoints are live). Owns: /client only.
   Never touches /server. When done, message QA.

4. QA ENGINEER (Sonnet) — Waits for both devs' done messages. Runs the app
   for real and tests every acceptance criterion plus edge cases (bad
   input, empty states, refresh mid-action). Writes TEST-REPORT.md scoring
   each criterion pass/fail with reproduction steps. Owns: /tests and
   TEST-REPORT.md. Sends each failure back to the owning dev — repeat
   until all criteria pass. QA never fixes code itself; devs fix, QA
   re-tests.

RULES: No agent edits files outside its ownership map. All cross-cutting
decisions go through the architect. Before finalizing, every teammate
confirms its work is saved, then the team shuts down cleanly. Final
deliverables: running app, TEST-REPORT.md all-green, DECISIONS.md.
```

## 6. Variant — business ops team (Slug-A-Bug lead engine)

Same pattern, aimed at operations instead of code:

```
GOAL: Produce a ready-to-action commercial pest-control prospect pack for
Slug-A-Bug covering [AREA — e.g. North Brisbane]. End result: PROSPECTS.md
(scored lead list), OUTREACH.md (draft emails per segment), and REVIEW.md
confirming every claim is verifiable and compliant.

Create a team of 3 teammates using Sonnet:

1. RESEARCHER — Builds the prospect list from public sources: strata,
   childcare, hospitality, warehousing. For each: business name, segment,
   why they need recurring pest control, and a risk/priority score.
   Owns: PROSPECTS.md. When done, message the writer.

2. OUTREACH WRITER — Waits for the researcher. Drafts one tailored email
   per segment plus a follow-up sequence, using the researcher's notes.
   Owns: OUTREACH.md. When done, message the critic.

3. CRITIC — Waits for the writer. Checks every factual claim against the
   research, flags anything unverifiable, ensures compliance (licensing
   claims, no spam-trigger wording, accurate service claims). Owns:
   REVIEW.md. Sends failures back to the owning teammate until clean.

RULES: Each agent edits only its own file. Full context is in this prompt —
do not assume prior knowledge. Save all work before shutdown.
```

## 7. Quick-reference checklist before launching any team

- [ ] Goal stated first, with full context
- [ ] Numbered, testable acceptance criteria
- [ ] 2–5 teammates, each with a named role
- [ ] File/territory ownership per agent
- [ ] Explicit dependencies (who waits for whom, who messages whom)
- [ ] Named deliverables per agent
- [ ] A verification loop with a defined exit condition
- [ ] Model matched to role (judgment → Opus, execution → Sonnet)
- [ ] Plan approval before building
- [ ] Clean shutdown: save before finalize
