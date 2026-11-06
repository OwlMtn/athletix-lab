/*!
 * Athletix Lab Sports Therapy — animated logo, "Reveal" cut.
 *
 * Drop-in:
 *   <div class="athletix-reveal" style="width:min(90vw,820px)"></div>
 *   <script src="/assets/athletix-reveal.js" defer></script>
 *
 * The logo inherits the surrounding text color (currentColor), so it is black on the cream
 * hero and white on the dark header/footer with no extra setup.
 *
 * Options (data attributes on the div):
 *   data-color="#0d0d0b"   force an ink color instead of currentColor
 *   data-autoplay="load"   play immediately (default: "visible" = play when scrolled into view)
 *   data-loop="true"       loop with a 0.5 s gap (default: play once, hold the final frame)
 *   data-delay="400"       wait this many ms before starting (default 0)
 *   data-static="true"     no motion: render the finished logo (also used automatically for
 *                          visitors who prefer reduced motion)
 *   data-font="none"       do not load Montserrat from Google Fonts (if the site already does)
 *
 * JS API: AthletixReveal.play(el), AthletixReveal.seek(el, ms), AthletixReveal.mount(el)
 * Event:  the div fires "athletix-reveal:done" when the animation finishes.
 */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- geometry (local units; H = cap height of the wordmark, X center = 0,0) ---------- */
  var FS = 176, H = 0.7 * FS, TFS = 0.61 * H;
  var K_F = 1.13, K_C = 1.22;                              // dx per dy of the slash band and the cut through it
  var W_B = 0.38 * H, W_F = 0.45 * H, W_C = 0.13 * H, HALO = 0.165 * H;
  var Y_TOP = -0.735 * H, Y_BOT = 1.05 * H;                // the band overshoots the cap line and the baseline
  var CAP_TOP = -0.5 * H, BASE = 0.5 * H;
  var XL = 0.70 * H, XR = 1.16 * H;                        // ink gaps from the X center to the I and the L
  var TRACK = 0.02 * FS;

  /* ---------- timing (ms) ---------- */
  var T = {
    band: [0, 320], back: [180, 300], impact: [420, 260],
    lab: [480, 340, 60],                                    // start, duration, stagger per letter
    bar: [700, 650],
    athleti: [820, 320, 45],
    tagline: [1250, 700],
    end: 3600, loopGap: 500
  };

  /* ---------- helpers ---------- */
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function f2(v) { return Math.round(v * 100) / 100; }
  function pts(a) { return a.map(function (p) { return f2(p[0]) + ',' + f2(p[1]); }).join(' '); }
  function para(x0, y0, x1, y1, w) { return [[x0 - w / 2, y0], [x0 + w / 2, y0], [x1 + w / 2, y1], [x1 - w / 2, y1]]; }
  function bandX(y) { return -K_F * y; }
  function cutX(y) { return -K_C * y; }
  function lens(xL, xR) {
    var yc = BASE + 0.33 * H, c = (xL + xR) / 2;
    var flatT = Math.min(0.9 * H, (xR - xL) / 2 - 0.3 * H), flatB = Math.min(0.4 * H, (xR - xL) / 2 - 0.3 * H);
    return [[xL, yc], [c - flatT, yc - 0.09 * H], [c + flatT, yc - 0.09 * H], [xR, yc], [c + flatB, yc + 0.08 * H], [c - flatB, yc + 0.08 * H]];
  }
  var EASE = {
    outExpo: function (p) { return p === 1 ? 1 : 1 - Math.pow(2, -10 * p); },
    outBack: function (p) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); }
  };

  /* offscreen SVG for text measurement, so the logo lays out even inside a hidden container */
  var measurer;
  function measure(str, size, weight) {
    if (!measurer) {
      measurer = el('svg', { 'aria-hidden': 'true' });
      measurer.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9999px';
      document.body.appendChild(measurer);
    }
    var t = el('text', { 'font-size': size, 'font-weight': weight }, measurer);
    t.style.fontFamily = "Montserrat,'Arial Black',Arial,sans-serif";
    t.textContent = str === ' ' ? ' ' : str;
    var w = t.getComputedTextLength();
    measurer.removeChild(t);
    return w;
  }

  /* ---------- build ---------- */
  var uid = 0;
  function build(svg) {
    svg.innerHTML = '';
    var id = 'axr' + (++uid);
    var defs = el('defs', {}, svg);
    var big = { x: -4000, y: -4000, width: 8000, height: 8000 };

    var halo = el('mask', { id: id + '-halo', maskUnits: 'userSpaceOnUse', x: big.x, y: big.y, width: big.width, height: big.height }, defs);
    el('rect', { x: big.x, y: big.y, width: big.width, height: big.height, fill: '#fff' }, halo);
    el('polygon', { fill: '#000', points: pts(para(bandX(Y_TOP - 0.05 * H), Y_TOP - 0.05 * H, bandX(Y_BOT + 0.05 * H), Y_BOT + 0.05 * H, W_F + 2 * HALO)) }, halo);
    var cut = el('mask', { id: id + '-cut', maskUnits: 'userSpaceOnUse', x: big.x, y: big.y, width: big.width, height: big.height }, defs);
    el('rect', { x: big.x, y: big.y, width: big.width, height: big.height, fill: '#fff' }, cut);
    el('polygon', { fill: '#000', points: pts(para(cutX(Y_TOP - 0.2 * H), Y_TOP - 0.2 * H, cutX(Y_BOT + 0.2 * H), Y_BOT + 0.2 * H, W_C)) }, cut);
    el('polygon', { points: pts(para(-0.405 * H, CAP_TOP, 0.405 * H, BASE, W_B)) }, el('clipPath', { id: id + '-cb' }, defs));
    el('polygon', { points: pts(para(bandX(Y_TOP), Y_TOP, bandX(Y_BOT), Y_BOT, W_F)) }, el('clipPath', { id: id + '-cf' }, defs));

    var outer = el('g', {}, svg);
    var P = {};

    function stroke(parent, clipId, a, b, w) {
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, e = 0.6 * H;
      var g = el('g', { 'clip-path': 'url(#' + clipId + ')' }, parent);
      var ln = el('line', { x1: f2(a[0] - ux * e), y1: f2(a[1] - uy * e), x2: f2(b[0] + ux * e), y2: f2(b[1] + uy * e),
        'stroke-width': f2(w), 'stroke-dasharray': f2(L + 2 * e), 'stroke-dashoffset': f2(L + 2 * e), stroke: 'currentColor', fill: 'none' }, g);
      return { line: ln, len: L + 2 * e };
    }
    function letters(parent, str, size, weight, baseline) {
      return str.split('').map(function (ch) {
        var t = el('text', { x: 0, y: f2(baseline), 'font-size': size, 'font-weight': weight, fill: 'currentColor' }, parent);
        t.style.fontFamily = "Montserrat,'Arial Black',Arial,sans-serif";
        t.textContent = ch === ' ' ? ' ' : ch;
        return { t: t, w: measure(ch, size, weight) };
      });
    }

    /* X */
    var xgrp = el('g', {}, outer);
    var xcut = el('g', { mask: 'url(#' + id + '-cut)' }, xgrp);
    P.xgrp = xgrp;
    P.band = stroke(xcut, id + '-cf', [bandX(Y_BOT), Y_BOT], [bandX(Y_TOP), Y_TOP], 0.75 * H);
    P.back = stroke(xcut, id + '-cb', [-0.405 * H, CAP_TOP], [0.405 * H, BASE], 0.6 * H);

    /* LAB */
    var lab = letters(el('g', {}, outer), 'LAB', FS, 900, BASE), x = XR - 0.07 * FS;
    lab.forEach(function (l) { l.t.setAttribute('x', f2(x)); x += l.w + TRACK; });
    var labEnd = x - TRACK - 0.04 * FS;
    P.lab = lab.map(function (l) { return l.t; });

    /* ATHLETI + bar (both broken through by the band) */
    var cutG = el('g', { mask: 'url(#' + id + '-halo)' }, outer);
    var ath = letters(el('g', {}, cutG), 'ATHLETI', FS, 900, BASE);
    var total = ath.reduce(function (s, l) { return s + l.w; }, 0) + TRACK * (ath.length - 1);
    x = -XL + 0.04 * FS - total;
    var athStart = x + 0.06 * FS;
    ath.forEach(function (l) { l.t.setAttribute('x', f2(x)); x += l.w + TRACK; });
    P.ath = ath.map(function (l) { return l.t; });
    var barL = athStart + 0.18 * H, barR = labEnd - 0.19 * H, barC = (barL + barR) / 2;
    P.bar = el('polygon', { fill: 'currentColor', points: pts(lens(barL, barR)) }, cutG);

    /* tagline */
    var tag = letters(el('g', {}, outer), 'SPORTS THERAPY', TFS, 600, 0), ls = 0.26 * TFS;
    var tw = tag.reduce(function (s, l) { return s + l.w; }, 0) + ls * (tag.length - 1);
    var tagBase = BASE + 0.33 * H + 0.08 * H + 0.81 * H, tx = barC - tw / 2;
    P.tag = tag.map(function (l) {
      l.t.setAttribute('x', f2(tx)); l.t.setAttribute('y', f2(tagBase));
      var c = tx + l.w / 2; tx += l.w + ls;
      return { t: l.t, off: (c - barC) * 0.6 };
    });

    /* viewBox fitted to the lockup, like the PNG it replaces */
    var xmin = Math.min(athStart, bandX(Y_BOT) - W_F / 2), xmax = labEnd, ymin = Y_TOP, ymax = tagBase, pad = 0.12 * H;
    svg.setAttribute('viewBox', f2(xmin - pad) + ' ' + f2(ymin - pad) + ' ' + f2(xmax - xmin + 2 * pad) + ' ' + f2(ymax - ymin + 2 * pad));

    /* timeline */
    var tw2 = [];
    function add(e, from, to, delay, dur, ease) { tw2.push({ el: e, from: from, to: to, delay: delay, dur: dur, ease: EASE[ease] }); }
    add(P.band.line, { dash: P.band.len }, { dash: 0 }, T.band[0], T.band[1], 'outExpo');
    add(P.back.line, { dash: P.back.len }, { dash: 0 }, T.back[0], T.back[1], 'outExpo');
    add(P.xgrp, { sx: 1.08, sy: 1.08 }, { sx: 1, sy: 1 }, T.impact[0], T.impact[1], 'outBack');
    P.lab.forEach(function (l, i) { add(l, { opacity: 0, tx: 0.35 * H }, { opacity: 1, tx: 0 }, T.lab[0] + i * T.lab[2], T.lab[1], 'outExpo'); });
    add(P.bar, { sx: 0 }, { sx: 1 }, T.bar[0], T.bar[1], 'outExpo');
    P.ath.slice().reverse().forEach(function (l, i) { add(l, { opacity: 0, tx: 0.18 * H }, { opacity: 1, tx: 0 }, T.athleti[0] + i * T.athleti[2], T.athleti[1], 'outExpo'); });
    P.tag.forEach(function (o) { add(o.t, { opacity: 0, tx: o.off }, { opacity: 1, tx: 0 }, T.tagline[0], T.tagline[1], 'outExpo'); });
    tw2.sort(function (a, b) { return a.delay - b.delay; });
    return tw2;
  }

  /* ---------- render ---------- */
  function apply(e, vals) {
    var st = e.__st || (e.__st = { tx: 0, ty: 0, sx: 1, sy: 1 }), t = false;
    for (var k in vals) {
      if (k === 'tx' || k === 'ty' || k === 'sx' || k === 'sy') { st[k] = vals[k]; t = true; }
      else if (k === 'opacity') e.setAttribute('opacity', vals[k].toFixed(3));
      else if (k === 'dash') e.setAttribute('stroke-dashoffset', vals[k].toFixed(2));
    }
    if (t) e.setAttribute('transform', 'translate(' + st.tx.toFixed(2) + ' ' + st.ty.toFixed(2) + ') scale(' + st.sx.toFixed(4) + ' ' + st.sy.toFixed(4) + ')');
  }
  function render(tweens, t) {
    for (var i = 0; i < tweens.length; i++) {
      var tw = tweens[i], p = t <= tw.delay ? 0 : Math.min(1, (t - tw.delay) / tw.dur), e = tw.ease(p), v = {};
      for (var k in tw.from) v[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * e;
      apply(tw.el, v);
    }
  }

  /* ---------- instances ---------- */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fontPromise = null;
  function ensureFont(load) {
    if (fontPromise) return fontPromise;
    if (load && !document.querySelector('link[href*="Montserrat"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@600;900&display=swap';
      document.head.appendChild(l);
    }
    fontPromise = document.fonts ? Promise.race([
      document.fonts.load('900 10px Montserrat').then(function () { return document.fonts.load('600 10px Montserrat'); }),
      new Promise(function (r) { setTimeout(r, 2500); })
    ]).catch(function () {}) : Promise.resolve();
    return fontPromise;
  }

  function mount(host) {
    if (host.__axr) return host.__axr;
    var d = host.dataset;
    var inst = { host: host, tweens: [], clock: 0, playing: false, loop: d.loop === 'true', delay: +(d.delay || 0),
      stat: d.static === 'true' || reduce, started: false, gap: 0, last: 0 };
    host.__axr = inst;
    var svg = el('svg', { role: 'img', 'aria-label': 'Athletix Lab Sports Therapy' }, host);
    svg.style.cssText = 'display:block;width:100%;height:auto;overflow:visible';
    if (d.color) svg.style.color = d.color;
    inst.svg = svg;

    function rebuild(keep) {
      var c = inst.clock;
      inst.tweens = build(svg);
      inst.clock = keep ? Math.min(c, T.end) : 0;
      render(inst.tweens, inst.stat ? T.end : inst.clock);
    }
    inst.rebuild = rebuild;

    ensureFont(d.font !== 'none').then(function () {
      rebuild(false);
      if (document.fonts) document.fonts.addEventListener('loadingdone', function () { rebuild(true); });
      if (inst.stat) return;
      var mode = d.autoplay || 'visible';
      if (mode === 'false' || mode === 'none') return;
      if (mode === 'load' || !('IntersectionObserver' in window)) { start(inst); return; }
      var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { io.disconnect(); start(inst); } }); }, { threshold: 0.3 });
      io.observe(host);
    });
    return inst;
  }

  function start(inst) {
    if (inst.started) return;
    inst.started = true;
    setTimeout(function () { play(inst); }, inst.delay);
  }
  function play(inst) {
    inst.clock = 0; inst.playing = true; inst.gap = 0; inst.last = performance.now();
    requestAnimationFrame(function step(now) {
      if (!inst.playing) return;
      var dt = Math.min(50, now - inst.last); inst.last = now;
      if (inst.gap) { if (now >= inst.gap) { inst.gap = 0; inst.clock = 0; } }
      else {
        inst.clock = Math.min(T.end, inst.clock + dt);
        if (inst.clock >= T.end) {
          inst.host.dispatchEvent(new CustomEvent('athletix-reveal:done', { bubbles: true }));
          if (inst.loop) inst.gap = now + T.loopGap; else inst.playing = false;
        }
      }
      render(inst.tweens, inst.clock);
      requestAnimationFrame(step);
    });
  }

  window.AthletixReveal = {
    mount: mount,
    play: function (host) { var i = mount(host); i.started = true; if (i.tweens.length) play(i); },
    seek: function (host, ms) { var i = mount(host); i.playing = false; i.clock = Math.max(0, Math.min(T.end, ms)); render(i.tweens, i.clock); },
    timing: T
  };

  function auto() { document.querySelectorAll('.athletix-reveal').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();