# Brand & project configuration

Copy this file to `assets/brand.md` and edit. Every key is optional; anything you leave out falls back to the skill defaults. Claude reads this file before building or adapting a deck. Free text below the keys is treated as extra instructions.

```yaml
# Language
lang: en            # e.g. he, ar, fr
dir: ltr            # ltr | rtl

# Theme (overrides the :root tokens in template.html)
colors:
  c1: "#6366F1"
  c2: "#8B5CF6"
  c3: "#EC4899"
  c4: "#F59E0B"
  c5: "#06B6D4"
  c6: "#10B981"
  ink: "#0F172A"
  bg: "#F8FAFC"
  highlight: "#F59E0B"
font: "Inter"       # a Google Fonts family, or a font file placed in assets/

# Logo
logo: assets/logo.svg
logo_dark: assets/logo-light.svg   # optional variant for dark slides
logo_position: top-end             # top-end | top-start | top-center | bottom-start | bottom-end | bottom-center | none
logo_size: [200, 56]               # width, height in px

# Structure
slides: [8, 14]                    # min, max slides for a generated deck
max_bullets: 5
max_stats: 3
max_steps: 5
modes: [aurora, dark, clean-bordered]   # which visual modes may be used

# Reference files (see "Reference resolution" in SKILL.md)
references:
  disable: []                      # e.g. [technical-patterns] to ignore a default file
  extra: []                        # additional files, e.g. [assets/references/my-charts.md]

# Checker
checks_off: []                     # e.g. [C5] for a deck with no RTL
```

## Notes for Claude

Write anything here that does not fit the keys: tone of voice, words to avoid, how formal the deck should be, which slide types the team prefers.
