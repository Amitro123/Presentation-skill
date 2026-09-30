# Verification Checker & Repair Protocol

A skill should not just generate output; it should check its own work against binary, observable criteria and repair failures before handing the result back.

## Principles

1. **Binary:** every check is PASS or FAIL. No "looks good".
2. **Evidence:** cite the tag, class or line that proves a PASS.
3. **Self-repair:** on any FAIL, fix the file and re-run the check before presenting it.

## Checklist

| # | Check | Pass criterion | Evidence |
|---|---|---|---|
| C1 | Language & direction | `<html>` has `lang` and `dir` matching the deck's language | Opening tag |
| C2 | Font | A web-font `<link>` (or intentional system stack) is present and matches `--font` | `<head>` |
| C3 | Logo slot consistent | Either every `.page` has the same `.wm` block, or none do | Count `.wm` vs `.page` |
| C4 | No per-slide colors | No hex/rgb literals in slide markup except through tokens or the documented rgba surface helpers | grep `#[0-9A-Fa-f]{3,6}` inside `<div id="deck">` |
| C5 | RTL term isolation | RTL decks only: Latin terms, acronyms and code wrapped in `<span dir="ltr">` | Spot-check each slide |
| C6 | Accent on every slide | Each `.page` contains `.spec`, `.specbar`, `.dot` or `.accent-border` | Per-slide scan |
| C7 | Density | Per slide: ≤5 bullets, ≤3 stats, ≤5 steps | Count elements |
| C8 | No emoji | No emoji characters anywhere | Regex scan |
| C9 | Navigation intact | `.nav-bar` markup and the deck `<script>` are unmodified from `template.html` | Diff against template |
| C10 | Print CSS intact | `@page { size: 1920px 1080px }` and the `@media print` block are present | `<style>` |

## Repair runbook

```text
C1 missing/incorrect  -> set <html lang="…" dir="ltr|rtl"> to match the content language.
C3 inconsistent logo  -> add the same .wm block to the slides that lack it (or remove it everywhere).
C4 hardcoded color    -> replace with var(--c1)…var(--c6), var(--ink), var(--muted), or an .f-* class.
C5 bare Latin term    -> wrap in <span dir="ltr">term</span>.
C6 no accent          -> add a .dot in the eyebrow, a .specbar divider, or .spec on a key word.
C7 too dense          -> split into two slides, each with its own headline.
C8 emoji              -> replace with <span class="dot">, <div class="numchip">, or <div class="chip">.
C9/C10 modified       -> restore the block verbatim from template.html.
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
