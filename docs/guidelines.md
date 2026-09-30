# Authoring Guidelines

Rules of thumb for decks built on `template.html`.

## Structure

- One idea per slide. Split rather than shrink text.
- Flow for a typical talk (8–14 slides): cover → context/problem → approach → evidence/data → how-to/steps → summary.
- Each slide is one `<div class="page …">`, navigated one at a time; content is centered or laid out with flexbox/grid inside the 1920×1080 canvas.
- Label every slide in source with `<!-- SLIDE N: title -->`.

## Density limits

| Element | Max per slide |
|---|---|
| Bullets | ~5 |
| Stats / big numbers | ~3 |
| Steps | ~5 |
| Cards in a grid | ~6 |

## Design

- Colors come from the `:root` tokens only — never hardcode a hex value on a slide.
- Use exactly one visual mode per slide, and keep the closing slide in the same theme as the rest.
- Use a consistent card component (`.glass`, `.inkcard`) for content boxes.
- Keep the logo in the same position on every slide.
- Prefer restraint: staggered fade-in is built in; avoid extra effects.

## Content

- No emoji; use `.dot`, `.numchip` or `.chip` for visual punctuation.
- Headlines state the point ("Costs drop 20×"), not the topic ("Costs").
- Put the one thing to remember in the `.take` strip.

## Right-to-left languages

- Set `<html dir="rtl" lang="he">` (or `ar`, `fa`, …) and use a font with matching glyphs.
- Wrap embedded Latin terms, numbers with units and code in `<span dir="ltr">…</span>` so punctuation does not flip.
- The logo slot, arrow keys and swipe direction mirror automatically.

## Accessibility & maintenance

- Keep the deck a single HTML file; images go in `assets/`.
- Give every `<img>` meaningful `alt` text.
- Keep text contrast high, especially on `dark` slides.
- Test on a wide screen and a phone — the canvas scales, the layout does not reflow.
