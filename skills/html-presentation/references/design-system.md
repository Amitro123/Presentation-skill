# Design System Reference

Authoritative spec for decks built on `template.html`. Human-readable copy: `docs/design-system.md`.

## 1. Theme tokens

Colors are defined once in `:root`; nothing else in the file hardcodes a color.

```css
:root {
  --c1: #6366F1;  --c2: #8B5CF6;  --c3: #EC4899;
  --c4: #F59E0B;  --c5: #06B6D4;  --c6: #10B981;
  --accent: linear-gradient(135deg, var(--c1) 0%, var(--c2) 40%, var(--c3) 75%, var(--c4) 100%);
  --ink: #0F172A;  --ink-2: #1E293B;  --muted: #64748B;
  --bg: #F8FAFC;   --bg-2: #EEF2F7;
  --on-dark: #FFFFFF;  --on-dark-2: rgba(255,255,255,.82);
  --highlight: var(--c4);
  --font: 'Inter', system-ui, sans-serif;
}
```

To re-brand a deck, change these values only. Aurora/Dark backgrounds derive from them via `color-mix()`.

## 2. Visual modes (exactly one per slide)

| Mode | Class | Use for |
|---|---|---|
| Aurora Light | `.page.aurora` | ~80% of slides: bullets, steps, cards, diagrams |
| Dark Glow | `.page.dark` | Covers, dividers, statements. Add `.on-dark` to `.eyebrow`, `.title`, `.sub` |
| Clean Bordered | `.page.clean-bordered` + `.accent-border` | Tables, dense comparisons |

## 3. Typography

| Element | Class | Spec |
|---|---|---|
| Eyebrow pill | `.eyebrow` (+ `.dot`) | 21px, 700 |
| Title | `.title` | 70px, 900; covers up to 104px |
| Subtitle | `.sub` | 29–33px, 500, `--muted` |
| Card heading | — | 24–32px, 800 |
| Body | — | 20–26px, 500–600 |

## 4. Components

- `.wm` — logo slot, top corner opposite the text start edge.
- `.glass` — frosted card. `.inkcard` — dark emphasis card.
- `.spec` — gradient text. `.specbar` — gradient fill. `.dot` — gradient bullet.
- `.take` — bottom takeaway strip; `<span class="hi">` highlights a phrase.
- `.numchip` — numbered circle; fill with `var(--c1)`…`var(--c6)` in step order.
- `.bartrack` / `.barfill` with `.f-1`…`.f-6` — comparison bars.
- `.bignum` — oversized statistic. `.chip` — pill tag.
- Layout helpers: `.fx .col .ac .jc .jb .f1 .wrap .grid`, `.fw5–.fw8`.

## 5. Language direction

- LTR default: `<html lang="en" dir="ltr">`.
- RTL: `<html lang="he" dir="rtl">` (or `ar`, `fa`…) and a font with the right glyphs. Layout, logo slot, arrow keys and swipe mirror automatically.
- In RTL decks wrap every Latin term, acronym, code snippet or unit-bearing number in `<span dir="ltr">…</span>`.

## 6. Known traps

| Trap | Required behavior |
|---|---|
| Logo redrawn as SVG/text per slide | One image file in `.wm`, same on every slide |
| Hardcoded hex colors | Tokens or `.f-*` helpers |
| 7+ bullets / 5 dense cards | Split across slides |
| Emoji | `.dot`, `.numchip`, `.chip` |
| Slide with no accent | Add `.spec`, `.specbar`, `.dot` or `.accent-border` |
| BiDi punctuation flip (RTL) | `<span dir="ltr">` around the whole term and its punctuation |
| Editing nav script / print CSS | Leave untouched |

## 7. Imagery

- Simple, friendly visual metaphors over dense schematics.
- Wrap in a 16:9 container with `object-fit: contain|cover`; never distort; leave padding so nothing overflows the slide.
