# Changelog

Release notes for each version. The Release workflow publishes the section that matches the tag.

## v1.2.1

Bug fixes, most found in a code review of v1.2.0.

- **Dark body slides:** a `bullets`, `cards`, `compare`, `steps`, `stats`, `image`, `table` or `closing` slide with `"mode": "dark"` now gets light headings (they were dark on dark), and cards on dark slides stay opaque enough to read.
- **Compare slides:** the label above each column no longer stretches across the whole card.
- **Right-to-left text:** numbers with unit symbols such as `42 °C` or `5 µs` are isolated as one piece instead of splitting before the unit.
- **Accessibility:** progress dots in the navigation bar are focusable, labelled ("Go to slide N") and respond to Enter.
- **Builder:** command-line values that contain `=` are no longer cut at the first `=`; apostrophes are escaped in generated HTML.
- **Release tooling:** a missing CHANGELOG section now fails with a clear message on stderr and exit code 2.

## v1.2.0

First public release: a template and an AI skill for building large-screen slide decks as single HTML files, from your own documents, in any language — including right-to-left.

### Install

- **Claude Code:** `/plugin marketplace add Amitro123/Presentation-skill`, then `/plugin install html-presentation@presentation-skill`.
- **Claude Desktop / Cowork:** download `html-presentation.skill` below, then *Plugins → Install from file*.
- **Any tool that loads skills:** copy `skills/html-presentation/` into your skills folder.

Node 16+ builds decks. Optional: Playwright + Chromium for the audit, `pillow` + `numpy` for logo preparation.

### How it works

- **Intake first.** Claude asks who the audience is, how many slides you need and whether to show the presenter's name, then asks for your source material (documents, PDFs, notes, images).
- **Content file, not HTML.** Claude writes a short JSON file (a few kilobytes); `build-deck.js` turns it into the finished deck. Cheaper in tokens, consistent in design, easy to iterate on.
- **Self-check.** An automated audit runs in a real browser and a single contact-sheet image shows every slide at once, so problems are fixed before you see the deck.

### Slide types

`cover`, `section`, `statement`, `bullets`, `cards`, `compare`, `steps`, `stats`, `image`, `table`, `closing`, plus `raw` for anything custom.

- **Images keep their proportions.** The builder reads the picture's size: a phone screenshot gets a column exactly as wide as the picture and fills the slide's height; charts and photos share the slide with a few points.
- **Tables** use a clean bordered layout, with an optional highlighted column for the recommended option.
- **Text scales with content.** Short slides get larger type and fill the screen instead of leaving empty bands.

### Presenting

- **Presenter view (`N`).** A second window with the current slide, the next one, the speaker notes and the timer. Keys pressed there drive the deck on the big screen.
- **Speaker notes.** Add `"notes"` to any slide; they never appear on the slide or in the PDF.
- **Timer.** A quiet pill next to the slide counter. Click or `T` to start/pause, double-click to reset. With `"duration"` it counts down, turns red near the end and shows overtime as `+mm:ss`.
- **Keyboard:** arrows (direction-aware), Space, PageUp/PageDown, Home/End, `F` for fullscreen. Swipe on touch screens.
- **Print to PDF:** one landscape page per slide.

### Made for large screens

- Fixed 1920×1080 canvas that scales to any display; text never smaller than 20px on that canvas.
- Safe margins, high contrast, reduced-motion support, works offline (no runtime CDN scripts).

### Right-to-left

- Hebrew, Arabic and other RTL languages mirror the layout, logo position, arrow keys, swipe direction and presenter view.
- Latin words, acronyms and numbers with units inside RTL text are isolated automatically, so punctuation does not flip.

### Make it yours

- **Theme tokens:** six accent colors, ink, background, highlight, warning and font — change them once, every slide follows.
- **Logo:** set once; position `top-end`, `top-start`, `top-center`, `bottom-*` or `none`; separate variant for dark slides. `prepare-logo.py` turns any logo image (even one on a black background) into a transparent PNG.
- **Brand from assets:** drop a logo, palette or brand guide into `assets/` and ask Claude to adapt the project.
- **Configuration file:** `assets/brand.md` sets language, colors, font, logo, slide counts, density limits, emoji policy and which checks to run.
- **Your own rules:** files in `assets/references/` replace or extend the skill's reference files.
- **Reference decks:** save a deck you liked in `assets/references/decks/`; future decks follow its design and tone without copying its content.
- **Single-file delivery:** `--embed` inlines the logo and images so the deck is one file you can send.

### Quality checks

`audit-deck.js` checks JavaScript errors, broken images and missing `alt`, keyboard navigation, reduced motion, print rules, offline safety, RTL isolation, minimum text size, overflow on every slide at several screen sizes, large empty areas, and that the PDF has one page per slide. It also works on decks not built with this template.

### For contributors

- The skill in `skills/html-presentation/` is the single source of truth; `plugin/` and `html-presentation.skill` are generated by `tools/package_skill.py`.
- CI validates HTML, checks that examples and packaged files are up to date, and publishes releases from a tag or from *Actions → Release → Run workflow*.
