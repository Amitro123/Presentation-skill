# Assets

Drop your brand material here, then ask Claude to adapt the project (see "Adapting to your brand" in the root README).

| What | Examples | Used for |
|---|---|---|
| Logo | `logo.svg`, `logo.png`, `logo-light.svg` (for dark slides) | The `.wm` logo slot on every slide |
| Colors / style references | brand guide PDF, palette screenshot, an existing deck or slide screenshot | Deriving the `--c1`…`--c6`, `--ink`, `--bg` theme tokens |
| Fonts | `.woff2` files, or a note naming a Google Font | The `--font` token |
| Imagery | photos, illustrations, icons used in slides | `<img>` content inside slides |
| `brand.md` *(optional)* | Configuration and free-text rules — copy [`brand.example.md`](brand.example.md). Covers colors, font, logo file and position, language/RTL, slide counts, density limits, which reference files to use | Everything below is overridable from here |
| `references/` *(optional)* | Your own reference files: same name as a default (e.g. `slide-templates.md`) replaces it, a new name adds to it | The skill's design rules, templates and checks |

`logo-placeholder.svg` and `logo-placeholder-light.svg` are stand-ins; delete them once you add your own logo.

Keep file names simple and lowercase (`logo-light.svg`, not `Final LOGO (2).png`).
