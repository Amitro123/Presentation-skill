#!/usr/bin/env node
/*
 * Build a deck from a small content file.
 *
 *   node tools/build-deck.js content.json [--out=deck.html] [--embed-logo]
 *
 * The content file lists slides by type (cover, bullets, cards, compare, steps, stats,
 * closing, section, statement, raw). This script adds the markup, theme tokens, logo,
 * navigation and print rules from template.html, so an assistant only has to write the
 * words. Format: skills/html-presentation/references/content-format.md
 * No dependencies; Node 16+.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v === undefined ? true : v]; }));
const input = args.find(a => !a.startsWith('--'));
if (!input) { console.error('usage: node tools/build-deck.js content.json [--out=deck.html] [--embed-logo]'); process.exit(2); }

const root = path.resolve(__dirname, '..');
const base = path.dirname(path.resolve(input));
const content = JSON.parse(fs.readFileSync(input, 'utf8'));
const meta = Object.assign({ lang: 'en', dir: 'ltr', title: 'Presentation', logoPosition: 'top-end', showAuthor: true }, content.meta || {});
const rtl = meta.dir === 'rtl';
const warnings = [];
const warn = m => warnings.push(m);

// ---------- text helpers ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LATIN = /[A-Za-z0-9$][A-Za-z0-9$%.,:\/+#&@_'-]*(?:\s+[A-Za-z0-9$][A-Za-z0-9$%.,:\/+#&@_'-]*)*/g;
function plain(text) {
  const e = esc(text);
  if (!rtl) return e;
  // isolate Latin runs so punctuation does not flip inside right-to-left text
  return e.replace(LATIN, run => {
    const m = run.match(/[.,:]+$/); const tail = m ? m[0] : ''; const core = tail ? run.slice(0, -tail.length) : run;
    return /[A-Za-z]/.test(core) ? `<span dir="ltr">${core}</span>${tail}` : run;
  });
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
const eyebrow = (t, dark) => t ? `<div class="eyebrow${dark ? ' on-dark' : ''}"><span class="dot"></span>${rich(t, 'spec')}</div>` : '';
const take = t => t ? `\n      <div class="take" style="margin-top:28px;">${rich(t, 'hi')}</div>` : '';
const header = (s, dark) => `<div class="hd">
        ${eyebrow(s.eyebrow, dark)}
        <h1 class="title${dark ? ' on-dark' : ''}">${rich(s.title)}</h1>${s.subtitle ? `\n        <p class="sub${dark ? ' on-dark' : ''}">${rich(s.subtitle)}</p>` : ''}
      </div>`;
const C = n => `var(--c${((n - 1) % 6) + 1})`;

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
    const colors = [1, 3, 6, 2, 5];
    return { mode: 'aurora', body: `
      ${header(s)}
      <div class="glass f1 fx col" style="padding:46px 56px;gap:26px;margin-top:32px;justify-content:center;">
        ${items.map((t, i) => `<div class="fx ac" style="gap:18px;"><span class="bullet" style="background:${C(colors[i % 5])};"></span><span class="ink-t fw6" style="font-size:28px;line-height:1.35;">${rich(t, 'fw8')}</span></div>`).join('\n        ')}
      </div>${take(s.takeaway)}` };
  },
  cards(s) {
    const cards = s.cards || []; if (cards.length > 4) warn(`cards "${s.title}": ${cards.length} cards (limit ~4)`);
    return { mode: 'aurora', body: `
      ${header(s)}
      <div class="grid f1" style="grid-template-columns:repeat(${cards.length},1fr);gap:28px;margin-top:34px;align-items:stretch;align-content:center;">
        ${cards.map((c, i) => `<div class="glass fx col" style="padding:48px 40px;gap:18px;border-top:6px solid ${C(i + 1)};">
          <div class="ink-t fw8" style="font-size:36px;line-height:1.2;">${rich(c.title)}</div>
          <div class="muted fw5" style="font-size:27px;line-height:1.5;">${rich(c.text)}</div>
        </div>`).join('\n        ')}
      </div>${take(s.takeaway)}` };
  },
  compare(s) {
    const side = (o, dark) => { const items = o.items || []; if (items.length > 5) warn(`compare "${s.title}": ${items.length} items on one side (limit ~5)`);
      return `<div class="${dark ? 'inkcard' : 'glass'}" style="padding:44px;">
          ${o.label ? `<div class="chip" style="background:${dark ? 'rgba(255,255,255,.14)' : 'rgba(110,98,87,.14)'};color:${dark ? '#fff' : 'var(--muted)'};margin-bottom:20px;">${rich(o.label, dark ? 'white' : 'muted')}</div>` : ''}
          ${o.title ? `<div class="${dark ? 'white' : 'ink-t'} fw8" style="font-size:32px;line-height:1.2;margin-bottom:22px;">${rich(o.title)}</div>` : ''}
          <div class="fx col" style="gap:20px;">
            ${items.map(t => dark
              ? `<div class="fx ac" style="gap:14px;"><span class="dot" style="width:14px;height:14px;flex-shrink:0;"></span><span class="white-2 fw6" style="font-size:25px;line-height:1.35;">${rich(t, 'white fw8')}</span></div>`
              : `<div class="fx ac" style="gap:14px;"><span class="bullet" style="background:var(--muted);"></span><span class="muted fw6" style="font-size:25px;line-height:1.35;">${rich(t, 'ink-t fw8')}</span></div>`).join('\n            ')}
          </div>
        </div>`; };
    return { mode: 'aurora', body: `
      ${header(s)}
      <div class="grid f1" style="grid-template-columns:1fr 1fr;gap:40px;margin-top:30px;align-items:stretch;align-content:center;">
        ${side(s.left || {}, false)}
        ${side(s.right || {}, true)}
      </div>${take(s.takeaway)}` };
  },
  steps(s) {
    const steps = s.steps || []; if (steps.length > 5) warn(`steps "${s.title}": ${steps.length} steps (limit ~5)`);
    return { mode: 'aurora', body: `
      ${header(s).replace('class="hd"', 'class="hd" style="margin-bottom:30px;"')}
      <div class="glass f1 fx col" style="padding:44px 56px;gap:30px;justify-content:center;">
        ${steps.map((st, i) => `<div class="fx ac" style="gap:26px;"><div class="numchip" style="background:${C(i + 1)};">${i + 1}</div><div><div class="ink-t fw8" style="font-size:32px;">${rich(st.title)}</div>${st.text ? `<div class="muted fw5" style="font-size:24px;margin-top:6px;line-height:1.4;">${rich(st.text)}</div>` : ''}</div></div>`).join('\n        ')}
      </div>${take(s.takeaway)}` };
  },
  stats(s) {
    const bars = s.bars || []; if (bars.length > 3) warn(`stats "${s.title}": ${bars.length} bars (limit ~3)`);
    const big = s.big;
    return { mode: 'aurora', body: `
      ${header(s)}
      <div class="grid f1 ac" style="grid-template-columns:${big ? '1.4fr 1fr' : '1fr'};gap:40px;margin-top:44px;">
        <div class="glass" style="padding:48px 52px;">
          <div class="fx col" style="gap:28px;">
            ${bars.map((b, i) => `<div class="fx col" style="gap:10px;"><div class="fw7 ink-t" style="font-size:24px;">${rich(b.label)}</div><div class="bartrack"><div class="barfill f-${b.color || i + 1}" style="width:${Math.max(0, Math.min(100, b.value))}%;">${rich(b.text || '')}</div></div></div>`).join('\n            ')}
          </div>
        </div>${big ? `
        <div class="inkcard fx col ac jc" style="padding:44px;text-align:center;gap:8px;">
          <div class="bignum spec"${rtl ? ' dir="ltr"' : ''}>${esc(big.value)}</div>
          <div class="white fw7" style="font-size:26px;line-height:1.35;">${lines(big.caption || '', 'white')}</div>
        </div>` : ''}
      </div>${take(s.takeaway)}` };
  },
  closing(s) {
    const pts = s.points || []; if (pts.length > 6) warn(`closing "${s.title}": ${pts.length} points (limit ~6)`);
    const cols = pts.length === 4 ? 2 : 3;
    return { mode: 'aurora', cls: 'fx col ac jc', body: `
      <div style="width:100%;">
        <div class="fx col ac" style="gap:12px;text-align:center;margin-bottom:28px;">
          ${eyebrow(s.eyebrow)}
          <h1 class="title" style="font-size:56px;">${rich(s.title)}</h1>
        </div>
        <div class="grid" style="grid-template-columns:repeat(${cols},1fr);gap:20px;">
          ${pts.map((p, i) => `<div class="glass fx col" style="padding:30px 24px;gap:14px;background:rgba(255,255,255,.94);"><div class="numchip specbar" style="width:48px;height:48px;font-size:24px;">${i + 1}</div><div class="ink-t fw8" style="font-size:24px;line-height:1.25;">${rich(p.title)}</div><div class="muted fw6" style="font-size:20px;line-height:1.45;">${rich(p.text || '')}</div></div>`).join('\n          ')}
        </div>
        ${s.note ? `<p class="sub" style="font-size:22px;text-align:center;margin:28px auto 0;">${rich(s.note)}</p>` : ''}
      </div>` };
  },
  raw(s) { return { mode: s.mode || 'aurora', cls: s.cls || '', body: '\n      ' + s.html, noWm: s.noLogo }; },
};

// ---------- assemble ----------
const tpl = fs.readFileSync(path.join(root, 'template.html'), 'utf8');
const dIdx = tpl.search(/\n {2}<div id="deck"/);
const tIdx = tpl.indexOf('  <!-- Floating navigation');
if (dIdx < 0 || tIdx < 0) { console.error('template.html structure not recognised'); process.exit(1); }
let head = tpl.slice(0, dIdx), tail = tpl.slice(tIdx);

// html element, title, font
head = head.replace(/<html lang="[^"]*" dir="[^"]*">/, `<html lang="${esc(meta.lang)}" dir="${esc(meta.dir)}">`);
head = head.replace(/<title>.*?<\/title>/, `<title>${esc(meta.title)}</title>`);
head = head.replace(/<!--[\s\S]*?-->/, `<!-- Built with the html-presentation skill (tools/build-deck.js) from a content file. -->`);
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
function setVar(name, val) { const re = new RegExp(`(${name.replace(/[-]/g, '\\-')}:\\s*)[^;]+;`); if (re.test(rootBlock)) rootBlock = rootBlock.replace(re, (_, p) => `${p}${val};`); else warn(`token ${name} not found in template`); }
for (const [k, v] of Object.entries(meta.tokens || {})) { if (tokenMap[k]) setVar(tokenMap[k], v); else warn(`unknown token "${k}"`); }

// logo
function logoUrl(p) {
  if (!p) return null;
  if (opt['embed-logo'] || meta.embedLogo) {
    const f = path.resolve(base, p); const ext = path.extname(f).slice(1).toLowerCase().replace('jpg', 'jpeg').replace('svg', 'svg+xml');
    return `data:image/${ext};base64,${fs.readFileSync(f).toString('base64')}`;
  }
  return p;
}
if (meta.logo) setVar('--logo', `url("${logoUrl(meta.logo)}")`);
setVar('--logo-dark', meta.logoDark ? `url("${logoUrl(meta.logoDark)}")` : (meta.logo ? 'var(--logo)' : 'url("assets/logo-placeholder-light.svg")'));
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
