---
name: html-presentation
description: >-
  Create, format, update, or verify slide decks as self-contained HTML files (1920x1080, keyboard navigation, print-to-PDF). Activate whenever the user asks for a presentation, slides, deck, training material, or executive briefing, or provides a document, PDF, or brief to turn into slides.
---

# HTML Presentation Builder

Turn a brief, document or topic into a polished, interactive, print-ready HTML deck built on the repository's `template.html`.

The skill is organised in four layers:

1. **Rules** — theme tokens, typography, language direction, no emoji.
2. **Doer** — turn content into a tight narrative of 8–14 slides.
3. **Formatter** — apply the exact CSS tokens, 1920×1080 canvas and tested slide components.
4. **Checker** — run a binary checklist and repair failures before handing the file back.

## Configuration and reference resolution

Nothing in this skill is fixed. Colors, fonts, logo, logo position, language, slide counts, density limits, visual modes, the reference files themselves and the checks are all defaults the user can change.

**Precedence, highest first:**

1. What the user says in the current request.
2. `assets/brand.md` — structured settings plus free-text rules (schema: [`assets/brand.example.md`](../../assets/brand.example.md)).
3. `assets/references/` — the user's own reference files.
4. This skill's `references/` — the defaults.

**Reference files:**

- Default files: [design-system](./references/design-system.md) (tokens, modes, components, traps), [slide-templates](./references/slide-templates.md) (copy-paste slides), [technical-patterns](./references/technical-patterns.md) (architecture, cost, security slides), [verification-checker](./references/verification-checker.md) (checklist and repair).
- A file in `assets/references/` with the **same name** as a default replaces it.
- A file with a **new name** is additional; read it whenever its topic applies (e.g. `assets/references/chart-styles.md`).
- `references.disable` in `brand.md` drops a default file entirely; `references.extra` lists further files to load.
- Read only what the task needs, and say which files you used when the choice was not obvious.

If the user asks for something the defaults forbid (another font, six bullets, no logo, a fourth visual mode), follow the user, apply it consistently across the deck, and mention the deviation in the report instead of "fixing" it.

## Reference decks

A reference deck is a finished deck the user was happy with. It carries the look (layout choices, which modes go where, density, spacing) and the language (tone, terminology, headline style, sentence length) they want next time.

- Look in `assets/references/decks/` (and any path listed under `reference_decks` in `brand.md`).
- When building a new deck, read the most relevant reference deck and match its design decisions and voice. Do not copy its content.
- The reference deck outranks the skill's default templates on style questions; explicit user instructions outrank it.
- After delivering a deck, if the user says they are happy with it, offer to save it to `assets/references/decks/<name>.html` and to record any notes ("formal tone, short headlines, dark cover") in `assets/brand.md`.

## Workflow

### 0. Load configuration and adapt to assets (first run, or when `assets/` changes)

1. Read `assets/brand.md` if present, list `assets/references/`, and look at other files in `assets/` beyond the placeholders.
2. If the user supplied brand material (logos, palette or style screenshots, brand guide PDFs, fonts) but no explicit values, derive the theme: `--c1`…`--c6` from the brand's accent colors, `--ink`/`--ink-2` from the darkest, `--bg`/`--bg-2` from the lightest, `--font` from the named font. Keep text/background contrast high.
3. Apply settings by editing only the `:root` block and the `data-logo` attribute of `template.html`:
   - colors and `--font`;
   - `--logo`, `--logo-dark`, `--logo-w`, `--logo-h`, `--logo-offset-*`;
   - `data-logo` on `#deck`: `top-end` (default), `top-start`, `top-center`, `bottom-start`, `bottom-end`, `bottom-center` or `none`;
   - `lang`/`dir` on `<html>`.
   Logo preparation: use a transparent PNG or SVG cropped to the mark. If the supplied file is a raster image with an opaque background (for example gold on black), cut out the mark and convert the background to transparency (luminance-to-alpha works for dark backgrounds); drop placeholder text such as "Your tagline here". Check the result on a light and a dark slide.
   Dark slides: if `--accent` starts with a dark shade, set a lighter `--accent-on-dark` so gradient text stays readable on `.dark` slides.
4. If the defaults in `references/` now disagree with the configuration (palette values, logo position, limits), update the copy the user keeps — `assets/references/` — rather than silently diverging. Edit the skill's own default files only if the user asks.
5. Render the template, look at a light and a dark slide, fix contrast or overlap problems, and report which settings changed and why.

Skip this step if `assets/` holds only the placeholders and the user gave no settings.

### 1. Intake — ask before building

Start every new deck by asking the user these questions, in one message:

1. **Audience** — who will see it (role, seniority, prior knowledge), and what should they do or decide afterwards?
2. **Length** — how many slides?
3. **Author** — should the presenter's name appear? If yes, the name (and optionally role/date) for the cover byline.

Rules:

- Skip any question the user already answered in their request or in `assets/brand.md` (`slides`, `author`, `show_author`), and never ask twice. If everything is answered, go straight to step 2.
- If the session cannot ask interactively, state the defaults you are assuming (general audience, 8–14 slides, no author) and continue.
- Once answered, ask the user to attach or paste the source material — documents, PDFs, notes, data, links, images — or to say there is none and the deck should be written from the brief alone. Wait for it.
- Check for **reference decks** (see "Reference decks" below) and tell the user which one you will match for design and language; let them pick another or none.
- Confirm a one-line summary (audience, slide count, author, sources) only if something was ambiguous; otherwise proceed.

### 2. Plan the narrative (Doer)

1. Read every attached document plus the intake answers. Fit depth, vocabulary and examples to the audience; identify the goal and the one takeaway.
2. Outline exactly the number of slides the user asked for (if none: 8–14, or the `slides` range in `brand.md`), one idea each. A typical flow:
   - Cover
   - Context / problem
   - Approach or architecture
   - Evidence: data, costs, results
   - Steps, implementation, risks
   - Summary / next steps
3. Write headlines that state the point, not the topic.

### 3. Choose a visual mode per slide (Formatter)

- `.page.aurora` — default for anything meant to be read.
- `.page.dark` — cover, section dividers, bold statements.
- `.page.clean-bordered` with `.accent-border` — tables and data matrices.

### 4. Build the file

1. Start from `template.html`; keep its CSS core, navigation markup and `<script>` untouched.
2. Set `<title>`, and `lang`/`dir` on `<html>` for the deck's language (`dir="rtl"` for Hebrew, Arabic, etc.).
3. Replace the example slides inside `<div id="deck">`. Label each `<!-- SLIDE N: title -->`.
4. Every slide carries an empty logo slot `<div class="wm" role="img" aria-label="Logo"></div>` (image and position come from the tokens; use `data-logo="none"` for no logo) and at least one accent element (`.spec`, `.specbar`, `.dot` or `.accent-border`).
5. Use theme tokens (`var(--c1)`…) instead of hex values. If the user wants a different palette, change the `:root` block only.
6. If the author should be shown, add `<div class="byline">Name · role · date</div>` to the cover only.
7. Save to the workspace root with a descriptive kebab-case name, e.g. `q3-product-review.html`. Images go in `assets/`.

### 5. Verify and repair (Checker)

Run the effective checklist (the default `verification-checker.md`, or the user's override, minus any `checks_off`). If Node and Chromium are available, also run `node tools/audit-deck.js <file>` and fix every FAIL. If any item fails, fix the file and re-check before presenting it. Report the result as a short PASS/FAIL list.

## Content rules

- Default limits: ~5 bullets, ~3 stats, ~5 steps per slide (`max_*` in `brand.md` overrides); split otherwise.
- No emoji by default — use `.dot`, `.numchip`, `.chip`. If the user's configuration or reference deck uses emoji (`emoji: allowed` in `brand.md`), follow it.
- In RTL decks wrap Latin terms, code and unit-bearing numbers in `<span dir="ltr">…</span>`.
- Keep one idea and one takeaway per slide; the `.take` strip holds it.
