// A tiny circle-physics sandbox: skills as throwable bubbles.
import { unlock } from './achievements.js';

const GROUPS = {
  lang: { label: 'Languages', color: '#7cf8c4' },
  front: { label: 'Front-end', color: '#b388ff' },
  back: { label: 'Back-end', color: '#4cc9f0' },
  ai: { label: 'AI', color: '#ff4d6d' },
  ops: { label: 'Tools', color: '#ffd166' },
};

export function initPlayground(skills) {
  const box = document.querySelector('.playground__box');
  const canvas = document.getElementById('skillsCanvas');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  let gravity = 0.35;
  let visible = false;
  let started = false;
  const balls = [];
  let drag = null;
  const ptr = { x: 0, y: 0, px: 0, py: 0 };

  document.getElementById('legend').innerHTML = Object.values(GROUPS)
    .map((g) => `<span><i style="background:${g.color}"></i>${g.label}</span>`)
    .join('');

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = box.clientWidth;
    H = box.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    const scale = Math.min(1, W / 900);
    ctx.font = `600 ${Math.round(15 * Math.max(scale, 0.8))}px "Space Grotesk", sans-serif`;
    skills.forEach((s, i) => {
      const tw = ctx.measureText(s.name).width;
      const r = Math.max(30, tw / 2 + 14) * Math.max(scale, 0.78);
      balls.push({
        ...s,
        r,
        m: r * r,
        x: r + Math.random() * (W - 2 * r),
        y: -r - i * 40 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: 0,
        color: GROUPS[s.group]?.color || '#fff',
        font: ctx.font,
      });
    });
  }

  function step() {
    const g = gravity;
    for (const b of balls) {
      if (b === drag) {
        b.vx = (ptr.x - b.x) * 0.35;
        b.vy = (ptr.y - b.y) * 0.35;
      } else {
        b.vy += g;
        b.vx *= 0.995;
        b.vy *= 0.995;
      }
      b.x += b.vx;
      b.y += b.vy;
      // walls
      if (b.x < b.r) { b.x = b.r; b.vx *= -0.6; }
      if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -0.6; }
      if (b.y > H - b.r) { b.y = H - b.r; b.vy *= -0.45; b.vx *= 0.96; }
      // balls drop in from above, so the ceiling only applies once they're inside
      if (!b.in && b.y > b.r) b.in = true;
      if (b.in && b.y < b.r) { b.y = b.r; b.vy *= -0.45; }
    }
    // collisions (n² is fine for ~30 balls)
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i], b = balls[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const min = a.r + b.r;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min || d2 === 0) continue;
        const d = Math.sqrt(d2);
        const nx = dx / d, ny = dy / d;
        const overlap = min - d;
        const tm = a.m + b.m;
        const am = a === drag ? 0 : b === drag ? 1 : b.m / tm;
        const bm = 1 - am;
        a.x -= nx * overlap * am;
        a.y -= ny * overlap * am;
        b.x += nx * overlap * bm;
        b.y += ny * overlap * bm;
        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rv > 0) continue;
        const imp = (-(1 + 0.5) * rv) / (1 / a.m + 1 / b.m);
        if (a !== drag) { a.vx -= (imp / a.m) * nx; a.vy -= (imp / a.m) * ny; }
        if (b !== drag) { b.vx += (imp / b.m) * nx; b.vy += (imp / b.m) * ny; }
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    const light = document.documentElement.dataset.theme === 'light';
    for (const b of balls) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b === hover || b === drag ? b.color : light ? '#fff' : '#12121c';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = b.color;
      ctx.stroke();
      ctx.fillStyle = b === hover || b === drag ? '#07070c' : light ? '#121218' : '#ededf2';
      ctx.font = b.font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.name, b.x, b.y + 1);
    }
  }

  let hover = null;
  function loop() {
    if (!visible) return;
    step();
    render();
    requestAnimationFrame(loop);
  }

  function pick(x, y) {
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      if ((b.x - x) ** 2 + (b.y - y) ** 2 < b.r * b.r) return b;
    }
    return null;
  }
  function local(e) {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  canvas.addEventListener('pointerdown', (e) => {
    const [x, y] = local(e);
    ptr.x = ptr.px = x;
    ptr.y = ptr.py = y;
    drag = pick(x, y);
    if (drag) {
      canvas.setPointerCapture(e.pointerId);
      // bring to front
      balls.splice(balls.indexOf(drag), 1);
      balls.push(drag);
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    const [x, y] = local(e);
    ptr.px = ptr.x;
    ptr.py = ptr.y;
    ptr.x = x;
    ptr.y = y;
    hover = pick(x, y);
  });
  const release = () => {
    if (drag && Math.hypot(drag.vx, drag.vy) > 18) unlock('throw');
    drag = null;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => (hover = null));

  const gBtn = document.getElementById('gravityBtn');
  const zBtn = document.getElementById('zeroGBtn');
  gBtn.addEventListener('click', () => {
    gravity = gravity === 0 ? 0.35 : -gravity;
    gBtn.classList.toggle('is-active', gravity < 0);
    zBtn.classList.remove('is-active');
    unlock('gravity');
  });
  zBtn.addEventListener('click', () => {
    const on = gravity !== 0;
    gravity = on ? 0 : 0.35;
    zBtn.classList.toggle('is-active', on);
    gBtn.classList.remove('is-active');
    if (on) balls.forEach((b) => ((b.vx += (Math.random() - 0.5) * 6), (b.vy += (Math.random() - 0.5) * 6)));
    unlock('gravity');
  });
  document.getElementById('shakeBtn').addEventListener('click', shake);

  function shake() {
    balls.forEach((b) => {
      b.vx += (Math.random() - 0.5) * 30;
      b.vy -= Math.random() * 25 * Math.sign(gravity || 1);
    });
  }

  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) {
      if (!started) {
        started = true;
        size();
        spawn();
      }
      requestAnimationFrame(loop);
    }
  }, { threshold: 0.15 }).observe(box);

  addEventListener('resize', () => {
    if (!started) return;
    size();
    balls.forEach((b) => {
      b.x = Math.min(Math.max(b.r, b.x), W - b.r);
      b.y = Math.min(b.y, H - b.r);
    });
  });

  return { shake };
}
