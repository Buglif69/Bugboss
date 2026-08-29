#!/usr/bin/env python3
"""Build the Slug-A-Bug Partner Packs.

  python scripts/build_packs.py --list
  python scripts/build_packs.py --validate
  python scripts/build_packs.py --all
  python scripts/build_packs.py childcare agedcare
  python scripts/build_packs.py --all --html-only

Each sector renders to one 7-page PDF in out/ on the locked 1449x2048 px
(1086.75 x 1536 pt) artboard.
"""

import argparse
import os
import re
import shutil
import subprocess
import sys

import engine
import pages
from profiles import PROFILES

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BUILD = os.path.join(ROOT, "build")
OUT = os.path.join(ROOT, "out")

CHROME_CANDIDATES = [
    os.environ.get("CHROME_PATH", ""),
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
]


def find_chrome():
    for c in CHROME_CANDIDATES:
        if c and os.path.exists(c):
            return c
    for name in ("chromium", "chromium-browser", "google-chrome"):
        found = shutil.which(name)
        if found:
            return found
    # last resort: any versioned playwright chromium
    base = "/opt/pw-browsers"
    if os.path.isdir(base):
        for d in sorted(os.listdir(base)):
            p = os.path.join(base, d, "chrome-linux", "chrome")
            if os.path.exists(p):
                return p
    return None


def slug(text):
    return re.sub(r"[^A-Za-z0-9]+", "_", text).strip("_")


def render_html(ctx):
    os.makedirs(BUILD, exist_ok=True)
    path = os.path.join(BUILD, "%s.html" % ctx["key"])
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(pages.document(ctx))
    return path


def render_pdf(chrome, html_path, pdf_path):
    cmd = [
        chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
        "--disable-dev-shm-usage", "--hide-scrollbars",
        "--no-pdf-header-footer", "--virtual-time-budget=20000",
        "--run-all-compositor-stages-before-draw",
        "--print-to-pdf=%s" % pdf_path, "file://%s" % html_path,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if not os.path.exists(pdf_path):
        sys.stderr.write(res.stdout + res.stderr)
        raise SystemExit("chromium failed to produce %s" % pdf_path)
    return pdf_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("keys", nargs="*", help="sector keys to build")
    ap.add_argument("--all", action="store_true", help="build every sector")
    ap.add_argument("--list", action="store_true", help="list sector keys")
    ap.add_argument("--validate", action="store_true",
                    help="length-check every copy slot and exit")
    ap.add_argument("--html-only", action="store_true",
                    help="write build/*.html and skip the PDF step")
    args = ap.parse_args()

    rows = {r["Industry"]: r for r in engine.load_csv_rows()}

    if args.list:
        for key, p in PROFILES.items():
            mark = "  " if p["industry"] in rows else " !"
            print("%s %-14s %s" % (mark, key, p["industry"]))
        print("\n! = no row in the CSV")
        return

    if args.validate:
        total = 0
        for ctx in engine.build_all():
            problems = engine.validate(ctx)
            total += len(problems)
            if problems:
                print("--- %s" % ctx["industry"])
                for s, b, l, t in problems:
                    print("    %-18s %3d > %3d  %s" % (s, l, b, t))
        print("LENGTH WARNINGS: %d" % total)
        raise SystemExit(1 if total else 0)

    keys = list(PROFILES) if (args.all or not args.keys) else args.keys
    unknown = [k for k in keys if k not in PROFILES]
    if unknown:
        raise SystemExit("unknown sector key(s): %s" % ", ".join(unknown))

    chrome = None if args.html_only else find_chrome()
    if not args.html_only and chrome is None:
        raise SystemExit("no chromium found — set CHROME_PATH or use --html-only")

    os.makedirs(OUT, exist_ok=True)
    warnings = 0
    for key in keys:
        p = PROFILES[key]
        row = rows.get(p["industry"])
        if row is None:
            print("skip %-14s (no CSV row)" % key)
            continue
        ctx = engine.build(key, row)
        problems = engine.validate(ctx)
        warnings += len(problems)
        html = render_html(ctx)
        if args.html_only:
            print("html  %-14s %s" % (key, os.path.relpath(html, ROOT)))
            continue
        pdf = os.path.join(
            OUT, "SlugABug_Partner_Pack_%s.pdf" % slug(p["industry"]))
        render_pdf(chrome, html, pdf)
        size = os.path.getsize(pdf) / 1024.0
        print("built %-14s %-58s %6.0f KB%s"
              % (key, os.path.relpath(pdf, ROOT), size,
                 "  (%d length warnings)" % len(problems) if problems else ""))

    if warnings:
        print("\n%d length warnings — run --validate and trim before shipping."
              % warnings)


if __name__ == "__main__":
    main()
