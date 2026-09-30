# Presentation Skill

A template and an AI skill for building polished slide decks as **single, self-contained HTML files** — 1920×1080, keyboard/swipe navigation, three visual modes, and print-to-PDF out of the box. No build step, no dependencies beyond a web font.

You can use it two ways:

- **By hand** — copy `template.html`, swap the example slides for your own.
- **With an AI assistant** — install the skill in `skills/html-presentation/` and ask for a deck from a brief or document. The skill carries the design rules, slide patterns and a self-check so the output stays consistent.

## Quick start

```bash
cp template.html my-talk.html
open my-talk.html        # or double-click it
```

Replace the slides inside `<div id="deck">`. Navigation, dots and the counter update automatically.

| Key / gesture | Action |
|---|---|
| `→` / `Space` | Next slide (reversed in RTL decks) |
| `←` | Previous slide |
| `F` | Toggle fullscreen |
| Swipe | Next / previous |

## Design in one minute

- **Canvas:** fixed 1920×1080, scaled to fit any screen.
- **Three visual modes** — one per slide:
  - `aurora` — light, soft gradients; the default for reading content.
  - `dark` — deep background with colored glow; covers, dividers, strong statements.
  - `clean-bordered` — plain white with a gradient frame (`.accent-border`); tables and data.
- **Theme tokens** — every color lives in the `:root` block (`--c1`…`--c6`, `--ink`, `--muted`, `--bg`, …). Edit them once to re-skin the deck.
- **Components:** `.glass` and `.inkcard` surfaces, `.eyebrow` label, `.title` / `.sub`, `.take` takeaway strip, `.numchip`, bars, big numbers.
- **Logo slot:** `.wm` holds an optional logo on every slide. Replace `assets/logo-placeholder.svg` or delete the blocks.
- **Language:** English/LTR by default. For Hebrew, Arabic and other RTL languages set `<html dir="rtl" lang="…">` and change the font; the layout and navigation mirror automatically.

Full reference: [`docs/design-system.md`](docs/design-system.md) and [`docs/guidelines.md`](docs/guidelines.md).

## Export to PDF

Open the deck in Chrome → `Ctrl/Cmd + P` → Destination *Save as PDF*, Layout *Landscape*, Margins *None*, enable *Background graphics*. You get one page per slide.

## Using the AI skill

The skill lives in [`skills/html-presentation/`](skills/html-presentation/SKILL.md):

```
skills/html-presentation/
├── SKILL.md                      # workflow and rules
└── references/
    ├── design-system.md          # tokens, modes, components, known traps
    ├── slide-templates.md        # copy-paste HTML for each slide type
    ├── technical-patterns.md     # pipelines, cost tables, security/architecture slides
    └── verification-checker.md   # binary checklist + self-repair runbook
```

Install it the way your tool loads skills — for Claude Code, copy the folder to `.claude/skills/` (project) or `~/.claude/skills/` (global); for Claude.ai / Cowork, add it under *Settings → Skills*. Then ask, for example: *"Create a presentation from this document."* The skill plans 8–14 slides, builds the HTML from `template.html`, and runs its checklist before handing the file back.

## Project layout

```
.
├── template.html          # starter deck — copy this
├── assets/                # logo placeholder and your images
├── docs/                  # design system + authoring guidelines
├── skills/html-presentation/
└── .github/workflows/     # HTML validation on push / PR
```

## Validation

CI runs [`html-validate`](https://html-validate.org) on every `*.html` in the repo root. Run it locally with `npx html-validate "*.html"`.

## License

[MIT](LICENSE)
