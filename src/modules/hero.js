// Interactive particle name: thousands of dots that form the name, flee the
// cursor, spring back, and explode on click.
import { unlock } from './achievements.js';

export function initHero(name, reduced) {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  let W, H, dpr, particles = [];
  const mouse = { x: -9999, y: -9999, active: false };
  let running = true;
  let colorA = '#7cf8c4';
  let colorB = '#b388ff';

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    colorA = cs.getPropertyValue('--accent').trim() || colorA;
    colorB = cs.getPropertyValue('--accent-2').trim() || colorB;
  }

  function layoutText() {
    // Draw the name off-screen and sample its pixels to get target points.
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const o = off.getContext('2d');
    const words = name.toUpperCase().split(' ');
    const narrow = W < 700;
    const lines = narrow ? words : [words.join(' ')];
    let size = narrow ? W * 0.22 : W * 0.115;
    size = Math.min(size, narrow ? 140 : 210);
    o.font = `700 ${size}px "Space Grotesk", system-ui, sans-serif`;
    // shrink until it fits
    while (Math.max(...lines.map((l) => o.measureText(l).width)) > W * 0.9) {
      size *= 0.95;
      o.font = `700 ${size}px "Space Grotesk", system-ui, sans-serif`;
    }
    o.fillStyle = '#fff';
    o.textBaseline = 'middle';
    const gutter = Math.max(16, Math.min(W * 0.05, 72));
    const lineH = size * 0.92;
    const blockH = lineH * lines.length;
    // vertically: sit in the hero spacer, roughly 45% down
    const spacer = document.querySelector('.hero__spacer');
    const sr = spacer.getBoundingClientRect();
    const hr = hero.getBoundingClientRect();
    const centerY = sr.top - hr.top + sr.height / 2;
    lines.forEach((l, i) => {
      o.fillText(l, gutter, centerY - blockH / 2 + lineH * i + lineH / 2);
    });
    const data = o.getImageData(0, 0, W, H).data;
    const gap = Math.max(3, Math.round(size / 34));
    const pts = [];
    for (let y = 0; y < H; y += gap) {
      for (let x = 0; x < W; x += gap) {
        if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
      }
    }
    return { pts, gap };
  }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    readColors();
    const { pts, gap } = layoutText();
    const old = particles;
    particles = pts.map(([tx, ty], i) => {
      const p = old[i];
      return {
        x: p ? p.x : Math.random() * W,
        y: p ? p.y : Math.random() * H,
        vx: 0,
        vy: 0,
        tx,
        ty,
        r: gap * 0.42,
        b: Math.round((tx / W) * 11),
      };
    });
    groups = Array.from({ length: 12 }, () => []);
    particles.forEach((p) => groups[Math.min(11, p.b)].push(p));
    // ambient floaters
    floaters = Array.from({ length: Math.round((W * H) / 26000) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.4 + 0.3,
    }));
  }
  let floaters = [];
  let groups = [];

  function lerpColor(a, b, t) {
    const pa = parseHex(a), pb = parseHex(b);
    if (!pa || !pb) return a;
    return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
  }
  function parseHex(h) {
    const m = /^#?([0-9a-f]{6})$/i.exec(h);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // precomputed colour buckets so we don't build strings per particle per frame
  let buckets = [];
  function makeBuckets() {
    buckets = Array.from({ length: 12 }, (_, i) => lerpColor(colorA, colorB, i / 11));
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    const R = Math.min(140, W * 0.12);
    const R2 = R * R;

    // floaters + constellation lines near the mouse
    ctx.fillStyle = buckets[0];
    for (const f of floaters) {
      f.x += f.vx;
      f.y += f.vy;
      if (f.x < 0) f.x = W;
      if (f.x > W) f.x = 0;
      if (f.y < 0) f.y = H;
      if (f.y > H) f.y = 0;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      if (mouse.active) {
        const dx = f.x - mouse.x, dy = f.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 40000) {
          ctx.globalAlpha = (1 - d2 / 40000) * 0.4;
          ctx.strokeStyle = buckets[6];
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    for (let b = 0; b < buckets.length; b++) {
      ctx.fillStyle = buckets[b];
      ctx.beginPath();
      for (const p of groups[b]) {
        // spring to target
        p.vx += (p.tx - p.x) * 0.02;
        p.vy += (p.ty - p.y) * 0.02;
        // repel from cursor
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / R) * 6;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  function explode(cx, cy) {
    for (const p of particles) {
      const dx = p.x - cx, dy = p.y - cy;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = 30 + Math.random() * 50;
      p.vx += (dx / d) * f + (Math.random() - 0.5) * 20;
      p.vy += (dy / d) * f + (Math.random() - 0.5) * 20;
    }
    unlock('boom');
  }

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  hero.addEventListener('pointerleave', () => {
    mouse.x = mouse.y = -9999;
    mouse.active = false;
  });
  hero.addEventListener('click', (e) => {
    if (e.target.closest('a,button')) return;
    const r = hero.getBoundingClientRect();
    explode(e.clientX - r.left, e.clientY - r.top);
    document.getElementById('heroHint').style.opacity = '0';
  });

  // pause when hero is off-screen
  new IntersectionObserver(([en]) => {
    const was = running;
    running = en.isIntersecting;
    if (running && !was) requestAnimationFrame(frame);
  }).observe(hero);

  let rt;
  let lastW = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      // ignore mobile URL-bar height jitter
      if (hero.clientWidth === lastW && Math.abs(hero.clientHeight - H) < 120) return;
      lastW = hero.clientWidth;
      build();
      makeBuckets();
    }, 150);
  });
  document.addEventListener('themechange', () => {
    readColors();
    makeBuckets();
  });

  const start = () => {
    lastW = hero.clientWidth;
    build();
    makeBuckets();
    if (reduced) {
      particles.forEach((p) => ((p.x = p.tx), (p.y = p.ty)));
    }
    requestAnimationFrame(frame);
  };
  (document.fonts?.ready ?? Promise.resolve()).then(start);

  return { explode: () => explode(W / 2, H / 2) };
}
