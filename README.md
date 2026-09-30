# Presentation Skill

**Out of time, out of tokens, and the layout keeps breaking? Build the deck as a single HTML file.**

You have a presentation to deliver in an hour. The design tool has used up your credits. The slide editor will not keep right-to-left text in order. This project gives you a third option: a finished, large-screen presentation template, and an AI skill that fills it from your documents — in one file, with no account, no subscription and no software to install.

## Why this approach

- **It is just a file.** One `.html` file opens in any browser, works offline and can be copied to a USB stick, emailed or hosted anywhere.
- **It is easy to change.** Every color, the font, the logo and its position, the language and text direction, the slide count and even the skill's own rules are settings you can override — by hand, in a short configuration file, or simply by asking Claude.
- **Right-to-left is built in.** Hebrew, Arabic and other RTL languages mirror the layout, logo slot, arrow keys and swipe direction automatically. See [`examples/hebrew-example.html`](examples/hebrew-example.html).
- **Made for large screens.** A fixed 1920×1080 canvas scales to any display, with text sized for reading from across a room.
- **Cheap to iterate.** Fixing a slide means editing a few lines of text, not regenerating a design. Small corrections cost very few tokens.
- **Checks itself.** A built-in checklist and an automated audit catch overflow, missing images, broken navigation and PDF problems before you walk on stage.

### What to expect

This is not a one-click generator. A first draft from a good brief is usually close, and two or three short iterations ("shorten slide 4", "make the cover dark", "swap these two sections") bring it to a finished state. The skill is designed so that those iterations are fast and inexpensive.

## Quick start

**With an AI assistant (recommended).** Install the skill from [`skills/html-presentation/`](skills/html-presentation/SKILL.md) and ask for a presentation. Claude asks who the audience is, how many slides you need and whether to show the presenter's name, then asks for your source documents and builds the deck. Details below.

**By hand.**

```bash
cp template.html my-talk.html
open my-talk.html        # or double-click it
```

Replace the slides inside `<div id="deck">`. Navigation, progress dots and the counter update automatically.

| Key / gesture | Action |
|---|---|
| `→` / `Space` / `PageDown` | Next slide (arrow direction follows the reading direction) |
| `←` / `PageUp` | Previous slide |
| `Home` / `End` | First / last slide |
| `F` | Toggle fullscreen |
| Swipe | Next / previous |

## Using the AI skill

```
skills/html-presentation/
├── SKILL.md                      # workflow and rules
└── references/
    ├── design-system.md          # tokens, modes, components, known traps
    ├── slide-templates.md        # copy-paste HTML for each slide type
    ├── technical-patterns.md     # pipelines, cost tables, security/architecture slides
    └── verification-checker.md   # checklist and self-repair runbook
```

Install it the way your tool loads skills: for Claude Code, copy the folder to `.claude/skills/` (project) or `~/.claude/skills/` (global); for Claude.ai or Cowork, add it under *Settings → Skills*.

### How a session goes

1. You ask for a presentation.
2. Claude asks three questions before building anything:
   - who the audience is and what they should do afterwards;
   - how many slides you need;
   - whether the presenter's name should appear on the cover, and what it is.
3. You answer, then attach whatever source material you like — documents, PDFs, notes, data, links, images — or state that there is none.
4. Claude builds the deck from `template.html`, fitted to the audience and slide count, and runs its checklist.
5. You refine it in plain language.

Questions already answered in your first message, or set in `assets/brand.md` (`audience`, `author`, `slides`), are not asked again.

### Keep your best result as a reference

When you are satisfied with a deck, save it as a reference for the next ones. Claude then matches its design (layout choices, which modes go where, density, spacing) and its language (tone, terminology, headline style) instead of starting from the generic template.

- Copy the file to `assets/references/decks/`, or tell Claude *"save this as a reference deck"*.
- Optionally add notes to `assets/brand.md`, for example *"formal tone, headlines under eight words, dark cover"*.
- With several references, Claude names the one it will follow and you may choose another.

A reference deck guides style only; its content is never copied, and your explicit instructions always take precedence.

## Making it yours

Nothing is fixed. Colors, font, logo, logo position, language, slide counts, density limits and the skill's reference files are defaults.

**Ask Claude.** Place brand material in [`assets/`](assets/README.md) — a logo, a palette or style screenshot, a brand guide, fonts — and say *"Adapt this project to the assets I added."* Claude reads them, chooses a palette, sets the logo and updates the template, then reports what changed.

**Write a short configuration.** Copy [`assets/brand.example.md`](assets/brand.example.md) to `assets/brand.md` and set only what you care about: colors, font, `logo_position`, `slides`, `max_bullets`, `emoji`, which reference files to use, which checks to skip. Anything omitted keeps its default.

**Edit by hand.** Everything lives in the `:root` block of `template.html`:

```css
--c1 … --c6, --ink, --bg, --font      /* theme */
--logo, --logo-dark, --logo-w/-h      /* logo image and size */
```
```html
<div id="deck" data-logo="top-end">  <!-- top-end | top-start | top-center | bottom-start | bottom-end | bottom-center | none -->
```

`start` and `end` follow the reading direction, so the logo mirrors automatically in RTL decks.

**Replace the skill's rules.** The skill's rules live in `skills/html-presentation/references/`. To change them without editing the skill, put files in `assets/references/`: a file with the same name replaces the default, a new file is added. Order of precedence: your request → `assets/brand.md` → `assets/references/` → skill defaults.

## Design in one minute

- **Canvas:** fixed 1920×1080, scaled to fit any screen.
- **Three visual modes**, one per slide:
  - `aurora` — light, soft gradients; the default for reading content.
  - `dark` — deep background with colored glow; covers, dividers, strong statements.
  - `clean-bordered` — white with a gradient frame (`.accent-border`); tables and data.
- **Components:** `.glass` and `.inkcard` surfaces, `.eyebrow` label, `.title` / `.sub`, `.take` takeaway strip, `.numchip`, bars, big numbers.
- **Language:** English and left-to-right by default. For RTL languages set `<html dir="rtl" lang="…">` and change the font.

Full reference: [`docs/design-system.md`](docs/design-system.md) and [`docs/guidelines.md`](docs/guidelines.md), including guidance for TVs and projectors.

## Export to PDF

Open the deck in Chrome → `Ctrl/Cmd + P` → Destination *Save as PDF*, Layout *Landscape*, Margins *None*, enable *Background graphics*. You get one page per slide.

## Audit your deck

`tools/audit-deck.js` opens a deck in Chromium and checks what a script can check: JavaScript errors, broken images and missing `alt`, keyboard navigation, reduced-motion and print rules, offline safety, RTL term isolation, text size for large screens, overflow on every slide at several screen sizes, and that PDF export gives one page per slide.

```bash
npm i -D playwright
node tools/audit-deck.js template.html examples/hebrew-example.html
```

It also works on single-file decks not built from this template, as long as slides are `.page` or `.slide` elements and the visible one has `.active`. It exits with code 1 on any failure, so it can run in CI. CI in this repository runs [`html-validate`](https://html-validate.org) on every HTML file; locally, use `npx html-validate "*.html"`.

## Project layout

```
.
├── template.html          # starter deck — copy this
├── examples/              # hebrew-example.html — RTL deck built from the template
├── assets/                # your logo, brand.md, references/, images (see assets/README.md)
├── docs/                  # design system + authoring guidelines
├── tools/audit-deck.js    # automated deck audit (Playwright)
├── skills/html-presentation/
└── .github/workflows/     # HTML validation on push / PR
```

## License

[MIT](LICENSE)
