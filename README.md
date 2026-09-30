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
| `PageDown` / `PageUp` | Next / previous slide |
| `Home` / `End` | First / last slide |
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
- **Logo slot:** an empty `.wm` on every slide; the image, size and position come from `--logo*` tokens and `data-logo` (see [Making it yours](#making-it-yours)).
- **Language:** English/LTR by default. For Hebrew, Arabic and other RTL languages set `<html dir="rtl" lang="…">` and change the font; the layout, logo slot, arrow keys and swipe mirror automatically. See [`examples/hebrew-example.html`](examples/hebrew-example.html).

Full reference: [`docs/design-system.md`](docs/design-system.md) and [`docs/guidelines.md`](docs/guidelines.md).

## Making it yours

Nothing is fixed. Colors, font, logo, logo position, language, slide counts, density limits and even the skill's reference files are defaults you can override.

**Quick way** — put brand material in [`assets/`](assets/README.md) (logo, palette or style screenshots, brand guide, fonts) and ask Claude: *"Adapt this project to the assets I added."* Claude reads them, picks a palette, sets the logo and updates the template, then shows you what changed.

**Explicit way** — copy [`assets/brand.example.md`](assets/brand.example.md) to `assets/brand.md` and set only what you care about: colors, font, `logo_position`, `slides`, `max_bullets`, which reference files to use, which checks to skip. Anything you omit keeps its default.

**By hand** — everything lives in the `:root` block of `template.html`:

```css
--c1 … --c6, --ink, --bg, --font      /* theme */
--logo, --logo-dark, --logo-w/-h      /* logo image and size */
```
```html
<div id="deck" data-logo="top-end">  <!-- top-end | top-start | top-center | bottom-start | bottom-end | bottom-center | none -->
```

`start`/`end` follow the reading direction, so the logo mirrors automatically in RTL decks.

**Your own reference files** — the skill's rules live in `skills/html-presentation/references/`. To change them without editing the skill, put files in `assets/references/`: a file with the same name replaces the default, a new file is added. Order of precedence: your request → `assets/brand.md` → `assets/references/` → skill defaults.

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

Its defaults are overridable (see above). Install it the way your tool loads skills — for Claude Code, copy the folder to `.claude/skills/` (project) or `~/.claude/skills/` (global); for Claude.ai / Cowork, add it under *Settings → Skills*.

### How a session goes

1. You ask for a presentation.
2. Claude **asks three questions** before building anything:
   - who is the audience and what should they do afterwards;
   - how many slides;
   - whether the presenter's name should appear on the cover (and what it is).
3. You answer, then **attach whatever source material you want** — documents, PDFs, notes, data, links, images — or say there is none.
4. Claude builds the deck from `template.html`, fitted to the audience and the slide count, and runs its checklist.
5. You iterate in plain language ("shorten slide 4", "make the cover dark").

Questions you already answered in your first message, or set in `assets/brand.md` (`audience`, `author`, `slides`), are not asked again.

### Keep your best result as a reference

When you get a deck you are happy with, **save it as a reference for the next ones**. Claude then matches its design (layout choices, which modes go where, density, spacing) and its language (tone, terminology, headline style) instead of starting from the generic template.

- Copy the file to `assets/references/decks/` — or just tell Claude *"save this as a reference deck"*.
- Optionally add notes to `assets/brand.md`, e.g. *"formal tone, headlines under eight words, dark cover"*.
- With several references, Claude names the one it will follow and you can pick another.

A reference deck guides style only; its content is never copied. Your explicit instructions always win over it.

## Project layout

```
.
├── template.html          # starter deck — copy this
├── assets/                # your logo, brand.md, references/, images (see assets/README.md)
├── examples/              # hebrew-example.html — RTL deck built from the template
├── docs/                  # design system + authoring guidelines
├── tools/audit-deck.js    # automated deck audit (Playwright)
├── skills/html-presentation/
└── .github/workflows/     # HTML validation on push / PR
```

## Audit your deck

`tools/audit-deck.js` opens a deck in Chromium and checks what a script can check: JS errors, broken images and missing `alt`, keyboard navigation, reduced-motion and print rules, offline-safety (no runtime CDN script), RTL term isolation, overflow on every slide at several screen sizes, and that PDF export gives one page per slide.

```bash
npm i -D playwright
node tools/audit-deck.js template.html examples/hebrew-example.html
```

It also works on single-file decks not built from this template, as long as slides are `.page` or `.slide` elements and the visible one has `.active`. Exit code 1 on any FAIL, so it can run in CI.

## Validation

CI runs [`html-validate`](https://html-validate.org) on every `*.html` in the repo root. Run it locally with `npx html-validate "*.html"`.

## License

[MIT](LICENSE)
