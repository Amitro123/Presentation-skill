# Content file format

The default way to build a deck: write a small JSON file, then run

```bash
node <skill>/scripts/build-deck.js my-deck.json --out=my-deck.html [--embed]
```

The script adds markup, theme, logo, navigation and print rules from `assets/template.html`, and sizes text to the amount of content so short slides still fill the screen. You only write the words, so a deck costs a fraction of the tokens of hand-written HTML and always matches the design system. Use `raw` slides (below) for anything the types cannot express.

## Inline markup

- `*phrase*` → accent (gradient text; yellow highlight inside `takeaway`). Use it once per title at most.
- In `dir: "rtl"` decks, Latin words, acronyms and numbers-with-units are isolated automatically (`dir="ltr"`). Do not add spans yourself.
- `\n` in a title or caption is a line break. Everything else is plain text; HTML is escaped.

## meta

| Key | Meaning | Default |
|---|---|---|
| `title` | Browser tab title | "Presentation" |
| `lang`, `dir` | Language code, `ltr` or `rtl` | `en`, `ltr` |
| `font` | Google Fonts family, e.g. `Heebo` | template's Inter |
| `author`, `role`, `date` | Cover byline (joined with " · ") | none |
| `showAuthor` | Set `false` to hide the byline | `true` |
| `logo`, `logoDark` | Image paths **relative to the output HTML**; dark variant for `dark` slides | placeholder |
| `logoSize` | `[width, height]` in px | `[200, 56]` |
| `logoOffset` | `[x, y]` distance from the edge in px | `[104, 52]` |
| `logoPosition` | `top-end`, `top-start`, `top-center`, `bottom-start`, `bottom-end`, `bottom-center`, `none` | `top-end` |
| `tokens` | Theme overrides: `c1`…`c6`, `ink`, `ink2`, `muted`, `bg`, `bg2`, `highlight`, `accent`, `accentOnDark` | template values |
| `embed` | Inline the logo and every slide image as data URIs, for one file you can send; same as `--embed` | `false` |

## Slide types

All types accept `mode` (`aurora` or `dark`) except `cover`, where it selects the cover's look, and `notes` (speaker notes, see below).

| type | Fields | Limits |
|---|---|---|
| `cover` | `eyebrow`, `title`, `subtitle`, `mode` (`aurora`/`dark`) | — |
| `section` | `eyebrow`, `title`, `subtitle` (dark divider) | — |
| `statement` | `eyebrow`, `lead`, `title`, `note` (dark closing statement) | — |
| `bullets` | `eyebrow`, `title`, `subtitle`, `items[]`, `takeaway` | ≤5 items |
| `cards` | `eyebrow`, `title`, `subtitle`, `cards[{title,text}]`, `takeaway` | 2–4 cards |
| `compare` | `eyebrow`, `title`, `subtitle`, `left`/`right` `{label,title,items[]}`, `takeaway` | ≤5 items per side |
| `steps` | `eyebrow`, `title`, `steps[{title,text}]`, `takeaway` | ≤5 steps |
| `stats` | `eyebrow`, `title`, `subtitle`, `bars[{label,value 0-100,text,color 1-6}]`, `big{value,caption}`, `takeaway` | ≤3 bars |
| `closing` | `eyebrow`, `title`, `points[{title,text}]`, `note` | ≤6 points |
| `image` | `eyebrow`, `title`, `subtitle`, `src`, `alt`, `caption`, `points[]`, `side` (`start`/`end`, where the image goes), `fit` (`contain`/`cover`), `takeaway` | ≤4 points |
| `table` | `eyebrow`, `title`, `subtitle`, `columns[]`, `rows[][]`, `highlight` (0-based column to emphasise), `takeaway` | ≤8 rows, ≤5 columns |
| `raw` | `html` (slide inner markup), `mode`, `cls`, `noLogo` | — |

The builder prints a warning when a limit is exceeded.

### Speaker notes

Any slide can have `"notes": "..."` — what the presenter should say. Notes are never shown on the slide or in the PDF. Pressing `N` (or the screen button in the navigation bar) opens a presenter window with the current and next slide, the notes and a timer; keys pressed in that window drive the deck. A blank line (`\n\n`) starts a new paragraph. Write notes when the user asks for them or supplies talking points; do not pad every slide.

### Images

- `src` is relative to the output HTML (put images in the project's `assets/`). With `--embed` it is read relative to the content file and inlined.
- The builder reads the picture's size. Portrait images (phone screenshots) get a column exactly as wide as the picture, so they fill the slide's height; landscape images take about 57% of the width. Without `points` the image is centred on its own.
- `alt` is required for accessibility; describe what the picture shows, including any text in it.
- Use `fit: "cover"` only for photos where cropping the edges is acceptable; screenshots and charts must stay `contain` (the default).

### Tables

- Tables use the `clean-bordered` mode. Keep cells short: a word, a number or a short phrase. Long sentences belong in `bullets` or `cards`.
- `highlight` marks the recommended option. `*text*` in a cell makes it bold; in a header it uses the highlight color.
- Text size shrinks with the number of rows (30px down to 22px); beyond 8 rows, split the table over two slides.

## Example

```json
{
  "meta": { "title": "Q3 Review", "author": "Jordan Lee", "logo": "assets/logo.png", "logoDark": "assets/logo.png" },
  "slides": [
    { "type": "cover", "mode": "dark", "eyebrow": "Quarterly review", "title": "Faster releases,\n*fewer surprises*", "subtitle": "What shipped and what comes next." },
    { "type": "bullets", "title": "Three things that moved the numbers", "items": ["Self-serve onboarding cut *time to first value* to 3 days.", "The export API removed the top support request."], "takeaway": "Smaller releases gave us *earlier feedback*." }
  ]
}
```

See `examples/quarterly-review.json` (LTR) and `examples/hebrew-example.json` (RTL) for full decks.
