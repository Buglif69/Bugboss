"""Renders the seven Partner Pack pages to HTML on the locked 1449x2048 canvas.

Page order matches the Slug-A-Bug pack:
  1 Cover  2 Service Overview  3 Sample Service Report  4 Case Study
  5 Quote & Site Scope  6 Prevention Guide  7 Capability Statement

Vertical budget every page respects:
  0-360    logo band
  360-1690 content
  1690-1842 strap line
  1842-2048 contact footer bar
"""

import os

import brand
from icons import icon, ring

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PHOTO_DIR = os.path.join(ROOT, "assets", "photos")

HEX_SVG = (
    '<svg class="hex" viewBox="0 0 300 104" preserveAspectRatio="none" '
    'xmlns="http://www.w3.org/2000/svg"><defs><pattern id="hx" width="38" '
    'height="33" patternUnits="userSpaceOnUse">'
    '<path d="M19 1.5 L35 10.5 L35 28.5 L19 37.5 L3 28.5 L3 10.5 Z" fill="none" '
    'stroke="#ffffff" stroke-width="1.2"/></pattern></defs>'
    '<rect width="300" height="104" fill="url(#hx)"/></svg>'
)

MESH_SVG = (
    '<svg class="mesh" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" '
    'xmlns="http://www.w3.org/2000/svg"><defs><pattern id="mh" width="72" '
    'height="63" patternUnits="userSpaceOnUse">'
    '<path d="M36 3 L68 21 L68 57 L36 75 L4 57 L4 21 Z" fill="none" '
    'stroke="#ffffff" stroke-width="2"/></pattern></defs>'
    '<rect width="400" height="400" fill="url(#mh)"/>'
    '<g fill="none" stroke="#ffffff" stroke-width="6" opacity=".5">'
    '<circle cx="286" cy="120" r="74"/><circle cx="286" cy="120" r="30"/>'
    '<path d="M286 26v34M286 180v34M194 120h34M348 120h34"/></g></svg>'
)


# ---------------------------------------------------------------- helpers #
def frame(shard=True, tr=True):
    out = []
    if shard:
        out += ['<div class="shard-grey"></div>', '<div class="shard"></div>']
    out += ['<div class="bl-white"></div>', '<div class="bl-red"></div>']
    if tr:
        out += ['<div class="tr-black"></div>', '<div class="tr-red"></div>',
                '<div class="tr-white"></div>']
    return "".join(out)


def logo(small=False):
    return ('<img class="logo%s" src="../assets/logo.png" '
            'alt="Slug-A-Bug Pest Control">' % (" sm" if small else ""))


def hero(key, cls=""):
    """Sector photo if one has been dropped in, otherwise the branded plate."""
    inner = None
    for ext in ("jpg", "jpeg", "png", "webp"):
        if os.path.exists(os.path.join(PHOTO_DIR, "%s.%s" % (key, ext))):
            inner = '<img src="../assets/photos/%s.%s" alt="">' % (key, ext)
            break
    if inner is None:
        inner = '<div class="plate"></div>%s' % MESH_SVG
    return ('<div class="hero %s">%s<div class="fade-l"></div>'
            '<div class="fade-b"></div></div>' % (cls, inner))


def strap(lead, tail, bottom=196, one=False, cls=""):
    txt = ('<span>%s</span> <span class="r">%s</span>' % (lead, tail)) if one else \
          ('%s<br><span class="r">%s</span>' % (lead, tail))
    return ('<div class="strap %s %s" style="bottom:%spx"><div class="dash"></div>'
            '<div class="txt">%s</div><div class="dash"></div></div>'
            % ("one" if one else "", cls, bottom, txt))


def feet():
    return (
        '<div class="feet">%s<div class="top"></div><div class="row">'
        '<div class="item"><span class="bub">%s</span>'
        '<span class="t"><small>PH</small> %s</span></div>'
        '<div class="sep"></div>'
        '<div class="item"><span class="bub">%s</span>'
        '<span class="t"><small>%s</small></span></div>'
        '</div></div>'
        % (HEX_SVG, _phone_svg(), brand.PHONE, _globe_svg(), brand.WEB))


def _phone_svg():
    return ('<svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor">'
            '<path d="M6.6 3.2c.7 0 1.3.4 1.6 1l1.2 2.7c.3.7.1 1.5-.5 2l-1.1.9c.9 1.9'
            ' 2.4 3.4 4.3 4.3l.9-1.1c.5-.6 1.3-.8 2-.5l2.7 1.2c.6.3 1 .9 1 1.6v2.4c0'
            ' 1.1-.9 2-2 2C9.2 19.7 4.3 14.8 4.3 5.2c0-1.1.9-2 2-2z"/></svg>')


def _globe_svg():
    return ('<svg width="38" height="38" viewBox="0 0 24 24" fill="none" '
            'stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/>'
            '<path d="M3 12h18M12 3c2.6 2.6 2.6 15 0 18M12 3c-2.6 2.6-2.6 15 0 18"/>'
            '</svg>')


def h1(red, ink, size=112):
    return ('<h1 style="font-size:%spx"><span class="red">%s</span>'
            '<span class="ink">%s</span></h1>' % (size, red, ink))


def fit(*lines):
    """Pick an Anton size that keeps the longest headline line on one line."""
    longest = max(len(l) for l in lines)
    for limit, size in ((11, 118), (14, 106), (17, 94), (20, 82), (24, 70)):
        if longest <= limit:
            return size
    return 62


def li_bullets(items, cls="bullets"):
    return '<ul class="%s">%s</ul>' % (cls, "".join("<li>%s</li>" % i for i in items))


def li_ticks(items, cls="ticks", sz=26):
    tick = icon("check-circle", sz, stroke=2.4, color="#E2121B")
    return '<ul class="%s">%s</ul>' % (cls, "".join(
        '<li><span class="tk">%s</span>%s</li>' % (tick, i) for i in items))


def checkboxes(items, cls="checkline sm"):
    return "".join('<div class="%s"><span class="checkbox"></span>'
                   '<span>%s</span></div>' % (cls, i) for i in items)


def page(inner):
    return '<section class="page">%s</section>' % inner


# ------------------------------------------------------------- page 1/7 * #
def cover(c):
    tiles = "".join(
        '<div style="flex:1;padding:0 24px;%s">'
        '<div style="margin-bottom:16px">%s</div>'
        '<h3 style="font-size:23px;margin-bottom:10px">%s</h3>'
        '<p style="font-size:19px;line-height:1.36;color:var(--grey)">%s</p></div>'
        % ("border-left:2px solid var(--line)" if i else "", ring(ic, 78, 40), t, b)
        for i, ((t, b), ic) in enumerate(zip(
            c["cover_tiles"],
            ["stopwatch", "report", "badge-tick", "people-gear"])))

    inside = ["Service Overview", "Sample Service Report", "Case Study",
              "Quote &amp; Site Scope Checklist", "Pest Prevention Guide",
              "Capability Statement"]
    inside_html = "".join(
        '<div style="width:50%%;display:flex;align-items:center;gap:16px;'
        'margin-bottom:15px"><span class="dot"></span>'
        '<span style="font-size:22px;color:var(--ink-soft)">%s</span></div>' % i
        for i in inside)

    size = fit(c["tag"], "PARTNER PACK")
    inner = "".join([
        hero(c["key"], "tall"), frame(shard=False), logo(),
        '<div class="stack" style="left:96px;top:400px;width:900px">',
        '<div class="tagchip">%s</div>' % c["tag"],
        '<h1 style="font-size:%spx;margin-top:26px">'
        '<span class="red">%s</span><span class="ink">PARTNER PACK</span></h1>'
        % (size, c["tag"]),
        '<div class="rule"></div>',
        '<p style="font-size:28px;line-height:1.36;font-weight:600;'
        'color:var(--ink);max-width:660px">%s</p>' % c["cover_subhead"],
        '<p style="font-size:24px;line-height:1.46;color:var(--ink-soft);'
        'max-width:700px;margin-top:20px">%s</p>' % c["cover_body"],
        '</div>',
        '<div class="stack" style="left:88px;right:88px;top:1120px;display:flex;'
        'align-items:flex-start">%s</div>' % tiles,
        '<div class="stack" style="left:96px;right:96px;top:1408px">',
        '<div class="striphead"><span class="lbl dark">WHAT&rsquo;S INSIDE THIS PACK'
        '</span><span class="tail"></span></div>',
        '<div class="softbox" style="padding:28px 34px 13px;display:flex;'
        'flex-wrap:wrap">%s</div>' % inside_html,
        '</div>',
        strap(c["strap_lead"], c["strap_tail"]), feet(),
    ])
    return page(inner)


# ------------------------------------------------------------- page 2/7 * #
def service_overview(c):
    tiles = "".join(
        '<div style="flex:1;padding:0 18px;text-align:center;%s">'
        '<div style="display:flex;justify-content:center;margin-bottom:18px">%s</div>'
        '<h3 style="font-size:22px;line-height:1.18;margin-bottom:11px">%s</h3>'
        '<p style="font-size:18px;line-height:1.34;color:var(--grey)">%s</p></div>'
        % ("border-left:2px solid var(--line)" if i else "", ring(ic, 84, 42), t, b)
        for i, (t, b, ic) in enumerate(c["so_tiles"]))

    half = (len(c["areas11"]) + 1) // 2
    cols = "".join('<div style="width:50%%;padding-right:14px">%s</div>'
                   % li_ticks(chunk, "ticks xs", 24)
                   for chunk in (c["areas11"][:half], c["areas11"][half:]))

    steps = []
    for i, (t, b, ic) in enumerate(c["program"]):
        if i:
            steps.append('<div style="width:36px;text-align:center;color:var(--red);'
                         'font-size:30px;line-height:1;margin-top:34px;flex:none">'
                         '&rarr;</div>')
        steps.append(
            '<div style="flex:1;text-align:center">'
            '<div style="display:flex;justify-content:center;position:relative">'
            '<span style="position:absolute;top:-14px;left:50%%;margin-left:-42px;'
            'width:32px;height:32px;border-radius:50%%;background:var(--red);'
            'color:#fff;font-family:Oswald,sans-serif;font-size:20px;'
            'display:flex;align-items:center;justify-content:center;z-index:2">%s'
            '</span>%s</div>'
            '<h3 style="font-size:20px;margin:14px 0 8px">%s</h3>'
            '<p style="font-size:16px;line-height:1.34;color:var(--grey)">%s</p></div>'
            % (i + 1, ring(ic, 72, 36), t, b))

    size = fit(c["so_title_red"], c["so_title_ink"])
    inner = "".join([
        hero(c["key"]), frame(), logo(),
        '<div class="stack" style="left:96px;top:410px;width:820px">',
        h1(c["so_title_red"], c["so_title_ink"], size),
        '<div class="rule"></div>',
        '<p class="lede" style="max-width:580px">%s</p>' % c["so_body"],
        '</div>',
        '<div class="stack" style="left:84px;right:84px;top:1020px;display:flex;'
        'align-items:flex-start">%s</div>' % tiles,
        '<div class="stack" style="left:96px;top:1318px;width:520px">',
        '<div class="striphead"><span class="lbl dark">COMMON AREAS COVERED</span>'
        '</div>',
        '<div class="card" style="padding:24px 20px 10px;display:flex">%s</div>' % cols,
        '</div>',
        '<div class="stack" style="left:648px;right:96px;top:1318px">',
        '<div class="striphead"><span class="lbl dark">TYPICAL PROGRAM</span>'
        '<span class="tail"></span></div>',
        '<div class="card" style="padding:40px 22px 24px;display:flex;'
        'align-items:flex-start">%s</div>' % "".join(steps),
        '</div>',
        strap(c["so_footer_lead"], c["so_footer_tail"], bottom=204, one=True), feet(),
    ])
    return page(inner)


# ------------------------------------------------------------- page 3/7 * #
def sample_report(c):
    def field(ic, label, value):
        return ('<div style="flex:1;display:flex;align-items:center;gap:18px;'
                'padding:18px 22px;border-bottom:2px solid var(--line);height:104px">'
                '%s<span style="font-family:Oswald,sans-serif;font-weight:600;'
                'font-size:21px;letter-spacing:.04em;width:214px;flex:none">%s</span>'
                '<span style="font-size:21px;color:var(--ink-soft);line-height:1.28">'
                '%s</span></div>' % (ring(ic, 54, 28, 2.2), label, value))

    left = [("home", "PROPERTY:", c["sr_property"]),
            ("calendar", "DATE:", c["sr_date"]),
            ("termite", "SERVICE TYPE:", c["sr_service_type"])]
    right = [("person", "TECHNICIAN:", c["sr_technician"]),
             ("person", "SITE CONTACT:", c["sr_contact"]),
             ("clipboard", "REFERENCE / JOB NO.:", c["sr_job_no"])]
    rows = "".join('<div style="display:flex">%s<div style="width:2px;'
                   'background:var(--line)"></div>%s</div>' % (field(*l), field(*r))
                   for l, r in zip(left, right))

    def block(ic, title, items, h):
        return ('<div class="card" style="flex:1;height:%spx;padding:22px 28px 16px">'
                '<div style="display:flex;align-items:center;gap:18px;'
                'padding-bottom:12px;border-bottom:3px solid var(--red);'
                'margin-bottom:18px">%s<h2 style="font-size:28px">%s</h2></div>%s</div>'
                % (h, ring(ic, 58, 30, 2.2), title, li_bullets(items, "bullets xs")))

    size = fit("SAMPLE SERVICE", "REPORT SUMMARY")
    inner = "".join([
        hero(c["key"], "short"), frame(), logo(),
        '<div class="stack" style="left:96px;top:360px;width:900px">',
        '<div class="badge">EXAMPLE ONLY</div>',
        '<div style="margin-top:20px">%s</div>'
        % h1("SAMPLE SERVICE", "REPORT SUMMARY", size),
        '</div>',
        '<div class="stack card" style="left:96px;right:96px;top:652px;'
        'padding:0;overflow:hidden">%s</div>' % rows,
        '<div class="stack" style="left:96px;right:96px;top:986px;display:flex;'
        'gap:24px">%s%s</div>'
        % (block("search", "AREAS INSPECTED / TREATED", c["sr_areas"], 300),
           block("clipboard", "FINDINGS", c["sr_findings"], 300)),
        '<div class="stack" style="left:96px;right:96px;top:1302px;display:flex;'
        'gap:24px">%s%s</div>'
        % (block("check-circle", "ACTIONS COMPLETED", c["sr_actions"], 300),
           block("shield-mark", "RECOMMENDATIONS", c["sr_recs"], 300)),
        '<div class="stack card" style="left:96px;right:96px;top:1620px;'
        'padding:20px 28px;display:flex;align-items:center;gap:22px">%s'
        '<h2 style="font-size:28px">NEXT VISIT</h2>'
        '<div style="width:2px;height:48px;background:var(--line);margin:0 10px"></div>'
        '<span style="font-size:22px;color:var(--ink-soft)">Next service is '
        'recommended on or before <b>%s</b>.</span></div>'
        % (ring("calendar", 58, 30, 2.2), c["sr_next_visit"]),
        strap(c["strap_lead"], c["strap_tail"], bottom=192, cls="mid"), feet(),
    ])
    return page(inner)


# ------------------------------------------------------------- page 4/7 * #
def case_study(c):
    def col(n, ic, title, items, last=False):
        return ('<div style="flex:1;padding-right:22px;%s">'
                '<div style="display:flex;align-items:center;gap:16px;'
                'margin-bottom:20px">'
                '<span style="width:40px;height:40px;border-radius:50%%;'
                'background:var(--red);color:#fff;font-family:Oswald,sans-serif;'
                'font-size:24px;display:flex;align-items:center;'
                'justify-content:center;flex:none">%s</span>%s</div>'
                '<h2 style="font-size:29px;padding-bottom:11px;'
                'border-bottom:3px solid var(--red);margin-bottom:18px">%s</h2>%s</div>'
                % ("" if last else "border-right:2px solid var(--line)",
                   n, ring(ic, 76, 38), title, li_bullets(items, "bullets xs")))

    why = "".join('<p style="font-size:20px;line-height:1.42;color:var(--ink-soft);'
                  'margin-bottom:16px">%s</p>' % p for p in c["why_matters"])

    inner = "".join([
        hero(c["key"], "short"), frame(), logo(),
        '<div class="stack" style="left:96px;top:396px;width:840px">',
        '<h1 style="font-size:116px"><span style="color:var(--red)">CASE</span> '
        '<span style="color:var(--ink)">STUDY</span></h1>',
        '<p class="lede" style="margin-top:22px;max-width:545px">%s</p>'
        % c["case_subhead"],
        '</div>',
        '<div class="stack" style="left:96px;top:776px;width:548px;'
        'background:linear-gradient(150deg,var(--red),var(--red-dark));'
        'border-radius:12px;padding:28px 32px;display:flex;gap:22px;color:#fff">'
        '<span style="flex:none;color:#fff">%s</span>'
        '<p style="font-size:20px;line-height:1.42">%s</p></div>'
        % (icon("shield-mark", 54, stroke=1.9), c["case_intro"]),
        '<div class="stack" style="left:96px;right:530px;top:1082px;display:flex">'
        '%s%s%s</div>'
        % (col(1, "search", "THE CHALLENGE", c["challenges"]),
           col(2, "clipboard-check", "THE SOLUTION", c["solutions"]),
           col(3, "shield-tick", "THE RESULT", c["results"], last=True)),
        '<div class="stack softbox" style="right:92px;top:1070px;width:376px;'
        'padding:28px 30px;background:#F2F2F2">'
        '<h2 style="font-size:28px;color:var(--red);margin-bottom:16px">'
        'WHY THIS MATTERS</h2>'
        '<div style="display:flex;justify-content:center;margin-bottom:20px">%s</div>'
        '%s'
        '<div style="border-top:2px solid #DADADA;padding-top:18px">'
        '<p style="font-style:italic;font-weight:600;font-size:22px;'
        'line-height:1.34;color:var(--ink)">'
        '<span style="color:var(--red);font-size:28px">&ldquo;</span>%s'
        '<span style="color:var(--red);font-size:28px">&rdquo;</span></p>'
        '<p style="font-size:20px;color:var(--red);margin-top:12px">&mdash; %s</p>'
        '</div></div>'
        % (ring("people-gear", 82, 42), why, c["quote"], c["attribution"]),
        strap(c["cta_lead"], c["cta_tail"], bottom=196, cls="mid"), feet(),
    ])
    return page(inner)


# ------------------------------------------------------------- page 5/7 * #
def quote_scope(c):
    def card(num, ic, title, body, height):
        return ('<div class="card" style="flex:1;height:%spx;padding:0 0 20px;'
                'overflow:hidden">'
                '<div style="display:flex;align-items:center;gap:18px;'
                'padding:20px 24px 0">'
                '<span style="width:58px;height:58px;border-radius:10px;'
                'background:var(--red);color:#fff;display:flex;align-items:center;'
                'justify-content:center;flex:none">%s</span>'
                '<span style="background:var(--red);color:#fff;'
                'font-family:Oswald,sans-serif;font-weight:600;font-size:25px;'
                'letter-spacing:.07em;padding:9px 38px 8px 20px;'
                'clip-path:polygon(0 0,100%% 0,92%% 100%%,0 100%%)">%s. %s</span></div>'
                '<div style="padding:22px 28px 0">%s</div></div>'
                % (height, icon(ic, 32, stroke=2.1), num, title, body))

    line = ('<div style="display:flex;align-items:flex-end;gap:16px;margin-bottom:20px">'
            '<span style="font-size:21px;color:var(--ink-soft);width:186px;flex:none">'
            '%s</span><span style="flex:1;border-bottom:2px solid #C9C9C9;'
            'height:24px"></span></div>')
    prop = "".join([line % c["site_label"], line % "Site address:", line % "&nbsp;",
                    line % "Contact person:", line % "Phone:", line % "Email:"])

    half = (len(c["areas9"]) + 1) // 2
    areas = ('<div style="display:flex;gap:18px">'
             '<div style="width:50%%">%s</div><div style="width:50%%">%s</div></div>'
             % (checkboxes(c["areas9"][:half]), checkboxes(c["areas9"][half:])))

    notes = "".join('<div style="border-bottom:2px solid #C9C9C9;height:48px"></div>'
                    for _ in range(3))

    inner = "".join([
        hero(c["key"], "short"), frame(), logo(True),
        '<div class="stack" style="left:96px;top:352px;width:980px">',
        '<h1 style="font-size:92px"><span style="color:var(--red)">QUOTE REQUEST</span>'
        '<span style="color:var(--ink)"> &amp;</span>'
        '<span class="ink">SITE SCOPE CHECKLIST</span></h1>',
        '<p style="font-size:23px;line-height:1.4;color:var(--ink-soft);'
        'max-width:640px;margin-top:22px">%s</p>' % c["quote_subhead"],
        '</div>',
        '<div class="stack" style="left:96px;right:96px;top:640px;display:flex;'
        'gap:24px">%s%s</div>'
        % (card(1, "building", "PROPERTY DETAILS", prop, 372),
           card(2, "notes", "SCOPE OF WORKS", checkboxes(c["scope6"]), 372)),
        '<div class="stack" style="left:96px;right:96px;top:1040px;display:flex;'
        'gap:24px">%s%s</div>'
        % (card(3, "key", "ACCESS &amp; SITE NOTES", checkboxes(c["access6"]), 372),
           card(4, "focus", "AREAS TO INCLUDE", areas, 372)),
        '<div class="stack" style="left:96px;right:96px;top:1450px">',
        '<div class="striphead"><span class="lbl dark" style="display:flex;'
        'align-items:center;gap:14px">%s ADDITIONAL NOTES / SITE CONSIDERATIONS'
        '</span></div>' % icon("notes", 28, stroke=2.1),
        '<div class="card" style="padding:20px 28px 10px">%s</div>' % notes,
        '</div>',
        strap("Ready to price your site?",
              "%s %s" % (c["cta_lead"], c["cta_tail"]), bottom=196, cls="tight"),
        feet(),
    ])
    return page(inner)


# ------------------------------------------------------------- page 6/7 * #
def prevention_guide(c):
    tips = "".join('<li style="border-bottom:2px solid var(--line);'
                   'padding-bottom:15px">%s</li>' % t for t in c["tips"])
    pests = ["termite", "rodent", "ant", "wasp", "fly", "clipboard-alert"]
    urgent = "".join(
        '<div style="display:flex;align-items:center;gap:24px;padding:15px 0;'
        'border-bottom:2px solid var(--line)">%s'
        '<p style="font-size:22px;line-height:1.32;color:var(--ink-soft)">%s<br>%s</p>'
        '</div>' % (ring(ic, 70, 36, 2.1), a, b)
        for (a, b), ic in zip(c["urgent"], pests))

    size = fit(c["pg_title_red"], "PEST PREVENTION", "GUIDE")
    inner = "".join([
        hero(c["key"], "short"), frame(), logo(),
        '<div class="stack" style="left:96px;top:404px;width:800px">',
        '<h1 style="font-size:%spx"><span class="red">%s</span>'
        '<span class="ink">PEST PREVENTION</span><span class="ink">GUIDE</span></h1>'
        % (size, c["pg_title_red"]),
        '<div class="rule"></div>',
        '<p class="lede" style="max-width:550px">%s</p>' % c["pg_subhead"],
        '</div>',
        '<div class="stack" style="left:96px;top:962px;width:580px">',
        '<div class="striphead"><span class="lbl">EVERYDAY TIPS</span>'
        '<span class="tail"></span></div>',
        '<ul class="bullets" style="padding-top:8px">%s</ul>' % tips,
        '<div class="softbox" style="margin-top:22px;padding:24px 26px;display:flex;'
        'gap:22px;align-items:flex-start">'
        '<span style="color:var(--red);flex:none">%s</span><div>'
        '<h3 style="font-size:25px;color:var(--red);margin-bottom:9px">NEED HELP?</h3>'
        '<p style="font-size:20px;line-height:1.38;color:var(--ink-soft)">%s</p>'
        '</div></div>'
        % (icon("shield-mark", 58, stroke=1.9), c["need_help"]),
        '</div>',
        '<div class="stack" style="left:724px;right:96px;top:962px">',
        '<div class="striphead"><span class="lbl">URGENT ISSUES TO REPORT QUICKLY'
        '</span></div>',
        '<div style="padding-top:4px">%s</div>' % urgent,
        '</div>',
        strap(c["strap_lead"], c["strap_tail"], bottom=196, cls="mid"), feet(),
    ])
    return page(inner)


# ------------------------------------------------------------- page 7/7 * #
def capability(c):
    tiles = "".join(
        '<div style="flex:1;padding:0 20px;text-align:center;%s">'
        '<div style="display:flex;justify-content:center;margin-bottom:16px">%s</div>'
        '<h3 style="font-size:22px;line-height:1.16;margin-bottom:10px">%s</h3>'
        '<p style="font-size:18px;line-height:1.34;color:var(--grey)">%s</p></div>'
        % ("border-left:2px solid var(--line)" if i else "", ring(ic, 82, 42), t, b)
        for i, (t, b, ic) in enumerate(c["cap_tiles"]))

    inner = "".join([
        hero(c["key"]), frame(), logo(),
        '<div class="stack" style="left:96px;top:402px;width:820px;display:flex;'
        'gap:26px">'
        '<div style="width:9px;background:var(--red);border-radius:3px"></div>'
        '<h1 style="font-size:118px"><span class="red">CAPABILITY</span>'
        '<span class="ink">STATEMENT</span></h1></div>',

        '<div class="stack" style="left:96px;top:700px;width:566px">',
        '<div style="display:flex;align-items:center;gap:18px;margin-bottom:18px">'
        '<span style="color:var(--red)">%s</span>'
        '<h2 style="font-size:31px">COMPANY OVERVIEW</h2></div>'
        % icon("shield-mark", 46, stroke=2.0),
        '<p style="font-size:22px;line-height:1.45;color:var(--ink-soft)">%s</p>'
        % c["cap_overview"],
        '<div style="display:flex;align-items:center;gap:18px;margin:34px 0 18px">'
        '<span style="color:var(--red)">%s</span>'
        '<h2 style="font-size:31px">CORE CAPABILITIES</h2></div>'
        % icon("target", 46, stroke=2.0),
        li_ticks(c["core"], "ticks sm", 24),
        '</div>',

        '<div class="stack softbox" style="right:96px;top:690px;width:620px;'
        'padding:32px 34px;background:#F2F2F2">'
        '<div style="display:flex;align-items:flex-start;gap:22px">%s<div>'
        '<h2 style="font-size:30px;margin-bottom:14px">SNAPSHOT</h2>%s</div></div>'
        '<div style="border-top:2px solid #DADADA;margin:24px 0"></div>'
        '<div style="display:flex;align-items:flex-start;gap:22px">%s<div>'
        '<h2 style="font-size:30px;margin-bottom:14px">WHY CLIENTS CHOOSE US</h2>%s'
        '</div></div></div>'
        % (ring("clipboard", 82, 42), li_bullets(c["snapshot"], "bullets xs"),
           ring("shield-tick", 82, 42), li_ticks(c["why"], "ticks sm", 24)),

        '<div class="stack" style="left:84px;right:84px;top:1436px;display:flex;'
        'align-items:flex-start;border-top:2px solid var(--line);padding-top:34px">'
        '%s</div>' % tiles,

        '<div class="strap one tight" style="bottom:202px">'
        '<span style="color:var(--red);flex:none">%s</span>'
        '<div class="txt">%s <span class="r">%s</span></div>'
        '<div class="dash"></div></div>'
        % (icon("shield-mark", 58, stroke=1.9), c["cta_lead"], c["cta_tail"]),
        feet(),
    ])
    return page(inner)


PAGES = [cover, service_overview, sample_report, case_study, quote_scope,
         prevention_guide, capability]


def document(c):
    body = "".join(fn(c) for fn in PAGES)
    return ('<!doctype html><html lang="en-AU"><head><meta charset="utf-8">'
            '<title>Slug-A-Bug Partner Pack &mdash; %s</title>'
            '<link rel="stylesheet" href="../assets/pack.css"></head>'
            '<body>%s</body></html>' % (c["industry"], body))
