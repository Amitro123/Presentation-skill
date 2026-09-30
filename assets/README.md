# Assets

Drop your brand material here, then ask Claude to adapt the project (see "Adapting to your brand" in the root README).

| What | Examples | Used for |
|---|---|---|
| Logo | `logo.svg`, `logo.png`, `logo-light.svg` (for dark slides) | The `.wm` logo slot on every slide |
| Colors / style references | brand guide PDF, palette screenshot, an existing deck or slide screenshot | Deriving the `--c1`…`--c6`, `--ink`, `--bg` theme tokens |
| Fonts | `.woff2` files, or a note naming a Google Font | The `--font` token |
| Imagery | photos, illustrations, icons used in slides | `<img>` content inside slides |
| `brand.md` *(optional)* | Free-text rules: tone, forbidden colors, logo clear-space, language/RTL | Extra constraints Claude should follow |

`logo-placeholder.svg` is a stand-in; it can be deleted once you add your own logo.

Keep file names simple and lowercase (`logo-light.svg`, not `Final LOGO (2).png`).
