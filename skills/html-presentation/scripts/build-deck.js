#!/usr/bin/env node
/*
 * Build a deck from a small content file.
 *
 *   node scripts/build-deck.js content.json [--out=deck.html] [--embed]
 *
 * --embed inlines the logo and all slide images as data URIs, for a single file you can send.
 *
 * The content file lists slides by type (cover, bullets, cards, compare, steps, stats,
 * closing, section, statement, raw). This script adds the markup, theme tokens, logo,
 * navigation and print rules from assets/template.html, so an assistant only has to write the
 * words. Format: skills/html-presentation/references/content-format.md
 * No dependencies; Node 16+.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v === undefined ? true : v]; }));
const input = args.find(a => !a.startsWith('--'));
if (!input) { console.error('usage: node scripts/build-deck.js content.json [--out=deck.html] [--embed]'); process.exit(2); }

const TEMPLATE = path.resolve(__dirname, '../assets/template.html');
const base = path.dirname(path.resolve(input));
const content = JSON.parse(fs.readFileSync(input, 'utf8'));
const meta = Object.assign({ lang: 'en', dir: 'ltr', title: 'Presentation', showAuthor: true }, content.meta || {});
if (!meta.logoPosition) meta.logoPosition = meta.logo ? 'top-end' : 'none';   // no logo given -> no placeholder in a real deck
const rtl = meta.dir === 'rtl';
const warnings = [];
const warn = m => warnings.push(m);

// ---------- text helpers ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LATIN = /[A-Za-z0-9$][A-Za-z0-9$%.,:\/+#&@_'’-]*(?:\s+[A-Za-z0-9$][A-Za-z0-9$%.,:\/+#&@_'’-]*)*/g;
function plain(text) {
  const t = String(text);
  if (!rtl) return esc(t);
  // isolate Latin runs so punctuation does not flip inside right-to-left text (match on raw text, escape after)
  let out = '', last = 0;
  for (const m of t.matchAll(LATIN)) {
    let run = m[0]; const tail = (run.match(/[.,:]+$/) || [''])[0]; run = tail ? run.slice(0, -tail.length) : run;
    out += esc(t.slice(last, m.index));
    out += /[A-Za-z]/.test(run) ? `<span dir="ltr">${esc(run)}</span>${esc(tail)}` : esc(run + tail);
    last = m.index + m[0].length;
  }
  return out + esc(t.slice(last));
}
// *phrase* -> accent (class given), everything else escaped
function rich(text, cls = 'spec') {
  if (text == null) return '';
  return String(text).split(/(\*[^*]+\*)/).map(p => /^\*[^*]+\*$/.test(p) ? `<span class="${cls}">${plain(p.slice(1, -1))}</span>` : plain(p)).join('');
}
const hi = t => rich(t, 'hi');
const BR = t => String(t).split('\\n').map(s => s).join('\n');
const lines = (t, cls) => String(t).split('\n').map(l => rich(l, cls)).join('<br>');

const WM = '<div class="wm" role="img" aria-label="Logo"></div>';
const EMBED = !!(opt.embed || opt['embed-logo'] || meta.embed || meta.embedLogo);
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif' };
// pixel size of a local PNG / JPEG / GIF / WebP (no dependencies); null if unknown
function imageSize(p) {
  try {
    if (/^(data:|https?:)/.test(p)) return null;
    const b = fs.readFileSync(path.resolve(base, p));
    if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
    if (b.toString('ascii', 0, 3) === 'GIF') return [b.readUInt16LE(6), b.readUInt16LE(8)];
    if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 12, 16) === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (b[0] === 0xff && b[1] === 0xd8) {
      for (let i = 2; i < b.length - 9;) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1], len = b.readUInt16BE(i + 2);
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
        i += 2 + len;
      }
    }
  } catch { /* fall through */ }
  return null;
}
// image path relative to the output HTML; with --embed it is read relative to the content file and inlined
function imgSrc(p) {
  if (!EMBED || /^(data:|https?:)/.test(p)) return p;
  const f = path.resolve(base, p);
  if (!fs.existsSync(f)) { warn(`image not found for embedding: ${p}`); return p; }
  return `data:${MIME[path.extname(f).slice(1).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(f).toString('base64')}`;
}
const eyebrow = (t, dark) => t ? `<div class="eyebrow${dark ? ' on-dark' : ''}"><span class="dot"></span>${rich(t, 'spec')}</div>` : '';
const take = t => t ? `\n      <div class="take" style="margin-top:32px;font-size:30px;">${rich(t, 'hi')}</div>` : '';
const header = (s, dark) => `<div class="hd">
        ${eyebrow(s.eyebrow, dark)}
        <h1 class="title${dark ? ' on-dark' : ''}">${rich(s.title)}</h1>${s.subtitle ? `\n        <p class="sub${dark ? ' on-dark' : ''}">${rich(s.subtitle)}</p>` : ''}
      </div>`;
const C = n => `var(--c${((n - 1) % 6) + 1})`;
// size by amount of content: fewer items -> larger type, so short slides fill the canvas
const pick = (n, table) => table[Math.max(0, Math.min(n, table.length - 1))];
// content area between the header and the takeaway, content centred in it
// sized: make the area a size container so children can use cqh (container height) units
const stage = (inner, sized) => `<div class="f1 fx col" style="margin-top:36px;min-height:0;${sized ? 'container-type:size;' : ''}">
        ${inner}
      </div>`;

// ---------- slide types ----------
const T = {
  cover(s) {
    const dark = s.mode === 'dark';
    const by = meta.showAuthor && meta.author ? `\n        <div class="byline${dark ? ' on-dark' : ''}">${plain([meta.author, meta.role, meta.date].filter(Boolean).join(' · '))}</div>` : '';
    return { mode: dark ? 'dark' : 'aurora', cls: 'fx col ac jc', body: `
      <div class="fx col ac" style="gap:34px;text-align:center;max-width:1500px;">
        ${eyebrow(s.eyebrow, dark)}
        <h1 class="title${dark ? ' on-dark' : ''}" style="font-size:100px;line-height:1.04;">${lines(s.title)}</h1>
        ${s.subtitle ? `<p class="sub${dark ? ' on-dark' : ''}" style="font-size:33px;text-align:center;max-width:1180px;">${rich(s.subtitle)}</p>` : ''}
        <div class="specbar" style="width:280px;height:8px;border-radius:999px;"></div>${by}
      </div>` };
  },
  section(s) {
    return { mode: 'dark', cls: 'fx col ac jc', body: `
      <div class="fx col ac" style="gap:28px;text-align:center;max-width:1400px;">
        ${eyebrow(s.eyebrow, true)}
        <h1 class="title on-dark" style="font-size:88px;">${lines(s.title)}</h1>
        ${s.subtitle ? `<p class="sub on-dark" style="text-align:center;">${rich(s.subtitle)}</p>` : ''}
        <div class="specbar" style="width:240px;height:8px;border-radius:999px;"></div>
      </div>` };
  },
  statement(s) {
    return { mode: 'dark', cls: 'fx col ac jc', body: `
      <div class="fx col ac" style="gap:30px;text-align:center;max-width:1500px;">
        ${eyebrow(s.eyebrow, true)}
        ${s.lead ? `<p class="sub on-dark" style="font-size:36px;text-align:center;">${rich(s.lead, 'white fw7')}</p>` : ''}
        <h1 class="title on-dark" style="font-size:84px;line-height:1.1;">${lines(s.title)}</h1>
        <div class="specbar" style="width:240px;height:8px;border-radius:999px;"></div>
        ${s.note ? `<p class="sub on-dark" style="font-size:24px;text-align:center;max-width:1200px;">${rich(s.note)}</p>` : ''}
      </div>` };
  },
  bullets(s) {
    const items = s.items || []; if (items.length > 5) warn(`bullets "${s.title}": ${items.length} items (limit ~5)`);
    const fs = pick(items.length, [46, 46, 42, 40, 35, 31]);
    const colors = [1, 3, 6, 2, 5];
    return { mode: 'aurora', body: `
      ${header(s)}
      ${stage(`<div class="glass fx col" style="flex:1;padding:40px 64px;justify-content:space-evenly;">
          ${items.map((t, i) => `<div class="fx" style="gap:22px;align-items:baseline;"><span class="bullet" style="background:${C(colors[i % 5])};width:${Math.round(fs * .42)}px;height:${Math.round(fs * .42)}px;transform:translateY(-.12em);"></span><span class="ink-t fw6" style="font-size:${fs}px;line-height:1.35;">${rich(t, 'fw8')}</span></div>`).join('\n          ')}
        </div>`)}${take(s.takeaway)}` };
  },
  cards(s) {
    const cards = s.cards || []; if (cards.length > 4) warn(`cards "${s.title}": ${cards.length} cards (limit ~4)`);
    const [tf, xf, pad] = pick(cards.length, [[46, 33, 60], [46, 33, 60], [46, 33, 60], [42, 31, 52], [34, 27, 42]]);
    return { mode: 'aurora', body: `
      ${header(s)}
      ${stage(`<div class="grid" style="flex:1;grid-template-columns:repeat(${cards.length},1fr);gap:32px;align-items:stretch;">
          ${cards.map((c, i) => `<div class="glass fx col" style="padding:${pad}px ${pad - 6}px;gap:24px;justify-content:center;border-top:8px solid ${C(i + 1)};">
            <div class="ink-t fw8" style="font-size:${tf}px;line-height:1.2;">${rich(c.title)}</div>
            <div class="muted fw5" style="font-size:${xf}px;line-height:1.5;">${rich(c.text)}</div>
          </div>`).join('\n          ')}
        </div>`)}${take(s.takeaway)}` };
  },
  compare(s) {
    const n = Math.max((s.left || {}).items?.length || 0, (s.right || {}).items?.length || 0);
    const fs = pick(n, [36, 36, 36, 34, 31, 28]);
    const side = (o, dark) => { const items = o.items || []; if (items.length > 5) warn(`compare "${s.title}": ${items.length} items on one side (limit ~5)`);
      return `<div class="${dark ? 'inkcard' : 'glass'} fx col" style="padding:52px;gap:${Math.round(fs * .9)}px;justify-content:center;">
            ${o.label ? `<div class="chip" style="background:${dark ? 'rgba(255,255,255,.14)' : 'rgba(100,116,139,.14)'};color:${dark ? '#fff' : 'var(--muted)'};font-size:22px;">${rich(o.label, dark ? 'white' : 'muted')}</div>` : ''}
            ${o.title ? `<div class="${dark ? 'white' : 'ink-t'} fw8" style="font-size:${fs + 8}px;line-height:1.2;">${rich(o.title)}</div>` : ''}
            ${items.map(t => dark
              ? `<div class="fx" style="gap:16px;align-items:baseline;"><span class="dot" style="width:16px;height:16px;flex-shrink:0;"></span><span class="white-2 fw6" style="font-size:${fs}px;line-height:1.35;">${rich(t, 'white fw8')}</span></div>`
              : `<div class="fx" style="gap:16px;align-items:baseline;"><span class="bullet" style="background:var(--muted);width:14px;height:14px;"></span><span class="muted fw6" style="font-size:${fs}px;line-height:1.35;">${rich(t, 'ink-t fw8')}</span></div>`).join('\n            ')}
          </div>`; };
    return { mode: 'aurora', body: `
      ${header(s)}
      ${stage(`<div class="grid" style="flex:1;grid-template-columns:1fr 1fr;gap:40px;align-items:stretch;">
          ${side(s.left || {}, false)}
          ${side(s.right || {}, true)}
        </div>`)}${take(s.takeaway)}` };
  },
  steps(s) {
    const steps = s.steps || []; if (steps.length > 5) warn(`steps "${s.title}": ${steps.length} steps (limit ~5)`);
    const [tf, xf, chip, gap] = pick(steps.length, [[44, 32, 84, 48], [44, 32, 84, 48], [44, 32, 84, 48], [42, 31, 80, 40], [36, 28, 68, 30], [33, 25, 60, 22]]);
    return { mode: 'aurora', body: `
      ${header(s)}
      ${stage(`<div class="glass fx col" style="flex:1;padding:40px 60px;gap:${gap}px;justify-content:space-evenly;">
          ${steps.map((st, i) => `<div class="fx ac" style="gap:30px;"><div class="numchip" style="background:${C(i + 1)};width:${chip}px;height:${chip}px;font-size:${Math.round(chip * .45)}px;">${i + 1}</div><div><div class="ink-t fw8" style="font-size:${tf}px;line-height:1.2;">${rich(st.title)}</div>${st.text ? `<div class="muted fw5" style="font-size:${xf}px;margin-top:8px;line-height:1.4;">${rich(st.text)}</div>` : ''}</div></div>`).join('\n          ')}
        </div>`)}${take(s.takeaway)}` };
  },
  stats(s) {
    const bars = s.bars || []; if (bars.length > 3) warn(`stats "${s.title}": ${bars.length} bars (limit ~3)`);
    const big = s.big;
    return { mode: 'aurora', body: `
      ${header(s)}
      ${stage(`<div class="grid" style="flex:1;grid-template-columns:${big ? '1.4fr 1fr' : '1fr'};gap:40px;align-items:stretch;">
          <div class="glass fx col" style="padding:56px 60px;justify-content:space-evenly;">
            ${bars.map((b, i) => `<div class="fx col" style="gap:14px;"><div class="fw7 ink-t" style="font-size:30px;">${rich(b.label)}</div><div class="bartrack" style="height:64px;"><div class="barfill f-${b.color || i + 1}" style="width:${Math.max(0, Math.min(100, b.value))}%;font-size:26px;padding-inline:24px;">${rich(b.text || '')}</div></div></div>`).join('\n            ')}
          </div>${big ? `
          <div class="inkcard fx col ac jc" style="padding:52px;text-align:center;gap:14px;">
            <div class="bignum spec" style="font-size:180px;"${rtl ? ' dir="ltr"' : ''}>${esc(big.value)}</div>
            <div class="white fw7" style="font-size:32px;line-height:1.35;">${lines(big.caption || '', 'white')}</div>
          </div>` : ''}
        </div>`)}${take(s.takeaway)}` };
  },
  closing(s) {
    const pts = s.points || []; if (pts.length > 6) warn(`closing "${s.title}": ${pts.length} points (limit ~6)`);
    const cols = pts.length === 4 ? 2 : 3;
    return { mode: 'aurora', cls: 'fx col ac jc', body: `
      <div style="width:100%;">
        <div class="fx col ac" style="gap:16px;text-align:center;margin-bottom:44px;">
          ${eyebrow(s.eyebrow)}
          <h1 class="title" style="font-size:72px;">${rich(s.title)}</h1>
        </div>
        <div class="grid" style="grid-template-columns:repeat(${cols},1fr);gap:28px;">
          ${pts.map((p, i) => `<div class="glass fx col" style="padding:52px 44px;gap:22px;background:rgba(255,255,255,.94);"><div class="numchip specbar" style="width:72px;height:72px;font-size:34px;">${i + 1}</div><div class="ink-t fw8" style="font-size:38px;line-height:1.25;">${rich(p.title)}</div><div class="muted fw6" style="font-size:28px;line-height:1.45;">${rich(p.text || '')}</div></div>`).join('\n          ')}
        </div>
        ${s.note ? `<p class="sub" style="font-size:22px;text-align:center;margin:28px auto 0;">${rich(s.note)}</p>` : ''}
      </div>` };
  },
  image(s) {
    if (!s.src) { console.error(`image slide "${s.title}": "src" is required`); process.exit(1); }
    if (!s.alt) warn(`image "${s.title}": add "alt" text describing the picture`);
    const pts = s.points || []; if (pts.length > 4) warn(`image "${s.title}": ${pts.length} points beside the image (limit ~4)`);
    const fs2 = pick(pts.length, [34, 34, 34, 31, 28]);
    const dim = imageSize(s.src), ratio = dim ? dim[0] / dim[1] : null, portrait = ratio && ratio < 0.9;
    if (!dim) warn(`image "${s.title}": could not read the image size (${s.src}); layout assumes landscape`);
    // portrait images (phone screenshots) get a column as wide as the picture, so it fills the height
    // width of a portrait frame = its height (the grid's height, 100cqh, minus padding and caption) x aspect ratio
    const pw = portrait ? `calc((100cqh - 36px${s.caption ? ' - 50px' : ''}) * ${ratio.toFixed(4)} + 36px)` : null;
    const frame = `<figure class="glass fx col" style="margin:0;padding:18px;gap:14px;min-height:0;">
            <div class="media${s.fit === 'cover' ? ' cover' : ''}" style="flex:1;"><img src="${esc(imgSrc(s.src))}" alt="${esc(s.alt || '')}"></div>${s.caption ? `
            <figcaption class="muted fw6" style="font-size:22px;text-align:center;">${rich(s.caption)}</figcaption>` : ''}
          </figure>`;
    if (!pts.length) return { mode: 'aurora', body: `
      ${header(s)}
      ${stage(`<div class="grid" style="flex:1;grid-template-columns:${portrait ? pw : '1fr'};justify-content:center;">${frame}</div>`, true)}${take(s.takeaway)}` };
    const text = `<div class="fx col" style="gap:${Math.round(fs2 * 1.1)}px;justify-content:center;">
            ${pts.map((t, i) => `<div class="fx" style="gap:18px;align-items:baseline;"><span class="bullet" style="background:${C([1, 3, 6, 2][i % 4])};width:${Math.round(fs2 * .42)}px;height:${Math.round(fs2 * .42)}px;transform:translateY(-.12em);"></span><span class="ink-t fw6" style="font-size:${fs2}px;line-height:1.35;">${rich(t, 'fw8')}</span></div>`).join('\n            ')}
          </div>`;
    const imageFirst = s.side === 'start';
    return { mode: 'aurora', body: `
      ${header(s)}
      ${stage(`<div class="grid" style="flex:1;grid-template-columns:${portrait ? (imageFirst ? `${pw} 1fr` : `1fr ${pw}`) : (imageFirst ? '1.35fr 1fr' : '1fr 1.35fr')};gap:56px;">
          ${imageFirst ? frame + '\n          ' + text : text + '\n          ' + frame}
        </div>`, true)}${take(s.takeaway)}` };
  },
  table(s) {
    const cols = s.columns || [], rows = s.rows || [];
    if (rows.length > 8) warn(`table "${s.title}": ${rows.length} rows (limit ~8)`);
    if (cols.length > 5) warn(`table "${s.title}": ${cols.length} columns (limit ~5)`);
    rows.forEach((r, i) => { if (cols.length && r.length !== cols.length) warn(`table "${s.title}": row ${i + 1} has ${r.length} cells, expected ${cols.length}`); });
    const fs2 = pick(rows.length, [30, 30, 30, 30, 28, 26, 24, 23, 22]);
    const hl = Number.isInteger(s.highlight) ? s.highlight : -1;
    const cell = (tag, v, j) => `<${tag}${j === hl ? ' class="hl"' : ''}>${rich(v, tag === 'th' ? 'hi' : 'fw8')}</${tag}>`;
    return { mode: 'clean-bordered', body: `
      ${header(s)}
      ${stage(`<div class="accent-border" style="margin:auto 0;">
          <table class="dtable" style="font-size:${fs2}px;">
            ${cols.length ? `<thead><tr>${cols.map((c, j) => cell('th', c, j)).join('')}</tr></thead>` : ''}
            <tbody>
              ${rows.map(r => `<tr>${r.map((c, j) => cell('td', c, j)).join('')}</tr>`).join('\n              ')}
            </tbody>
          </table>
        </div>`)}${take(s.takeaway)}` };
  },
  raw(s) { return { mode: s.mode || 'aurora', cls: s.cls || '', body: '\n      ' + s.html, noWm: s.noLogo }; },
};

// ---------- assemble ----------
const tpl = fs.readFileSync(TEMPLATE, 'utf8');
const dIdx = tpl.search(/\n {2}<div id="deck"/);
const tIdx = tpl.indexOf('  <!-- Floating navigation');
if (dIdx < 0 || tIdx < 0) { console.error('template.html structure not recognised'); process.exit(1); }
let head = tpl.slice(0, dIdx), tail = tpl.slice(tIdx);

// html element, title, font
if (!opt['keep-head']) head = head.replace(/<html lang="[^"]*" dir="[^"]*">/, `<html lang="${esc(meta.lang)}" dir="${esc(meta.dir)}">`);
if (!opt['keep-head']) head = head.replace(/<title>.*?<\/title>/, `<title>${esc(meta.title)}</title>`);
if (!opt['keep-head']) head = head.replace(/<!--[\s\S]*?-->/, `<!-- Built with the html-presentation skill (scripts/build-deck.js) from a content file. -->`);
if (meta.font) {
  const fam = String(meta.font);
  head = head.replace(/family=[^:&"]+:wght@/, `family=${fam.replace(/ /g, '+')}:wght@`);
  head = head.replace(/--font:[^;]+;/, `--font: '${fam}', ${rtl ? "'Arial Hebrew', " : ''}system-ui, -apple-system, 'Segoe UI', Arial, sans-serif;`);
}
if (meta.font === false || meta.fontLink === false) head = head.replace(/<link[^>]*fonts\.(googleapis|gstatic)[^>]*>\n?/g, '');

// theme tokens (first :root block only)
const rootEnd = head.indexOf('\n}', head.indexOf(':root'));
let rootBlock = head.slice(head.indexOf(':root'), rootEnd), restHead = head.slice(rootEnd);
const preRoot = head.slice(0, head.indexOf(':root'));
const tokenMap = { c1: '--c1', c2: '--c2', c3: '--c3', c4: '--c4', c5: '--c5', c6: '--c6', ink: '--ink', ink2: '--ink-2', muted: '--muted', bg: '--bg', bg2: '--bg-2', highlight: '--highlight', accent: '--accent', accentOnDark: '--accent-on-dark' };
// values may be url("data:...;base64,...") and so contain ';'
function setVar(name, val) { const re = new RegExp(`(${name.replace(/[-]/g, '\\-')}:\\s*)(?:url\\("[^"]*"\\)|[^;"])+;`); if (re.test(rootBlock)) rootBlock = rootBlock.replace(re, (_, p) => `${p}${val};`); else warn(`token ${name} not found in template`); }
for (const [k, v] of Object.entries(meta.tokens || {})) { if (tokenMap[k]) setVar(tokenMap[k], v); else warn(`unknown token "${k}"`); }

// logo
function logoUrl(p) {
  if (!p) return null;
  if (EMBED) {
    return imgSrc(p);
  }
  return p;
}
if (meta.logo) setVar('--logo', `url("${logoUrl(meta.logo)}")`);
if (meta.logo) setVar('--logo-dark', meta.logoDark ? `url("${logoUrl(meta.logoDark)}")` : 'var(--logo)');
if (Array.isArray(meta.logoSize)) { setVar('--logo-w', meta.logoSize[0] + 'px'); setVar('--logo-h', meta.logoSize[1] + 'px'); }
if (meta.logoOffset) { setVar('--logo-offset-x', meta.logoOffset[0] + 'px'); setVar('--logo-offset-y', meta.logoOffset[1] + 'px'); }
head = preRoot + rootBlock + restHead;

const slides = (content.slides || []).map((s, i) => {
  const gen = T[s.type]; if (!gen) { console.error(`slide ${i + 1}: unknown type "${s.type}"`); process.exit(1); }
  const o = gen(s); const mode = s.mode && s.type !== 'cover' && s.type !== 'raw' ? s.mode : o.mode;
  const noLogo = meta.logoPosition === 'none' || o.noWm;
  return `    <!-- SLIDE ${i + 1}: ${s.type}${s.title ? ' — ' + String(s.title).replace(/\*|--|\n/g, ' ').slice(0, 60) : ''} -->
    <div class="page ${mode}${o.cls ? ' ' + o.cls : ''}">
      ${noLogo ? '' : WM}${o.body}
    </div>
`;
});
if (!slides.length) { console.error('no slides in content file'); process.exit(1); }

const html = `${head}\n  <div id="deck" data-logo="${esc(meta.logoPosition)}">\n\n${slides.join('\n')}\n  </div>\n\n${tail}`;
const out = path.resolve(typeof opt.out === 'string' ? opt.out : input.replace(/\.json$/i, '') + '.html');
fs.writeFileSync(out, html);
console.log(`wrote ${path.relative(process.cwd(), out)} — ${slides.length} slides, ${(html.length / 1024).toFixed(0)} KB (content file ${(fs.statSync(input).size / 1024).toFixed(1)} KB)`);
warnings.forEach(w => console.warn('warning: ' + w));
