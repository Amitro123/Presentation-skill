# Authoring Guidelines

Rules of thumb for decks built on `skills/html-presentation/assets/template.html`.

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

## Large screens and projectors

The template is designed first for a TV or projector viewed from across a room.

- Body text is 20px or larger on the 1920×1080 canvas; titles are 70px and up. Do not shrink text to make something fit — cut words or split the slide.
- Keep important content inside the slide's padding (104px sides, 74px top, 120px bottom); televisions may crop the outer edge and the navigation bar sits at the bottom.
- Use high contrast. Prefer `.inkcard` and `dark` slides for the most important statements.
- Press `N` on your laptop for the presenter view (notes, next slide, timer), drag that window to the laptop screen, then press `F` in the main window on the TV.
- Press `F` for fullscreen. On a 16:9 display the deck then fills the screen with no bars.
- Connect the display at 1920×1080 or higher; the deck scales to any resolution but was tuned at that size.

## Content

- No emoji by default; use `.dot`, `.numchip` or `.chip` for visual punctuation. Set `emoji: allowed` in `assets/brand.md` if your style uses them.
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
