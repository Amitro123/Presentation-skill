# Verification Checker & Repair Protocol

A skill should not just generate output; it should check its own work against binary, observable criteria and repair failures before handing the result back.

## Automated audit

`tools/audit-deck.js` runs the machine-checkable items (C1/C12–C16 and more) in a real browser:

```bash
npm i -D playwright
node tools/audit-deck.js my-deck.html           # add --chromium=/path/to/chromium if needed
```

Run it when Node and Chromium are available and quote its PASS/FAIL lines in the report; otherwise perform the checks by inspection. Findings from the audit are facts — fix them, do not argue with them.

## Customizing the checks

This list is a default. A project can change it: `assets/references/verification-checker.md` replaces this file, and `assets/brand.md` can switch individual checks off (`checks_off: [C5]`) or change limits (`max_bullets: 6`). Always run the effective list, and say in the report which checks were disabled and why.

## Principles

1. **Binary:** every check is PASS or FAIL. No "looks good".
2. **Evidence:** cite the tag, class or line that proves a PASS.
3. **Self-repair:** on any FAIL, fix the file and re-run the check before presenting it.

## Checklist

| # | Check | Pass criterion | Evidence |
|---|---|---|---|
| C1 | Language & direction | `<html>` has `lang` and `dir` matching the deck's language | Opening tag |
| C2 | Font | A web-font `<link>` (or intentional system stack) is present and matches `--font` | `<head>` |
| C3 | Logo slot consistent | Every `.page` has an empty `.wm` div and `--logo` resolves to an existing file; or `data-logo="none"` | Count `.wm` vs `.page`, check the `:root` path |
| C4 | No per-slide colors | No hex/rgb literals in slide markup except through tokens or the documented rgba surface helpers | grep `#[0-9A-Fa-f]{3,6}` inside `<div id="deck">` |
| C5 | RTL term isolation | RTL decks only: Latin terms, acronyms and code wrapped in `<span dir="ltr">` | Spot-check each slide |
| C6 | Accent on every slide | Each `.page` contains `.spec`, `.specbar`, `.dot` or `.accent-border` | Per-slide scan |
| C7 | Density | Per slide: ≤5 bullets, ≤3 stats, ≤5 steps | Count elements |
| C8 | Emoji policy | No emoji characters, unless `emoji: allowed` is set in `assets/brand.md` | Regex scan |
| C9 | Navigation intact | `.nav-bar` markup and the deck `<script>` are unmodified from `template.html` | Diff against template |
| C10 | Print CSS intact | `@page { size: 1920px 1080px }` and the `@media print` block are present | `<style>` |
| C11 | Keyboard coverage | Arrow keys (direction-aware), Space, PageUp/PageDown and Home/End all navigate | Audit A11 |
| C12 | Reduced motion | An `@media (prefers-reduced-motion: reduce)` rule tones down transitions and animations | `<style>` |
| C13 | PDF parity | Printing to PDF yields exactly one page per slide | Audit A13 |
| C14 | Works offline | No runtime `<script src="http…">`; fonts may load from a CDN but must have a system fallback | Audit A6 |
| C15 | Images | Every `<img>` has `alt` (empty string for purely decorative images) and loads | Audit A4/A5 |
| C16 | No overflow | No element extends past its slide at 1920×1080 | Audit A12 |

## Repair runbook

```text
C1 missing/incorrect  -> set <html lang="…" dir="ltr|rtl"> to match the content language.
C3 inconsistent logo  -> add <div class="wm" role="img" aria-label="Logo"></div> to slides that lack it, fix the --logo path, or set data-logo="none".
C4 hardcoded color    -> replace with var(--c1)…var(--c6), var(--ink), var(--muted), or an .f-* class.
C5 bare Latin term    -> wrap in <span dir="ltr">term</span>.
C6 no accent          -> add a .dot in the eyebrow, a .specbar divider, or .spec on a key word.
C7 too dense          -> split into two slides, each with its own headline.
C8 emoji              -> (only if emoji are not allowed) replace with <span class="dot">, <div class="numchip">, or <div class="chip">.
C9/C10/C11/C12 modified -> restore the block verbatim from template.html.
C13 wrong page count  -> restore the @media print block; make sure no slide uses position:fixed.
C14 CDN script        -> inline or vendor the code, or drop the feature.
C15 missing alt       -> add a descriptive alt, or alt="" for decoration.
C16 overflow          -> shorten text or split the slide.
```

## Report format

```markdown
### Verification
- C1 Language/direction — PASS (`<html lang="en" dir="ltr">`)
- C2 Font — PASS (Inter link in <head>)
- C3 Logo slot — PASS (.wm on all 10 slides)
…
- C10 Print CSS — PASS (@page + @media print present)
```
