// Unit tests for skills/html-presentation/scripts/build-deck.js.
// The builder is a CLI, so each test writes a content file, runs it, and inspects the HTML.
// Run: npm test   (node:test, no dependencies)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BUILDER = path.resolve(__dirname, '../skills/html-presentation/scripts/build-deck.js');

function build(content, flags = [], files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'deck-test-'));
  for (const [name, data] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), data);
  }
  const input = path.join(dir, 'deck.json');
  fs.writeFileSync(input, JSON.stringify(content));
  const out = flags.find(f => f.startsWith('--out=')) ? null : path.join(dir, 'deck.html');
  const r = spawnSync(process.execPath, [BUILDER, input, ...(out ? [`--out=${out}`] : []), ...flags], { encoding: 'utf8', cwd: dir });
  const target = out || path.resolve(dir, flags.find(f => f.startsWith('--out=')).slice(6));
  const html = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, html, dir };
}
const deckOf = html => html.slice(html.indexOf('<div id="deck"'), html.indexOf('<!-- Floating navigation'));
const count = (s, re) => (s.match(re) || []).length;
const one = (slide, meta = {}) => build({ meta, slides: [slide] });

// minimal PNG: signature + IHDR with the given size (the builder only reads the header)
function png(w, h) {
  const b = Buffer.alloc(33);
  b.writeUInt32BE(0x89504e47, 0); b.writeUInt32BE(0x0d0a1a0a, 4);
  b.writeUInt32BE(13, 8); b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20);
  return b;
}

test('builds every slide type, one .page each', () => {
  const slides = [
    { type: 'cover', title: 'Cover' },
    { type: 'section', title: 'Section' },
    { type: 'statement', title: 'Statement', lead: 'Lead', note: 'Note' },
    { type: 'bullets', title: 'Bullets', items: ['a', 'b'] },
    { type: 'cards', title: 'Cards', cards: [{ title: 'x', text: 'y' }] },
    { type: 'compare', title: 'Compare', left: { items: ['a'] }, right: { items: ['b'] } },
    { type: 'steps', title: 'Steps', steps: [{ title: 's' }] },
    { type: 'stats', title: 'Stats', bars: [{ label: 'l', value: 50 }], big: { value: '2x', caption: 'c' } },
    { type: 'table', title: 'Table', columns: ['a', 'b'], rows: [['1', '2']] },
    { type: 'closing', title: 'Closing', points: [{ title: 'p' }] },
    { type: 'raw', html: '<p>raw</p>' },
  ];
  const r = build({ slides });
  assert.equal(r.code, 0, r.stderr);
  assert.equal(count(deckOf(r.html), /<div class="page /g), slides.length);
  for (const cls of ['numchip', 'bartrack', 'bignum', 'dtable', 'inkcard']) assert.ok(r.html.includes(cls), cls);
});

test('unknown slide type fails with a clear message', () => {
  const r = one({ type: 'nope', title: 'x' });
  assert.notEqual(r.code, 0);
  assert.match(r.stderr, /unknown type "nope"/);
});

test('escapes HTML in user text, including quotes and apostrophes', () => {
  const r = one({ type: 'bullets', title: '<script>alert(1)</script>', items: [`It's "quoted" & <b>bold</b>`] });
  const d = deckOf(r.html);
  assert.ok(!d.includes('<script>alert'), 'script tag must be escaped');
  assert.ok(d.includes('&lt;script&gt;'));
  assert.ok(d.includes('It&#39;s &quot;quoted&quot; &amp; &lt;b&gt;bold&lt;/b&gt;'));
});

test('*accent* becomes gradient text; in a takeaway it becomes the highlight', () => {
  const r = one({ type: 'bullets', title: 'A *key* point', items: ['x'], takeaway: 'Remember *this*' });
  const d = deckOf(r.html);
  assert.ok(d.includes('<span class="spec">key</span>'));
  assert.ok(d.includes('<span class="hi">this</span>'));
});

test('RTL: Latin runs are isolated, including numbers with unit symbols', () => {
  const r = build({ meta: { lang: 'he', dir: 'rtl' }, slides: [{ type: 'bullets', title: 'כותרת', items: ['עם Claude Sonnet היום.', 'חום 42 °C בחוץ', 'שנת 2026 בלבד'] }] });
  const d = deckOf(r.html);
  assert.ok(d.includes('<span dir="ltr">Claude Sonnet</span> היום.'), 'trailing period stays outside the span');
  assert.ok(d.includes('<span dir="ltr">42 °C</span>'), 'number and unit isolated together');
  assert.ok(!d.includes('<span dir="ltr">2026</span>'), 'plain numbers are left alone');
  assert.match(r.html, /<html lang="he" dir="rtl">/);
});

test('RTL isolation does not break escaped entities', () => {
  const r = build({ meta: { dir: 'rtl', lang: 'he' }, slides: [{ type: 'bullets', title: '"Claude Code is unavailable"', items: ['x'] }] });
  const d = deckOf(r.html);
  assert.ok(d.includes('&quot;<span dir="ltr">Claude Code is unavailable</span>&quot;'));
  assert.ok(!/&<span|quot;<\/span>/.test(d));
});

test('LTR decks get no dir spans', () => {
  const r = one({ type: 'bullets', title: 'Plain English', items: ['Claude Sonnet'] });
  assert.ok(!deckOf(r.html).includes('dir="ltr"'));
});

test('mode "dark" on a body slide gives on-dark headings', () => {
  for (const type of ['bullets', 'cards', 'steps', 'table', 'closing']) {
    const r = one({ type, mode: 'dark', eyebrow: 'E', title: 'T', subtitle: 'S', items: ['a'], cards: [{ title: 'c' }], steps: [{ title: 's' }], columns: ['a'], rows: [['1']], points: [{ title: 'p' }] });
    const d = deckOf(r.html);
    assert.match(d, /<div class="page dark/, type);
    assert.match(d, /class="eyebrow on-dark"/, `${type} eyebrow`);
    assert.match(d, /class="title on-dark"/, `${type} title`);
  }
});

test('density limits produce warnings, not failures', () => {
  const r = one({ type: 'bullets', title: 'Too many', items: ['1', '2', '3', '4', '5', '6', '7'] });
  assert.equal(r.code, 0);
  assert.match(r.stderr, /warning: bullets "Too many": 7 items/);
});

test('text size scales with the amount of content', () => {
  const size = n => Number(deckOf(one({ type: 'bullets', title: 't', items: Array(n).fill('x') }).html).match(/font-size:(\d+)px;line-height:1\.35/)[1]);
  assert.ok(size(2) > size(5), 'fewer bullets -> larger text');
});

test('no logo given -> no logo slot; logo given -> one slot per slide', () => {
  const none = build({ slides: [{ type: 'cover', title: 'a' }, { type: 'bullets', title: 'b', items: ['x'] }] });
  assert.match(none.html, /data-logo="none"/);
  assert.equal(count(deckOf(none.html), /class="wm"/g), 0);
  const withLogo = build({ meta: { logo: 'logo.png' }, slides: [{ type: 'cover', title: 'a' }, { type: 'bullets', title: 'b', items: ['x'] }] });
  assert.match(withLogo.html, /data-logo="top-end"/);
  assert.equal(count(deckOf(withLogo.html), /class="wm"/g), 2);
  assert.match(withLogo.html, /--logo: url\("logo\.png"\);/);
  assert.match(withLogo.html, /--logo-dark: var\(--logo\);/);
});

test('--embed inlines the logo; token replacement survives data URIs', () => {
  const r = build({ meta: { logo: 'assets/logo.png', tokens: { c1: '#123456' } }, slides: [{ type: 'cover', title: 'x' }] }, ['--embed'], { 'assets/logo.png': png(40, 20) });
  assert.match(r.html, /--logo: url\("data:image\/png;base64,[A-Za-z0-9+/=]+"\);/);
  assert.match(r.html, /--logo-w: 200px;/, 'the declaration after --logo is intact');
  assert.match(r.html, /--c1: #123456;/);
});

test('theme tokens are applied; unknown tokens warn', () => {
  const r = build({ meta: { tokens: { c3: '#abcdef', ink: '#000001', bogus: 'x' } }, slides: [{ type: 'cover', title: 'x' }] });
  assert.match(r.html, /--c3: #abcdef;/);
  assert.match(r.html, /--ink: #000001;/);
  assert.match(r.stderr, /unknown token "bogus"/);
});

test('duration and timer options set data attributes', () => {
  assert.match(build({ meta: { duration: 25 }, slides: [{ type: 'cover', title: 'x' }] }).html, /data-duration="25"/);
  assert.match(build({ meta: { timer: false }, slides: [{ type: 'cover', title: 'x' }] }).html, /data-timer="off"/);
});

test('speaker notes are emitted as hidden notes with paragraphs', () => {
  const r = one({ type: 'bullets', title: 't', items: ['x'], notes: 'First *point*.\n\nSecond paragraph.' });
  const d = deckOf(r.html);
  assert.match(d, /<div class="notes" role="note"><p>First <span class="spec">point<\/span>\.<\/p><p>Second paragraph\.<\/p><\/div>/);
});

test('image: portrait pictures get a column sized from their aspect ratio', () => {
  const r = build({ slides: [{ type: 'image', title: 'Phone', src: 'shot.png', alt: 'A phone screen', points: ['a'] }] }, [], { 'shot.png': png(900, 2000) });
  assert.equal(r.code, 0, r.stderr);
  const d = deckOf(r.html);
  assert.match(d, /calc\(\(100cqh - 36px\) \* 0\.4500 \+ 36px\)/);
  assert.match(d, /container-type:size/);
  assert.match(d, /<img src="shot\.png" alt="A phone screen">/);
});

test('image: landscape uses proportional columns; missing alt warns; missing src fails', () => {
  const land = build({ slides: [{ type: 'image', title: 'Chart', src: 'c.png', points: ['a'] }] }, [], { 'c.png': png(1600, 900) });
  assert.match(deckOf(land.html), /grid-template-columns:1fr 1\.35fr/);
  assert.match(deckOf(land.html), /class="media" style="aspect-ratio:1600\/900;"/, 'landscape frame hugs the picture');
  assert.match(deckOf(land.html), /width:min\(100%, calc\(\(100cqh - 36px\) \* 1\.7778 \+ 36px\)\)/, 'and is capped by the available height');
  assert.match(land.stderr, /add "alt" text/);
  const noSrc = one({ type: 'image', title: 'x' });
  assert.notEqual(noSrc.code, 0);
  assert.match(noSrc.stderr, /"src" is required/);
});

test('image: --embed inlines slide images', () => {
  const r = build({ slides: [{ type: 'image', title: 'x', src: 'p.png', alt: 'p' }] }, ['--embed'], { 'p.png': png(10, 10) });
  assert.match(deckOf(r.html), /<img src="data:image\/png;base64,/);
});

test('table: highlighted column and row-length warning', () => {
  const r = one({ type: 'table', title: 'T', columns: ['A', 'B', 'C'], rows: [['1', '2', '3'], ['4', '5']], highlight: 1 });
  const d = deckOf(r.html);
  assert.match(d, /<th class="hl">B<\/th>/);
  assert.match(d, /<td class="hl">2<\/td>/);
  assert.match(d, /class="page clean-bordered/);
  assert.match(r.stderr, /row 2 has 2 cells, expected 3/);
});

test('--out accepts paths containing "="', () => {
  const r = build({ slides: [{ type: 'cover', title: 'x' }] }, ['--out=a=b.html']);
  assert.equal(r.code, 0, r.stderr);
  assert.ok(fs.existsSync(path.join(r.dir, 'a=b.html')));
});

test('--keep-head leaves the template title and header comment alone', () => {
  const r = build({ meta: { title: 'Mine', lang: 'he', dir: 'rtl' }, slides: [{ type: 'cover', title: 'x' }] }, ['--keep-head']);
  assert.match(r.html, /<title>Presentation Title<\/title>/);
  assert.match(r.html, /<html lang="en" dir="ltr">/);
  const normal = build({ meta: { title: 'Mine' }, slides: [{ type: 'cover', title: 'x' }] });
  assert.match(normal.html, /<title>Mine<\/title>/);
  assert.match(normal.html, /Built with the html-presentation skill/);
});

test('author byline appears on the cover only, and can be hidden', () => {
  const r = build({ meta: { author: 'Jordan Lee', role: 'PM' }, slides: [{ type: 'cover', title: 'x' }, { type: 'bullets', title: 'b', items: ['x'] }] });
  assert.equal(count(deckOf(r.html), /class="byline/g), 1);
  assert.match(deckOf(r.html), /Jordan Lee · PM/);
  const hidden = build({ meta: { author: 'Jordan Lee', showAuthor: false }, slides: [{ type: 'cover', title: 'x' }] });
  assert.equal(count(deckOf(hidden.html), /class="byline/g), 0);
});

test('output keeps the template navigation, script and print rules', () => {
  const r = one({ type: 'cover', title: 'x' });
  for (const s of ['class="nav-bar"', 'id="nav-timer"', 'id="pv-btn"', '@media print', "document.addEventListener('keydown', onKey)"]) assert.ok(r.html.includes(s), s);
});
