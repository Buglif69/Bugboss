"""Inline SVG icon set drawn in the Slug-A-Bug flyer style.

Every glyph is a 24x24 stroke drawing using `currentColor`, so the same path
serves a black glyph in a red ring, a solid red mark, or a white knockout.
`icon(name, size, cls)` returns the <svg> markup.
"""

_P = {
    "stopwatch": """
      <circle cx="12" cy="13.5" r="7.5"/>
      <path d="M12 9.5v4l2.6 2"/>
      <path d="M9.5 2.5h5"/><path d="M12 2.5v3.5"/>
      <path d="M18.8 7.2l1.7-1.7"/>""",
    "shield-tick": """
      <path d="M12 2.6l7.4 2.9v6.1c0 4.4-3 8.1-7.4 9.8-4.4-1.7-7.4-5.4-7.4-9.8V5.5z"/>
      <path d="M8.4 12.1l2.6 2.6 4.6-5"/>""",
    "badge-tick": """
      <path d="M12 2.6l7.4 2.9v6.1c0 4.4-3 8.1-7.4 9.8-4.4-1.7-7.4-5.4-7.4-9.8V5.5z"/>
      <path d="M8.4 12.1l2.6 2.6 4.6-5"/>""",
    "shield-mark": """
      <path d="M12 2.6l7.4 2.9v6.1c0 4.4-3 8.1-7.4 9.8-4.4-1.7-7.4-5.4-7.4-9.8V5.5z"/>
      <circle cx="12" cy="9.4" r="1.9"/><circle cx="9.1" cy="13.6" r="1.9"/>
      <circle cx="14.9" cy="13.6" r="1.9"/>""",
    "people-gear": """
      <circle cx="8" cy="7.4" r="2.9"/><circle cx="16.4" cy="8.2" r="2.3"/>
      <path d="M2.9 15.6c0-2.5 2.3-4.1 5.1-4.1s5.1 1.6 5.1 4.1"/>
      <path d="M15 12c2.4 0 4.2 1.2 4.6 3"/>
      <circle cx="12" cy="19" r="2.4"/>
      <path d="M12 15.3v-1.1M12 22.7v-1.1M8.8 17.2l1 .5M14.2 20.3l1 .5M8.8 20.8l1-.5M14.2 17.7l1-.5"/>""",
    "report": """
      <rect x="4.4" y="3.4" width="15.2" height="18.2" rx="1.9"/>
      <path d="M9 3.4V2.2h6v1.2"/>
      <path d="M8.4 17.6V12M12 17.6V8.7M15.6 17.6v-3.4"/>""",
    "clipboard": """
      <rect x="4.4" y="3.4" width="15.2" height="18.2" rx="1.9"/>
      <path d="M9 3.4V2.2h6v1.2"/>
      <path d="M8.2 9.2h7.6M8.2 12.8h7.6M8.2 16.4h4.8"/>""",
    "clipboard-check": """
      <rect x="4.4" y="3.4" width="15.2" height="18.2" rx="1.9"/>
      <path d="M9 3.4V2.2h6v1.2"/>
      <path d="M7.8 9.3l1.5 1.5 2.6-2.7M7.8 14.4l1.5 1.5 2.6-2.7"/>
      <path d="M14.4 9.6h2.2M14.4 14.7h2.2"/>""",
    "clipboard-alert": """
      <rect x="4.4" y="3.4" width="15.2" height="18.2" rx="1.9"/>
      <path d="M9 3.4V2.2h6v1.2"/>
      <path d="M12 8.4v5"/><circle cx="12" cy="17" r=".9"/>""",
    "search": """
      <circle cx="10.6" cy="10.6" r="6.6"/>
      <path d="M15.4 15.4l4.5 4.5"/>
      <path d="M10.6 7.2v6.8M7.2 10.6h6.8"/>""",
    "target": """
      <circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="3.4"/>
      <path d="M12 1.6v4.2M12 18.2v4.2M1.6 12h4.2M18.2 12h4.2"/>""",
    "spray": """
      <rect x="7.2" y="9" width="8.4" height="12.4" rx="1.8"/>
      <path d="M9.6 9V5.6h4v3.4"/><path d="M13.6 6.6h3.2l1.6-2"/>
      <path d="M9.8 13.2h3.2"/>""",
    "refresh": """
      <path d="M20 12a8 8 0 0 1-13.6 5.7"/><path d="M4 12a8 8 0 0 1 13.6-5.7"/>
      <path d="M17.2 2.6v4h-4"/><path d="M6.8 21.4v-4h4"/>""",
    "home": """
      <path d="M3.4 10.6L12 3.4l8.6 7.2"/>
      <path d="M5.6 12.4v8.2h12.8v-8.2"/>
      <path d="M10 20.6v-5h4v5"/>""",
    "calendar": """
      <rect x="3.6" y="5" width="16.8" height="15.8" rx="2"/>
      <path d="M3.6 9.8h16.8"/><path d="M8.2 3.2v3.6M15.8 3.2v3.6"/>
      <path d="M7.6 13.4h2.2M14.2 13.4h2.2M7.6 17h2.2M14.2 17h2.2"/>""",
    "person": """
      <circle cx="12" cy="8.2" r="3.8"/>
      <path d="M4.8 20.6c0-3.9 3.2-6.4 7.2-6.4s7.2 2.5 7.2 6.4"/>""",
    "key": """
      <circle cx="7.8" cy="8.4" r="4.4"/>
      <path d="M10.9 11.5l8.7 8.7"/><path d="M16.4 16.9l2.1-2.1M18.6 19.1l1.9-1.9"/>""",
    "building": """
      <path d="M4.2 21.2V6.4L12 3.2l7.8 3.2v14.8"/>
      <path d="M2.6 21.4h18.8"/>
      <path d="M7.6 9.6h2.4M14 9.6h2.4M7.6 13.4h2.4M14 13.4h2.4"/>
      <path d="M10.2 21.2v-4.4h3.6v4.4"/>""",
    "notes": """
      <path d="M5 3.4h9.2l4.8 4.8v12.4H5z"/>
      <path d="M14 3.6v4.8h4.8"/>
      <path d="M8 12.6h8M8 16.2h5.6"/>""",
    "focus": """
      <path d="M3.4 10.4L12 3.6l8.6 6.8"/>
      <path d="M5.8 12v8.6h12.4V12"/>
      <circle cx="9.4" cy="15.4" r="1.5"/><circle cx="14.6" cy="15.4" r="1.5"/>
      <path d="M7.2 20.2c0-1.9 1-3 2.2-3M16.8 20.2c0-1.9-1-3-2.2-3"/>""",
    "check-circle": """
      <circle cx="12" cy="12" r="8.8"/><path d="M8 12.2l2.8 2.8 5.2-5.6"/>""",
    # --- pest glyphs -------------------------------------------------- #
    "termite": """
      <ellipse cx="12" cy="15.4" rx="3" ry="5.2"/>
      <ellipse cx="12" cy="9.2" rx="2.2" ry="2.4"/>
      <circle cx="12" cy="5.4" r="1.9"/>
      <path d="M10.4 4.2L8.6 2.6M13.6 4.2l1.8-1.6"/>
      <path d="M9 9.4L5.6 7.8M15 9.4l3.4-1.6M9 13.6L5.2 12.8M15 13.6l3.8-.8
               M9.4 18L6 19.4M14.6 18l3.4 1.4"/>""",
    "rodent": """
      <path d="M4 17.6c0-3.4 3.2-6 7.2-6 3.4 0 6 1.6 6 4"/>
      <path d="M4 17.6h11.6c1.6 0 2.6-1 2.6-2"/>
      <circle cx="18.4" cy="12.4" r="3.2"/>
      <circle cx="17.6" cy="11.6" r=".8"/>
      <circle cx="19.6" cy="8.6" r="2"/>
      <path d="M4 17.6c-1.4.6-2.4 1.8-2.4 3.2"/>
      <path d="M21 14.2l1.4 1"/>""",
    "ant": """
      <ellipse cx="16.6" cy="12" rx="3.6" ry="2.8"/>
      <ellipse cx="11.4" cy="12" rx="2" ry="1.8"/>
      <circle cx="7.4" cy="11.6" r="2.4"/>
      <path d="M6 9.6L4 7.2M8.6 9.2l1.4-2.6"/>
      <path d="M11.4 10.2L9.8 6.6M11.4 13.8L9.8 17.4M13.4 10.4l1-3.4
               M13.4 13.6l1 3.4M15.6 10.4l2.2-3M15.6 13.6l2.2 3"/>""",
    "wasp": """
      <ellipse cx="12" cy="15.6" rx="3" ry="4.6"/>
      <path d="M9.2 14h5.6M9.2 17h5.6"/>
      <ellipse cx="12" cy="9.6" rx="2.2" ry="2.2"/>
      <circle cx="12" cy="5.6" r="1.9"/>
      <path d="M10.5 4.3L8.8 2.6M13.5 4.3l1.7-1.7"/>
      <path d="M9.6 9.4C6.6 7.6 4 8.6 3.6 11c-.3 2 1.6 3 3.4 2.2"
            /><path d="M14.4 9.4c3-1.8 5.6-.8 6 1.6.3 2-1.6 3-3.4 2.2"/>
      <path d="M12 20.2v2"/>""",
    "fly": """
      <ellipse cx="12" cy="14.6" rx="2.8" ry="4"/>
      <circle cx="12" cy="8.4" r="2.6"/>
      <path d="M10.4 6.6L8.8 4.6M13.6 6.6l1.6-2"/>
      <path d="M9.6 12.4C6 10.4 2.8 11.6 2.6 14c-.2 2 2 2.8 4 1.6"/>
      <path d="M14.4 12.4c3.6-2 6.8-.8 7 1.6.2 2-2 2.8-4 1.6"/>
      <path d="M9.8 16.4h4.4M10.2 19h3.6"/>""",
}


def icon(name, size=48, cls="", stroke=2.0, color=None):
    body = _P[name].strip()
    style = ' style="color:%s"' % color if color else ""
    return (
        '<svg class="ico %s" width="%s" height="%s" viewBox="0 0 24 24" '
        'fill="none" stroke="currentColor" stroke-width="%s" '
        'stroke-linecap="round" stroke-linejoin="round"%s>%s</svg>'
        % (cls, size, size, stroke, style, body)
    )


def ring(name, ring_px=86, ico_px=44, stroke=2.0, ring_color=None):
    """Glyph inside the red outline circle used all through the pack."""
    extra = ";border-color:%s" % ring_color if ring_color else ""
    return ('<span class="ring" style="width:%spx;height:%spx%s">%s</span>'
            % (ring_px, ring_px, extra, icon(name, ico_px, stroke=stroke)))
