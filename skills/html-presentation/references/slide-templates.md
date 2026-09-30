# Slide Templates

Copy-paste snippets for slides inside `<div id="deck">`. Each one shows the logo slot (`.wm`) — keep it consistent across the deck, or omit it everywhere if there is no logo. On `dark` slides invert a dark logo with `filter:brightness(0) invert(1)` or supply a light version.

## Logo slot

```html
<div class="wm"><img src="assets/logo.svg" alt="Logo" style="height:56px;width:auto;"></div>
```

## 1. Cover (Aurora or Dark)

```html
<div class="page aurora fx col ac jc">
  <div class="wm"><img src="assets/logo.svg" alt="Logo" style="height:56px;width:auto;"></div>
  <div class="fx col ac" style="gap:34px;text-align:center;max-width:1400px;">
    <div class="eyebrow"><span class="dot"></span>Category · Subtitle</div>
    <h1 class="title" style="font-size:104px;line-height:1.02;">Main title with a <span class="spec">highlight</span></h1>
    <p class="sub" style="font-size:33px;text-align:center;max-width:1080px;">One sentence on what this deck is about and for whom.</p>
    <div class="specbar" style="width:280px;height:8px;border-radius:999px;"></div>
  </div>
</div>
```

For a dark cover use `class="page dark fx col ac jc"` and add `on-dark` to `.eyebrow`, `.title`, `.sub`.

## 2. Section divider (Dark)

```html
<div class="page dark fx col ac jc">
  <div class="wm"><img src="assets/logo.svg" alt="Logo" style="height:56px;width:auto;"></div>
  <div class="fx col ac" style="gap:26px;text-align:center;max-width:1300px;">
    <div class="eyebrow on-dark"><span class="dot"></span>Part 02</div>
    <h1 class="title on-dark" style="font-size:84px;">Next topic with a <span class="spec">key phrase</span></h1>
    <p class="sub on-dark" style="text-align:center;max-width:960px;">What the audience will learn in this part.</p>
    <div class="specbar" style="width:220px;height:8px;border-radius:999px;"></div>
  </div>
</div>
```

## 3. Bullets (Aurora)

```html
<div class="page aurora">
  <div class="wm"><img src="assets/logo.svg" alt="Logo" style="height:56px;width:auto;"></div>
  <div class="hd">
    <div class="eyebrow"><span class="dot"></span>Topic</div>
    <h1 class="title">Slide headline</h1>
    <p class="sub">Lead-in sentence that frames the points.</p>
  </div>
  <div class="glass f1 fx col" style="padding:46px 56px;gap:26px;margin-top:32px;justify-content:center;">
    <div class="fx ac" style="gap:18px;"><span class="bullet" style="background:var(--c1);"></span><span class="ink-t fw6" style="font-size:26px;">First point.</span></div>
    <div class="fx ac" style="gap:18px;"><span class="bullet" style="background:var(--c3);"></span><span class="ink-t fw6" style="font-size:26px;">Second point.</span></div>
    <div class="fx ac" style="gap:18px;"><span class="bullet" style="background:var(--c6);"></span><span class="ink-t fw6" style="font-size:26px;">Third point.</span></div>
  </div>
  <div class="take" style="margin-top:24px;">Takeaway — <span class="hi">the one thing to remember</span>.</div>
</div>
```

## 4. Two-column comparison (Glass vs. Ink)

```html
<div class="grid f1 ac" style="grid-template-columns:1fr 1fr;gap:40px;margin-top:34px;">
  <div class="glass" style="padding:48px;">
    <div class="chip" style="background:rgba(100,116,139,.14);color:var(--muted);margin-bottom:22px;">Before</div>
    <div class="ink-t fw8" style="font-size:32px;margin-bottom:26px;">Current approach</div>
    <div class="fx col" style="gap:14px;">
      <div class="fx ac" style="gap:12px;"><span class="bullet" style="width:10px;height:10px;background:var(--muted);"></span><span class="muted fw6" style="font-size:23px;">Limitation</span></div>
    </div>
  </div>
  <div class="inkcard" style="padding:48px;">
    <div class="chip" style="background:rgba(255,255,255,.14);color:#fff;margin-bottom:22px;">After</div>
    <div class="white fw8" style="font-size:32px;margin-bottom:26px;">Recommended approach</div>
    <div class="fx col" style="gap:14px;">
      <div class="fx ac" style="gap:12px;"><span class="dot" style="width:12px;height:12px;flex-shrink:0;"></span><span class="white-2 fw6" style="font-size:23px;">Advantage</span></div>
    </div>
  </div>
</div>
```

Place it after a `.hd` header block; add a `.take` strip underneath.

## 5. Stats: bars + big number

```html
<div class="grid f1 ac" style="grid-template-columns:1.4fr 1fr;gap:40px;margin-top:44px;">
  <div class="glass" style="padding:48px 52px;">
    <div class="fx col" style="gap:28px;">
      <div class="fx col" style="gap:10px;"><div class="fw7 ink-t" style="font-size:23px;">Baseline</div><div class="bartrack"><div class="barfill f-3" style="width:90%;">45 min</div></div></div>
      <div class="fx col" style="gap:10px;"><div class="fw7 ink-t" style="font-size:23px;">With the new process</div><div class="bartrack"><div class="barfill f-6" style="width:20%;">2 min</div></div></div>
    </div>
  </div>
  <div class="inkcard fx col ac jc" style="padding:44px;text-align:center;gap:8px;">
    <div class="bignum spec">22×</div>
    <div class="white fw7" style="font-size:26px;line-height:1.35;">faster end to end</div>
  </div>
</div>
```

## 6. Steps (Aurora)

```html
<div class="glass f1 fx col" style="padding:44px 54px;gap:26px;justify-content:center;">
  <div class="fx ac" style="gap:22px;"><div class="numchip" style="background:var(--c1);">1</div><div><div class="ink-t fw8" style="font-size:28px;">Step title</div><div class="muted fw5" style="font-size:22px;margin-top:4px;">One-line description.</div></div></div>
  <div class="fx ac" style="gap:22px;"><div class="numchip" style="background:var(--c3);">2</div><div><div class="ink-t fw8" style="font-size:28px;">Step title</div><div class="muted fw5" style="font-size:22px;margin-top:4px;">One-line description.</div></div></div>
  <div class="fx ac" style="gap:22px;"><div class="numchip" style="background:var(--c6);">3</div><div><div class="ink-t fw8" style="font-size:28px;">Step title</div><div class="muted fw5" style="font-size:22px;margin-top:4px;">One-line description.</div></div></div>
</div>
```

## 7. Closing summary grid (Aurora)

```html
<div class="page aurora fx col ac jc">
  <div class="wm"><img src="assets/logo.svg" alt="Logo" style="height:56px;width:auto;"></div>
  <div style="width:100%;">
    <div class="fx col ac" style="gap:12px;text-align:center;margin-bottom:28px;">
      <div class="eyebrow"><span class="dot"></span>Summary</div>
      <h1 class="title" style="font-size:56px;">Key points to remember</h1>
    </div>
    <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:20px;">
      <div class="glass fx col" style="padding:30px 24px;gap:14px;background:rgba(255,255,255,.94);">
        <div class="numchip specbar" style="width:48px;height:48px;font-size:24px;">1</div>
        <div class="ink-t fw8" style="font-size:22px;line-height:1.25;">Point</div>
        <div class="muted fw6" style="font-size:18px;line-height:1.45;">Supporting sentence.</div>
      </div>
      <!-- repeat for 2 and 3 -->
    </div>
  </div>
</div>
```
