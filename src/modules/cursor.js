// Custom cursor with contextual labels + magnetic elements.
export function initCursor() {
  if (!matchMedia('(pointer: fine)').matches) return;
  document.body.classList.add('has-cursor');
  const ring = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  const label = document.getElementById('cursorLabel');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;

  addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    dot.style.transform = `translate(${x}px, ${y}px)`;
  });
  addEventListener('pointerdown', () => ring.classList.add('is-down'));
  addEventListener('pointerup', () => ring.classList.remove('is-down'));
  document.addEventListener('mouseleave', () => (ring.style.opacity = dot.style.opacity = '0'));
  document.addEventListener('mouseenter', () => (ring.style.opacity = dot.style.opacity = '1'));

  (function loop() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], a, button, .card');
    if (!t) return;
    ring.classList.add('is-hover');
    label.textContent = t.dataset.cursor || (t.classList.contains('card') ? 'open' : '');
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest('[data-cursor], a, button, .card');
    if (t && !t.contains(e.relatedTarget)) {
      ring.classList.remove('is-hover');
      label.textContent = '';
    }
  });
}

export function initMagnetic(root = document) {
  if (!matchMedia('(pointer: fine)').matches) return;
  root.querySelectorAll('[data-magnetic]').forEach((el) => {
    if (el.dataset.magBound) return;
    el.dataset.magBound = '1';
    el.style.transition = 'transform 0.4s cubic-bezier(.22,1,.36,1)';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.3}px, ${dy * 0.4}px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}

// 3D tilt + glare following the pointer.
export function bindTilt(el, max = 10) {
  if (!matchMedia('(pointer: fine)').matches) return;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `rotateY(${(px - 0.5) * max}deg) rotateX(${(0.5 - py) * max}deg)`;
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  });
  el.addEventListener('pointerleave', () => (el.style.transform = ''));
}
