"""Expands an authored profile + the CSV row into every copy slot the seven
Partner Pack pages need, and length-checks each slot against the locked layout.

`build(key)` returns a flat-ish dict consumed by pages.py.
"""

import csv
import os
import re

import brand
from profiles import PROFILES, INDUSTRY_TO_KEY

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CSV_PATH = os.path.join(ROOT, "data", "SlugABug_BulkCreate_AllSectors_v4.csv")

# Character budgets mirrored from the approved Child Care pack. Overflow does
# not crash the build — it is reported by --validate so it gets trimmed.
BUDGETS = {
    "cover_subhead": 110,
    "cover_body": 190,
    "cover_tile_body": 90,
    "footer_strap": 78,
    "so_body": 230,
    "so_area": 26,
    "case_intro": 320,
    "case_challenge": 78,
    "case_solution": 92,
    "case_result": 74,
    "why_matters": 165,
    "quote": 78,
    "cap_overview": 260,
    "cap_core": 68,
    "cap_why": 34,
    "tip": 76,
    "urgent": 46,
    "scope": 40,
    "access": 42,
    "sr_area": 30,
    "sr_finding": 62,
    "sr_action": 58,
    "sr_rec": 52,
}


def load_csv_rows():
    with open(CSV_PATH, newline="", encoding="utf-8-sig") as fh:
        rows = [r for r in csv.DictReader(fh) if (r.get("Industry") or "").strip()]
    return rows


def _split_strap(footer):
    """'Smarter pest solutions for X.' -> ('Smarter pest solutions', 'for X.')"""
    m = re.search(r"\bfor\b", footer)
    if not m:
        return footer.strip(), ""
    return footer[: m.start()].strip(), footer[m.start():].strip()


def build(key, csv_row=None):
    p = PROFILES[key]
    if csv_row is None:
        rows = {r["Industry"]: r for r in load_csv_rows()}
        csv_row = rows[p["industry"]]

    strap_lead, strap_tail = _split_strap(csv_row["Footer"])
    # 'for child care and early learning environments.' -> 'child care and
    # early learning environments' (used mid-sentence on the guide page)
    strap_noun = strap_tail[4:].rstrip(".") if strap_tail.startswith("for ") else strap_tail

    trusted_by = p["sector"].split(",")[0].strip()

    ctx = {
        "key": key,
        "industry": p["industry"],
        "tag": csv_row["Tag"],
        # ---- cover (straight from the CSV) ------------------------------
        "cover_subhead": csv_row["Subhead"],
        "cover_body": csv_row["Body"],
        "cover_tiles": [
            (csv_row["Tile1_Title"], csv_row["Tile1_Body"]),
            (csv_row["Tile2_Title"], csv_row["Tile2_Body"]),
            (csv_row["Tile3_Title"], csv_row["Tile3_Body"]),
            (csv_row["Tile4_Title"], csv_row["Tile4_Body"]),
        ],
        # ---- shared furniture -------------------------------------------
        "footer_strap": csv_row["Footer"],
        "strap_lead": strap_lead,
        "strap_tail": strap_tail,
        "cta_lead": "Ask us for a tailored",
        "cta_tail": "%s pest management plan." % p["cta_sector"],
        "phone": brand.PHONE,
        "web": brand.WEB,
        # ---- page 2: service overview -----------------------------------
        "so_title_red": "OUR %s" % p["so_word"],
        "so_title_ink": "SERVICE OVERVIEW",
        "so_body": p["so_body"],
        "so_tiles": [
            ("RAPID RESPONSE", "Quick action when you need us most.", "stopwatch"),
            ("DISCREET &amp; RESPECTFUL", p["discreet"], "shield-tick"),
            ("EXPERIENCED &amp; LICENSED",
             "Fully licensed, insured and compliant with Australian standards.",
             "badge-tick"),
            ("TAILORED PROGRAMS",
             "Custom pest management plans designed for your %s's unique needs."
             % p["site_word"], "people-gear"),
            ("CLEAR REPORTING",
             "Easy-to-understand reports with photo evidence.", "report"),
        ],
        "areas11": p["areas11"],
        "program": [
            ("INSPECT", "We inspect key areas and identify risks or activity.", "search"),
            ("TREAT", "We apply safe, targeted treatments with minimal disruption.", "spray"),
            ("REPORT", "You receive clear reports with findings and recommendations, "
                       "with photo evidence.", "report"),
            ("REVIEW", "We review and adjust your program to keep pest pressure low "
                       "long-term.", "refresh"),
        ],
        "so_footer_lead": "Pest control you can rely on.",
        "so_footer_tail": "Peace of mind you can count on.",
        # ---- page 3: sample service report ------------------------------
        "sr_property": p["sr_property"],
        "sr_date": brand.SAMPLE_SERVICE_DATE,
        "sr_service_type": p["sr_service_type"],
        "sr_technician": "Slug-A-Bug Technician",
        "sr_contact": p["sr_contact"],
        "sr_job_no": "%s-%s" % (p["job_prefix"], brand.SAMPLE_JOB_SUFFIX),
        "sr_areas": p["sr_areas"],
        "sr_findings": p["sr_findings"],
        "sr_actions": p["sr_actions"],
        "sr_recs": p["sr_recs"],
        "sr_next_visit": brand.SAMPLE_NEXT_VISIT,
        # ---- page 4: case study -----------------------------------------
        "case_subhead": "How a proactive pest management program improved "
                        "outcomes in a %s." % p["case_subject"],
        "case_intro": p["case_intro"],
        "challenges": p["challenges"],
        "solutions": p["solutions"],
        "results": p["results"],
        "why_matters": p["why_matters"],
        "quote": p["quote"],
        "attribution": p["attribution"],
        # ---- page 5: quote & site scope ---------------------------------
        "quote_subhead": "The more detail we have, the faster we can tailor an "
                         "accurate %s pest management proposal." % p["cta_sector"],
        "site_label": p["site_label"],
        "scope6": p["scope6"],
        "access6": p["access6"],
        "areas9": p["areas9"],
        # ---- page 6: prevention guide -----------------------------------
        "pg_title_red": p["prevention_title"],
        "pg_title_ink": "PEST PREVENTION GUIDE",
        "pg_subhead": "Small habits make a big difference. These simple steps "
                      "help reduce pest pressure in %s." % strap_noun,
        "tips": p["tips"],
        "urgent": p["urgent"],
        "need_help": "We're here to help keep your %s safe, presentable and "
                     "pest-free. Contact us anytime for support." % p["site_word"],
        # ---- page 7: capability statement -------------------------------
        "cap_overview": "%s proudly supports %s across %s with practical, %s "
                        "pest management programs, clear reporting and "
                        "responsive service."
                        % (brand.COMPANY, p["sector"], brand.SERVICE_AREA,
                           p["approach"]),
        "core": p["core"],
        "snapshot": [brand.SERVICE_AREA_SHORT, "Fully licensed and insured",
                     "QBCC %s" % brand.QBCC, "PMT %s" % brand.PMT],
        "why": p["why"],
        "cap_tiles": [
            ("EXPERIENCED<br>AND RELIABLE",
             "Trusted by %s across Brisbane and the Gold Coast." % trusted_by,
             "people-gear"),
            ("CLEAR REPORTING<br>MADE EASY",
             "Detailed reports with photos, findings and recommendations for "
             "easy compliance.", "report"),
            ("FAST, RESPONSIVE<br>SERVICE",
             "Quick response when you need us most. We're easy to reach and "
             "ready to act.", "stopwatch"),
            ("FOCUSED ON<br>%s" % p["focus"],
             "We understand your environment and tailor solutions to %s."
             % p["risk_clause"], "focus"),
        ],
    }
    return ctx


def validate(ctx):
    """Return a list of (slot, budget, length, text) for every overflow."""
    checks = [
        ("cover_subhead", [ctx["cover_subhead"]]),
        ("cover_body", [ctx["cover_body"]]),
        ("cover_tile_body", [b for _, b in ctx["cover_tiles"]]),
        ("footer_strap", [ctx["footer_strap"]]),
        ("so_body", [ctx["so_body"]]),
        ("so_area", ctx["areas11"] + ctx["areas9"]),
        ("case_intro", [ctx["case_intro"]]),
        ("case_challenge", ctx["challenges"]),
        ("case_solution", ctx["solutions"]),
        ("case_result", ctx["results"]),
        ("why_matters", ctx["why_matters"]),
        ("quote", [ctx["quote"]]),
        ("cap_overview", [ctx["cap_overview"]]),
        ("cap_core", ctx["core"]),
        ("cap_why", ctx["why"]),
        ("tip", ctx["tips"]),
        ("urgent", [a for a, _ in ctx["urgent"]] + [b for _, b in ctx["urgent"]]),
        ("scope", ctx["scope6"]),
        ("access", ctx["access6"]),
        ("sr_area", ctx["sr_areas"]),
        ("sr_finding", ctx["sr_findings"]),
        ("sr_action", ctx["sr_actions"]),
        ("sr_rec", ctx["sr_recs"]),
    ]
    problems = []
    for slot, values in checks:
        budget = BUDGETS[slot]
        for text in values:
            plain = re.sub(r"&amp;", "&", text)
            if len(plain) > budget:
                problems.append((slot, budget, len(plain), text))
    return problems


def build_all():
    rows = {r["Industry"]: r for r in load_csv_rows()}
    out = []
    for industry, row in rows.items():
        key = INDUSTRY_TO_KEY.get(industry)
        if key is None:
            raise SystemExit(
                "CSV row '%s' has no profile in profiles.py — author one first."
                % industry)
        out.append(build(key, row))
    return out
