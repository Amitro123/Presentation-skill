# Presentation Skill — contributor notes

Open-source template and AI skill for building slide decks as single HTML files (1920×1080, RTL-aware). The skill is `skills/html-presentation/` — the single source of truth; its instructions live in its `SKILL.md`, not here.

## Commands

- `npm run validate` — html-validate on the template and `examples/*.html`
- `npm run audit` — browser audit of the template and examples (needs Playwright)
- `npm run build:examples` — regenerate `examples/*.html` from their `.json` files
- `npm run package` — regenerate `plugin/skills/` and `html-presentation.skill` (`--check` to verify)
- `node skills/html-presentation/scripts/build-deck.js deck.json --out=deck.html`
- `node skills/html-presentation/scripts/build-deck.js skills/html-presentation/assets/template-sample.json --out=skills/html-presentation/assets/template.html --keep-head` — regenerate the template's example slides

## Rules

- Default branch is `main`. Generated files — `examples/*.html`, `plugin/skills/`, `html-presentation.skill`, the example slides inside `assets/template.html` — are never hand-edited; change the source and regenerate. CI fails if they are stale.
- `assets/template.html` (in the skill) is the single source of CSS, navigation and print rules. Do not fork its styles elsewhere.
- Colors come from `:root` tokens only. No hardcoded hex values in slide markup.
- Keep everything generic. Never commit someone's logo, brand guide, source documents, or content from a private talk or workshop. Example decks use neutral topics only (for example a quarterly product review).
- `.claude/` (a local install of the skill) is git-ignored via `.git/info/exclude`; do not commit it.
- Changing slide types or content options means updating `references/content-format.md` and `scripts/build-deck.js` together, then the examples.
- After any change inside the skill: `validate`, `audit`, `build:examples`, `package`. For a release: bump `plugin/.claude-plugin/plugin.json`, add a `## vX.Y.Z` section to `CHANGELOG.md`, then tag `vX.Y.Z` or run *Actions → Release* (re-running it for an existing version updates the notes).
