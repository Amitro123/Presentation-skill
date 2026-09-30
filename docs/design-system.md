# Design System

The authoritative reference for `skills/html-presentation/assets/template.html`. The same content, condensed for AI use, is in [`skills/html-presentation/references/design-system.md`](../skills/html-presentation/references/design-system.md).

## Theme tokens

All colors are CSS custom properties on `:root`. Change them and every slide follows.

```css
:root {
  --c1: #6366F1;  --c2: #8B5CF6;  --c3: #EC4899;   /* accent hues */
  --c4: #F59E0B;  --c5: #06B6D4;  --c6: #10B981;
  --accent: linear-gradient(135deg, var(--c1) 0%, var(--c2) 40%, var(--c3) 75%, var(--c4) 100%);

  --ink: #0F172A;  --ink-2: #1E293B;               /* text + dark surfaces */
  --muted: #64748B;                                /* secondary text */
  --bg: #F8FAFC;   --bg-2: #EEF2F7;                /* light backgrounds */
  --on-dark: #FFFFFF;  --on-dark-2: rgba(255,255,255,.82);
  --highlight: var(--c4);                          /* emphasis inside .take */
  --font: 'Inter', system-ui, sans-serif;

  --logo: url("assets/logo.svg");  --logo-dark: url("assets/logo-light.svg");
  --logo-w: 200px;  --logo-h: 56px;  --logo-offset-x: 104px;  --logo-offset-y: 52px;
}
```

`--accent-on-dark` is the gradient used for `.spec` text on `.dark` slides; it defaults to `--accent`. Set a lighter gradient if your accent starts with a dark shade.

Aurora and Dark Glow backgrounds are built from these tokens with `color-mix()`, so a new palette re-tints them automatically.

## Visual modes

| Class | Use for |
|---|---|
| `.page.aurora` | Default. Bullets, cards, flows, anything meant to be read. |
| `.page.dark` | Covers, section dividers, bold statements. Add `.on-dark` to `.eyebrow`, `.title`, `.sub`. |
| `.page.clean-bordered` | Tables and data. Wrap content in `.accent-border`. |

## Typography

| Element | Class | Size / weight |
|---|---|---|
| Label pill | `.eyebrow` | 21px / 700 |
| Title | `.title` | 70px / 900 (up to 104px on covers) |
| Subtitle | `.sub` | 29–33px / 500 |
| Card heading | — | 24–32px / 800 |
| Body | — | 20–26px / 500–600 |

## Components

| Class | Purpose |
|---|---|
| `.glass` | Frosted translucent card |
| `.inkcard` | Dark high-contrast card |
| `.spec` | Gradient-filled text |
| `.specbar` | Gradient-filled bar, disc or divider |
| `.dot` | Small gradient bullet |
| `.chip` | Pill tag |
| `.take` | Full-width takeaway strip; `.hi` inside highlights a phrase |
| `.numchip` | Numbered circle for steps |
| `.bartrack` / `.barfill` + `.f-1`…`.f-6` | Horizontal comparison bars |
| `.bignum` | Oversized statistic |
| `.wm` | Logo slot — image from `--logo`/`--logo-dark`, position from `data-logo` on `#deck` (`top-end` default, `top-start`, `top-center`, `bottom-start`, `bottom-end`, `bottom-center`, `none`) |

Layout helpers: `.fx .col .ac .jc .jb .f1 .wrap .grid`, weights `.fw5–.fw8`.

## Known traps

| Trap | Do this instead |
|---|---|
| Hardcoding hex colors on a slide | Use tokens (`var(--c1)`) or the `.f-*` helpers |
| Packing 7+ bullets on a slide | Split into two slides |
| Redrawing the logo in SVG/text, or a per-slide `<img>` | Set `--logo` once; keep `.wm` empty |
| Emoji as bullets | `.dot`, `.numchip` |
| Plain slide with no accent | Every slide carries at least one of `.spec`, `.specbar`, `.dot`, `.accent-border` |
| Latin terms breaking RTL punctuation | `<span dir="ltr">…</span>` |
| Editing the nav script or print CSS per deck | Leave untouched so every deck behaves the same |

## Imagery

- Friendly, simple visual metaphors beat dense diagrams.
- Put images in a container with `object-fit: contain` (or `cover`) and a 16:9 frame; never stretch.
