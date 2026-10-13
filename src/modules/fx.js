// Full-screen effects: confetti and matrix rain, drawn on one overlay canvas.
const canvas = () => document.getElementById('fxCanvas');
let running = null;

function setup() {
  const c = canvas();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export function confetti(n = 180) {
  const ctx = setup();
  const colors = ['#7cf8c4', '#b388ff', '#ff4d6d', '#ffd166', '#4cc9f0'];
  const ps = Array.from({ length: n }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 200,
    y: innerHeight * 0.6,
    vx: (Math.random() - 0.5) * 22,
    vy: -Math.random() * 22 - 8,
    s: Math.random() * 8 + 4,
    rot: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.4,
    c: colors[(Math.random() * colors.length) | 0],
  }));
  cancel();
  const t0 = performance.now();
  const loop = (now) => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of ps) {
      p.vy += 0.5;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    }
    if (now - t0 < 4000) running = requestAnimationFrame(loop);
    else cancel();
  };
  running = requestAnimationFrame(loop);
}

export function matrix(ms = 7000) {
  const ctx = setup();
  const fs = 16;
  const cols = Math.ceil(innerWidth / fs);
  const drops = Array.from({ length: cols }, () => Math.random() * -50);
  const chars = 'アイウエオカキクケコサシスセソ0123456789SAIM<>/{}=;'.split('');
  cancel();
  document.body.classList.add('matrix-mode');
  const t0 = performance.now();
  let last = 0;
  const loop = (now) => {
    if (now - last > 45) {
      last = now;
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, 0, innerWidth, innerHeight);
      ctx.font = `${fs}px "JetBrains Mono", monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = chars[(Math.random() * chars.length) | 0];
        ctx.fillStyle = Math.random() > 0.97 ? '#fff' : '#3dff8f';
        ctx.fillText(ch, i * fs, drops[i] * fs);
        if (drops[i] * fs > innerHeight && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }
    if (now - t0 < ms) running = requestAnimationFrame(loop);
    else cancel();
  };
  running = requestAnimationFrame(loop);
}

export function cancel() {
  if (running) cancelAnimationFrame(running);
  running = null;
  document.body.classList.remove('matrix-mode');
  const c = canvas();
  c.getContext('2d').clearRect(0, 0, c.width, c.height);
}
