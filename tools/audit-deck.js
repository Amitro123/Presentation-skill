#!/usr/bin/env node
/*
 * Deck audit — renders one or more HTML decks in Chromium and reports objective problems.
 *
 *   npm i -D playwright            (once; uses your installed Chromium or `npx playwright install chromium`)
 *   node tools/audit-deck.js template.html examples/hebrew-example.html
 *   node tools/audit-deck.js my-deck.html --slide-selector=.slide --chromium=/path/to/chromium
 *
 * Works on decks built from template.html (`.page`) and on other single-file decks
 * that mark slides with `.slide` and the visible one with `.active`.
 * Exit code is 1 if any deck has a FAIL.
 */
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.error('playwright is not installed: npm i -D playwright'); process.exit(2); }

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const files = args.filter(a => !a.startsWith('--'));
if (!files.length) { console.error('usage: node tools/audit-deck.js <deck.html> [...] [--slide-selector=.page] [--chromium=path] [--views=1920x1080,1366x768]'); process.exit(2); }
const VIEWS = (opt.views || '1920x1080,1366x768').split(',').map(v => v.split('x').map(Number));

(async () => {
  const browser = await chromium.launch(opt.chromium ? { executablePath: opt.chromium } : {});
  let failed = false;
  for (const f of files) {
    const res = [];
    const add = (id, name, ok, detail = '') => res.push({ id, name, ok, detail });
    const ctx = await browser.newContext({ viewport: { width: VIEWS[0][0], height: VIEWS[0][1] } });
    await ctx.route(/\.(mp4|webm)(\?|$)/, r => r.abort());
    const pg = await ctx.newPage();
    const errors = [];
    pg.on('pageerror', e => errors.push(e.message.slice(0, 120)));
    await pg.goto('file://' + path.resolve(f), { waitUntil: 'load' });
    await pg.waitForTimeout(1200);

    const info = await pg.evaluate((forced) => {
      const sel = forced || (document.querySelector('.page') ? '.page' : '.slide');
      const slides = [...document.querySelectorAll(sel)];
      const css = t => [...document.styleSheets].some(s => { try { return [...s.cssRules].some(t); } catch { return false; } });
      const imgs = [...document.images];
      return {
        sel, n: slides.length, dir: document.documentElement.dir, lang: document.documentElement.lang,
        emoji: ((document.body.innerText.match(/\p{Extended_Pictographic}/gu)) || []).length,
        brokenImgs: imgs.filter(i => i.complete && !i.naturalWidth).length,
        noAlt: imgs.filter(i => !i.hasAttribute('alt')).length,
        ltrSpans: document.querySelectorAll('[dir=ltr]').length,
        latinInBody: /[A-Za-z]{3,}/.test(document.body.innerText),
        reducedMotion: css(r => /reduced-motion/.test(r.conditionText || '')),
        print: css(r => /print/.test(r.conditionText || '')),
        remoteScripts: [...document.scripts].map(s => s.src).filter(u => /^https?:/.test(u)),
        slideLogo: slides.filter(s => s.querySelector('.wm')).length,
      };
    }, opt['slide-selector']);

    add('A1', 'Slides found', info.n > 0, `${info.n} via "${info.sel}"`);
    add('A2', 'lang and dir set on <html>', !!info.lang && !!info.dir, `lang="${info.lang}" dir="${info.dir}"`);
    add('A3', 'No JavaScript errors', errors.length === 0, errors.join(' | '));
    add('A4', 'No broken images', info.brokenImgs === 0, `${info.brokenImgs} broken`);
    add('A5', 'Images have alt text', info.noAlt === 0, `${info.noAlt} missing`);
    add('A6', 'No runtime script from a CDN (works offline)', info.remoteScripts.length === 0, info.remoteScripts.join(', '));
    add('A7', 'prefers-reduced-motion respected', info.reducedMotion);
    add('A8', '@media print present', info.print);
    if (info.dir === 'rtl') add('A9', 'Latin terms isolated with dir=ltr (RTL decks)', !info.latinInBody || info.ltrSpans > 0, `${info.ltrSpans} spans`);
    add('A10', 'Emoji count (informational)', true, `${info.emoji}`);

    // keyboard: which keys move to another slide
    const active = () => pg.evaluate(sel => [...document.querySelectorAll(sel)].findIndex(s => s.classList.contains('active')), info.sel);
    const moved = {};
    const press = async k => { const b = await active(); await pg.keyboard.press(k); await pg.waitForTimeout(200); return (await active()) !== b; };
    for (const k of ['ArrowRight', 'ArrowLeft', 'Space', 'PageDown', 'PageUp', 'Home', 'End']) {
      let ok = await press(k);
      if (!ok) {                       // at the first/last slide a key can be a legitimate no-op: step inward and retry
        const step = (await active()) === 0 ? 'Space' : 'Home';
        if (await press(step)) ok = await press(k);
      }
      moved[k] = ok;
    }
    const missing = Object.entries(moved).filter(([, v]) => !v).map(([k]) => k);
    add('A11', 'Keyboard navigation (arrows, Space, PageUp/Down, Home/End)', missing.length === 0, missing.length ? `no effect: ${missing.join(', ')}` : '');

    // overflow per slide and viewport
    for (const [w, h] of VIEWS) {
      await pg.setViewportSize({ width: w, height: h }); await pg.waitForTimeout(150);
      const bad = [];
      for (let i = 0; i < info.n; i++) {
        await pg.evaluate(([sel, i]) => { const s = [...document.querySelectorAll(sel)]; s.forEach(x => x.classList.remove('active')); s[i].classList.add('active'); }, [info.sel, i]);
        await pg.waitForTimeout(100);
        const px = await pg.evaluate(([sel, i]) => {
          const s = document.querySelectorAll(sel)[i], sr = s.getBoundingClientRect(); let worst = 0;
          s.querySelectorAll('*').forEach(e => {
            const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
            const cs = getComputedStyle(e); if (cs.position === 'fixed' || cs.visibility === 'hidden' || cs.opacity === '0') return;
            if (e.closest('[aria-hidden=true],.gradient-mesh,.blob')) return;
            worst = Math.max(worst, r.bottom - sr.bottom, sr.top - r.top, r.right - sr.right, sr.left - r.left);
          });
          return Math.round(worst);
        }, [info.sel, i]);
        if (px > 4) bad.push(`${i + 1} (+${px}px)`);
      }
      add('A12', `Nothing overflows its slide at ${w}x${h}`, bad.length === 0, bad.join(', '));
    }

    // print
    await pg.setViewportSize({ width: VIEWS[0][0], height: VIEWS[0][1] });
    try {
      const pdf = await pg.pdf({ width: '1920px', height: '1080px', printBackground: true });
      const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
      add('A13', 'PDF export gives one page per slide', pages === info.n, `${pages} pages for ${info.n} slides`);
    } catch (e) { add('A13', 'PDF export gives one page per slide', false, e.message.slice(0, 80)); }

    console.log(`\n${f}`);
    for (const r of res) console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.id.padEnd(3)} ${r.name}${r.detail ? '  — ' + r.detail : ''}`);
    if (res.some(r => !r.ok)) failed = true;
    await ctx.close();
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
