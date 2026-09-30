# Technical Slide Patterns

Patterns for engineering, architecture and cost/ROI decks. Use alongside `slide-templates.md`; all colors come from theme tokens.

## 1. Pipeline / architecture flow

Four-stage horizontal flow, each card color-coded with a top border.

```html
<div class="page aurora">
  <div class="wm" role="img" aria-label="Logo"></div>
  <div class="hd">
    <div class="eyebrow"><span class="dot"></span>System architecture</div>
    <h1 class="title">Request pipeline: <span class="spec">retrieve, reason, verify</span></h1>
    <p class="sub">How a request moves from intake to a checked result.</p>
  </div>
  <div class="grid f1 ac" style="grid-template-columns:repeat(4,1fr);gap:20px;margin-top:32px;">
    <div class="glass fx col" style="padding:28px 22px;gap:14px;border-top:5px solid var(--c1);">
      <div class="fx jb ac"><span class="chip" style="background:color-mix(in srgb,var(--c1) 12%,transparent);color:var(--c1);font-size:20px;">Step 01</span><span class="muted fw6" style="font-size:20px;">Ingest</span></div>
      <div class="ink-t fw8" style="font-size:22px;">Receive request</div>
      <div class="muted fw5" style="font-size:20px;line-height:1.4;">Validate input and check permissions.</div>
    </div>
    <div class="glass fx col" style="padding:28px 22px;gap:14px;border-top:5px solid var(--c3);">
      <div class="fx jb ac"><span class="chip" style="background:color-mix(in srgb,var(--c3) 12%,transparent);color:var(--c3);font-size:20px;">Step 02</span><span class="muted fw6" style="font-size:20px;">Retrieve</span></div>
      <div class="ink-t fw8" style="font-size:22px;">Gather context</div>
      <div class="muted fw5" style="font-size:20px;line-height:1.4;">Hybrid search across documents and data stores.</div>
    </div>
    <div class="glass fx col" style="padding:28px 22px;gap:14px;border-top:5px solid var(--c6);">
      <div class="fx jb ac"><span class="chip" style="background:color-mix(in srgb,var(--c6) 12%,transparent);color:var(--c6);font-size:20px;">Step 03</span><span class="muted fw6" style="font-size:20px;">Reason</span></div>
      <div class="ink-t fw8" style="font-size:22px;">Generate</div>
      <div class="muted fw5" style="font-size:20px;line-height:1.4;">Model call with the assembled context.</div>
    </div>
    <div class="glass fx col" style="padding:28px 22px;gap:14px;border-top:5px solid var(--c5);">
      <div class="fx jb ac"><span class="chip" style="background:color-mix(in srgb,var(--c5) 12%,transparent);color:var(--c5);font-size:20px;">Step 04</span><span class="muted fw6" style="font-size:20px;">Verify</span></div>
      <div class="ink-t fw8" style="font-size:22px;">Check and return</div>
      <div class="muted fw5" style="font-size:20px;line-height:1.4;">Score output against a binary checklist before delivery.</div>
    </div>
  </div>
  <div class="take" style="margin-top:24px;">Design note — <span class="hi">separating generation from verification improves accuracy</span>.</div>
</div>
```

## 2. Cost breakdown table (Dark)

```html
<div class="page dark">
  <div class="wm" role="img" aria-label="Logo"></div>
  <div class="hd">
    <div class="eyebrow on-dark"><span class="dot"></span>Cost model</div>
    <h1 class="title on-dark">Pricing and <span class="spec">caching impact</span></h1>
    <p class="sub on-dark">Illustrative numbers — replace with your own.</p>
  </div>
  <div class="grid f1 ac" style="grid-template-columns:1.2fr 1fr;gap:36px;margin-top:36px;">
    <div class="glass fx col" style="padding:36px 40px;gap:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);">
      <div class="white fw8" style="font-size:26px;margin-bottom:8px;">Price per 1M units</div>
      <div class="fx jb ac" style="padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.1);"><span class="white-2 fw6" style="font-size:20px;">Standard input</span><span class="white fw8" style="font-size:22px;">$3.00</span></div>
      <div class="fx jb ac" style="padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.1);"><span class="white-2 fw6" style="font-size:20px;">Cached read</span><span class="fw8" style="font-size:24px;color:var(--c6);">$0.30 (-90%)</span></div>
      <div class="fx jb ac"><span class="white-2 fw6" style="font-size:20px;">Output</span><span class="white fw8" style="font-size:22px;">$15.00</span></div>
    </div>
    <div class="inkcard fx col ac jc" style="padding:40px;text-align:center;gap:12px;">
      <div class="chip" style="background:color-mix(in srgb,var(--c6) 20%,transparent);color:var(--c6);font-size:20px;">Measured saving</div>
      <div class="bignum spec" style="font-size:130px;">88%</div>
      <div class="white fw7" style="font-size:24px;">lower monthly spend after introducing caching</div>
    </div>
  </div>
</div>
```

## 3. Three pillars: security / principles (Dark)

```html
<div class="grid f1 ac" style="grid-template-columns:repeat(3,1fr);gap:24px;margin-top:36px;">
  <div class="glass fx col" style="padding:32px 26px;gap:14px;background:rgba(255,255,255,.07);border-color:color-mix(in srgb,var(--c3) 40%,transparent);">
    <div class="numchip" style="background:var(--c3);width:44px;height:44px;font-size:22px;">01</div>
    <div class="white fw8" style="font-size:24px;">Pillar title</div>
    <div class="white-2 fw5" style="font-size:20px;line-height:1.45;">Two lines explaining the principle and why it matters.</div>
  </div>
  <!-- repeat with --c6 and --c5 -->
</div>
```

Use these after a `.hd` on a `.page.dark` slide.
