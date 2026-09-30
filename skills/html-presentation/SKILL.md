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

## Reference map

Read only what the task needs:

- Design tokens, modes, components, traps: [references/design-system.md](./references/design-system.md)
- Copy-paste slide HTML: [references/slide-templates.md](./references/slide-templates.md)
- Technical/architecture slide patterns: [references/technical-patterns.md](./references/technical-patterns.md)
- Verification checklist and repair runbook: [references/verification-checker.md](./references/verification-checker.md)

## Workflow

### 0. Adapt to brand assets (first run, or when `assets/` changes)

Check `assets/` for anything beyond `logo-placeholder.svg` and `README.md`. If the user added brand material:

1. Read it: logos, palette or style screenshots, brand guide PDFs, fonts, and `assets/brand.md` if present. Treat `brand.md` as constraints (forbidden colors, tone, language).
2. Derive the theme: pick `--c1`…`--c6` from the brand palette (accent hues first), `--ink`/`--ink-2` from the darkest brand color, `--bg`/`--bg-2` from the lightest, `--font` from the named font. Keep text/background contrast high.
3. Edit only the `:root` block in `template.html`, then mirror the new values in `references/design-system.md` and, if they appear, `docs/design-system.md`.
4. Point every `.wm` logo at the user's file. For `dark` slides use a light logo variant if provided, else keep the `filter:brightness(0) invert(1)` trick for single-color marks.
5. Render the template, look at a light and a dark slide, fix contrast problems, and report which tokens changed and why.

Skip this step if `assets/` holds only the placeholder.

### 1. Plan the narrative (Doer)

1. Read the brief, PDF or notes. Identify audience, goal and the one takeaway.
2. Outline **8–14 slides**, one idea each. A typical flow:
   - Cover
   - Context / problem
   - Approach or architecture
   - Evidence: data, costs, results
   - Steps, implementation, risks
   - Summary / next steps
3. Write headlines that state the point, not the topic.

### 2. Choose a visual mode per slide (Formatter)

- `.page.aurora` — default for anything meant to be read.
- `.page.dark` — cover, section dividers, bold statements.
- `.page.clean-bordered` with `.accent-border` — tables and data matrices.

### 3. Build the file

1. Start from `template.html`; keep its CSS core, navigation markup and `<script>` untouched.
2. Set `<title>`, and `lang`/`dir` on `<html>` for the deck's language (`dir="rtl"` for Hebrew, Arabic, etc.).
3. Replace the example slides inside `<div id="deck">`. Label each `<!-- SLIDE N: title -->`.
4. Every slide carries the logo slot (`.wm`) — if the user has no logo, remove it from all slides consistently — and at least one accent element (`.spec`, `.specbar`, `.dot` or `.accent-border`).
5. Use theme tokens (`var(--c1)`…) instead of hex values. If the user wants a different palette, change the `:root` block only.
6. Save to the workspace root with a descriptive kebab-case name, e.g. `q3-product-review.html`. Images go in `assets/`.

### 4. Verify and repair (Checker)

Run the checklist in [references/verification-checker.md](./references/verification-checker.md). If any item fails, fix the file and re-check before presenting it. Report the result as a short PASS/FAIL list.

## Content rules

- Max ~5 bullets, ~3 stats, ~5 steps per slide; split otherwise.
- No emoji. Use `.dot`, `.numchip`, `.chip`.
- In RTL decks wrap Latin terms, code and unit-bearing numbers in `<span dir="ltr">…</span>`.
- Keep one idea and one takeaway per slide; the `.take` strip holds it.
