// Generative, animated cover art for each project (no screenshots needed).
// Each style is a function (ctx, w, h, t, accent) drawing one frame.
const styles = {
  radar(c, w, h, t, a) {
    const cx = w * 0.78, cy = h * 0.42, R = Math.max(w, h) * 0.55;
    c.strokeStyle = a;
    c.globalAlpha = 0.25;
    for (let i = 1; i <= 5; i++) {
      c.beginPath();
      c.arc(cx, cy, (R / 5) * i, 0, Math.PI * 2);
      c.stroke();
    }
    const ang = t * 1.2;
    const g = c.createConicGradient ? c.createConicGradient(ang - 0.9, cx, cy) : null;
    if (g) {
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.14, a);
      g.addColorStop(0.15, 'transparent');
      c.fillStyle = g;
      c.globalAlpha = 0.35;
      c.beginPath();
      c.arc(cx, cy, R, 0, Math.PI * 2);
      c.fill();
    }
    // blips
    c.fillStyle = a;
    for (let i = 0; i < 9; i++) {
      const ba = i * 2.4, br = R * (0.2 + ((i * 37) % 70) / 100);
      const diff = (((ang - ba) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      c.globalAlpha = Math.max(0, 1 - diff / 2.5);
      c.beginPath();
      c.arc(cx + Math.cos(ba) * br, cy + Math.sin(ba) * br, 4, 0, Math.PI * 2);
      c.fill();
    }
  },
  bars(c, w, h, t, a) {
    const n = 22, bw = w / n;
    c.fillStyle = a;
    for (let i = 0; i < n; i++) {
      const v = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.6 + i * 0.55)) * (0.6 + 0.4 * Math.sin(i * 1.7));
      c.globalAlpha = 0.18 + v * 0.4;
      c.fillRect(i * bw + 2, h - v * h, bw - 4, v * h);
    }
    c.globalAlpha = 0.8;
    c.strokeStyle = '#fff';
    c.lineWidth = 2;
    c.beginPath();
    for (let x = 0; x <= w; x += 6) {
      const y = h * 0.45 + Math.sin(x * 0.012 + t) * h * 0.12 + Math.sin(x * 0.03 - t * 1.4) * h * 0.04;
      x ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
  },
  waves(c, w, h, t, a) {
    c.strokeStyle = a;
    for (let k = 0; k < 14; k++) {
      c.globalAlpha = 0.08 + k * 0.035;
      c.lineWidth = 1.2;
      c.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = h * 0.3 + k * h * 0.045 + Math.sin(x * 0.01 + t + k * 0.35) * h * 0.08 * Math.sin(t * 0.5 + k * 0.2);
        x ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
    }
  },
  orbit(c, w, h, t, a) {
    const cx = w * 0.75, cy = h * 0.4;
    c.strokeStyle = a;
    c.fillStyle = a;
    for (let i = 1; i <= 4; i++) {
      const rx = i * w * 0.08, ry = rx * 0.45;
      c.globalAlpha = 0.3;
      c.beginPath();
      c.ellipse(cx, cy, rx, ry, -0.3, 0, Math.PI * 2);
      c.stroke();
      const an = t * (1.4 / i) + i;
      const px = cx + Math.cos(an) * rx * Math.cos(-0.3) - Math.sin(an) * ry * Math.sin(-0.3);
      const py = cy + Math.cos(an) * rx * Math.sin(-0.3) + Math.sin(an) * ry * Math.cos(-0.3);
      c.globalAlpha = 1;
      c.beginPath();
      c.arc(px, py, 3 + i, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 0.9;
    c.beginPath();
    c.arc(cx, cy, 10, 0, Math.PI * 2);
    c.fill();
  },
  grid(c, w, h, t, a) {
    const s = 26;
    c.fillStyle = a;
    for (let y = 0; y < h; y += s) {
      for (let x = 0; x < w; x += s) {
        const v = Math.sin(x * 0.02 + t) * Math.cos(y * 0.03 - t * 0.8);
        c.globalAlpha = Math.max(0.05, v * 0.6);
        const r = 2 + Math.max(0, v) * 5;
        c.fillRect(x + s / 2 - r / 2, y + s / 2 - r / 2, r, r);
      }
    }
  },
  rings(c, w, h, t, a) {
    c.strokeStyle = a;
    for (let i = 0; i < 9; i++) {
      const r = ((t * 30 + i * 40) % 360) * (w / 500);
      c.globalAlpha = Math.max(0, 0.6 - r / (w * 0.75));
      c.lineWidth = 2;
      c.beginPath();
      c.arc(w * 0.8, h * 0.3, r, 0, Math.PI * 2);
      c.stroke();
    }
  },
};

const active = new Set();
let rafOn = false;

function tick(now) {
  const t = now / 1000;
  for (const item of active) draw(item, t);
  rafOn = active.size > 0;
  if (rafOn) requestAnimationFrame(tick);
}

function draw(item, t) {
  const { canvas, ctx, style, accent } = item;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(w * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  (styles[style] || styles.grid)(ctx, w, h, t * item.speed, accent);
  ctx.restore();
}

const io = new IntersectionObserver((entries) => {
  for (const en of entries) {
    const item = en.target.__art;
    if (en.isIntersecting) active.add(item);
    else active.delete(item);
  }
  if (!rafOn && active.size) {
    rafOn = true;
    requestAnimationFrame(tick);
  }
});

export function mountArt(canvas, style, accent, reduced = false) {
  const item = { canvas, ctx: canvas.getContext('2d'), style, accent, speed: reduced ? 0 : 1 };
  canvas.__art = item;
  if (reduced) {
    requestAnimationFrame(() => draw(item, 2));
    return () => {};
  }
  io.observe(canvas);
  return () => {
    io.unobserve(canvas);
    active.delete(item);
  };
}
