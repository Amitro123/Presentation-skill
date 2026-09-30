# Presentation Skill — contributor notes

Open-source template and AI skill for building slide decks as single HTML files (1920×1080, RTL-aware). The skill itself is `skills/html-presentation/`; its instructions live in `SKILL.md`, not here.

## Commands

- `npm run validate` — html-validate on `*.html` and `examples/*.html`
- `npm run audit` — browser audit of the template and examples (`tools/audit-deck.js`; needs Playwright)
- `npm run build:examples` — regenerate `examples/*.html` from their `.json` files
- `node tools/build-deck.js deck.json --out=deck.html` — build a deck from a content file
- `python3 tools/prepare-logo.py in.jpg assets/logo.png` — make a transparent logo (needs pillow, numpy)

## Rules

- Default branch is `main`. Examples under `examples/` are generated; edit the `.json`, rebuild, never hand-edit the `.html`.
- `template.html` is the single source of CSS, navigation and print rules. The builder reads it; do not fork its styles elsewhere.
- Colors come from `:root` tokens only. No hardcoded hex values in slide markup.
- Keep everything generic. Never commit someone's logo, brand guide, source documents, or content from a private talk or workshop. Example decks use neutral topics only (for example a quarterly product review).
- `.claude/` (a local install of the skill) is git-ignored via `.git/info/exclude`; do not commit it.
- Changing slide types or content options means updating `references/content-format.md` and `tools/build-deck.js` together, then the examples.
- After any change to `template.html` or the builder: run `validate`, `audit`, and rebuild the examples.
