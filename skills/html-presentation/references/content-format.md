# Content file format

The default way to build a deck: write a small JSON file, then run

```bash
node tools/build-deck.js my-deck.json --out=my-deck.html [--embed-logo]
```

The script adds markup, theme, logo, navigation and print rules from `template.html`. You only write the words, so a deck costs a fraction of the tokens of hand-written HTML and always matches the design system. Use `raw` slides (below) for anything the types cannot express.

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
| `embedLogo` | Inline the logo as a data URI (single-file delivery); same as `--embed-logo` | `false` |

## Slide types

All types accept `mode` (`aurora` or `dark`) except `cover`, where it selects the cover's look.

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
| `raw` | `html` (slide inner markup), `mode`, `cls`, `noLogo` | — |

The builder prints a warning when a limit is exceeded.

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
