import './styles/main.css';
import { site } from './data/site.js';
import { initAchievements, unlock, toast } from './modules/achievements.js';
import { initTheme } from './modules/theme.js';
import { initCursor, initMagnetic, bindTilt } from './modules/cursor.js';
import { initHero } from './modules/hero.js';
import { initProjects } from './modules/projects.js';
import { initPlayground } from './modules/playground.js';
import { initTerminals } from './modules/terminal.js';
import { confetti } from './modules/fx.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* ───────── content from data ───────── */
function fillContent() {
  $('#heroTagline').textContent = site.tagline;
  $('#heroStatus').textContent = site.available ? 'available for work' : 'currently busy';
  $('#year').textContent = new Date().getFullYear();

  $('#aboutText').innerHTML = site.about
    .map((p) => `<p>${p.split(' ').map((w) => `<span class="w">${esc(w)}</span>`).join(' ')}</p>`)
    .join('');

  const facts = [
    ['name', site.name],
    ['based in', site.location],
    ['studying', site.education],
    ['focus', 'SaaS · AI tools · Interactive web'],
    ['local time', '<span id="factClock">--:--</span>'],
    ['status', site.available ? '<span class="accent">● open to opportunities</span>' : 'busy'],
  ];
  $('#facts').innerHTML = facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${k === 'local time' || k === 'status' ? v : esc(v)}</dd></div>`).join('');

  $('#stats').innerHTML = site.stats
    .map((s) => `<div class="stat reveal"><div class="stat__value" data-count="${s.value}">0<span>${esc(s.suffix)}</span></div><div class="stat__label">${esc(s.label)}</div></div>`)
    .join('');

  const words = ['SaaS', 'Next.js', 'AI Tools', 'React', 'Rust', 'FastAPI', 'Angular', 'Nuxt', 'Node.js', 'Motion', 'Security', 'Prisma'];
  const half = words.map((w) => `<span>${w}</span><i>✦</i>`).join('');
  $('#marquee').innerHTML = half + half;

  const links = [
    site.email && { href: `mailto:${site.email}`, label: site.email, primary: true, copy: site.email },
    site.github && { href: site.github, label: 'GitHub' },
    site.linkedin && { href: site.linkedin, label: 'LinkedIn' },
    site.resume && { href: site.resume, label: 'Résumé' },
  ].filter(Boolean);
  $('#contactLinks').innerHTML =
    links
      .map(
        (l, i) =>
          `<a class="btn ${l.primary || (!site.email && i === 0) ? 'btn--primary' : ''}" href="${esc(l.href)}" ${
            l.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''
          } data-magnetic ${l.copy ? `data-copy="${esc(l.copy)}" data-cursor="copy"` : ''}>${esc(l.label)} ↗</a>`,
      )
      .join('') + `<button class="btn" data-open-terminal data-magnetic data-cursor="type">Try: sudo hire saim</button>`;

  $('#contactLinks').addEventListener('click', (e) => {
    const a = e.target.closest('[data-copy]');
    if (!a || !navigator.clipboard) return;
    navigator.clipboard.writeText(a.dataset.copy).then(() => toast('Email copied to clipboard', '📋'));
  });
}

/* ───────── loader ───────── */
function runLoader() {
  return new Promise((resolve) => {
    const loader = $('#loader');
    if (reduced || sessionStorage.getItem('saim-booted')) {
      loader.remove();
      document.body.classList.remove('is-loading');
      return resolve();
    }
    try {
      sessionStorage.setItem('saim-booted', '1');
    } catch {
      /* ignore */
    }
    const lines = [
      '> booting saim-os v1.0 …',
      '> mounting /projects ............ ok',
      '> loading particles.wasm ......... ok',
      '> calibrating gravity ............ ok',
      '> hiding easter eggs ............. ok',
      '> injecting personality .......... ok',
    ];
    const log = $('#loaderLog'), bar = $('#loaderBar'), pct = $('#loaderPct');
    let p = 0, li = 0;
    const iv = setInterval(() => {
      p = Math.min(100, p + Math.random() * 9 + 3);
      bar.style.width = p + '%';
      pct.textContent = Math.floor(p) + '%';
      if (p > (li + 1) * (100 / (lines.length + 1)) && li < lines.length) log.textContent += lines[li++] + '\n';
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          loader.classList.add('is-done');
          document.body.classList.remove('is-loading');
          setTimeout(() => loader.remove(), 1000);
          resolve();
        }, 250);
      }
    }, 60);
  });
}

/* ───────── text effects ───────── */
function splitText() {
  document.querySelectorAll('.split').forEach((el) => {
    const words = el.textContent.split(' ');
    el.setAttribute('aria-label', el.textContent);
    let k = 0;
    el.innerHTML = words
      .map(
        (w) =>
          `<span class="word" aria-hidden="true">${[...w]
            .map((c) => `<span class="char" style="transition-delay:${k++ * 22}ms">${esc(c)}</span>`)
            .join('')}</span>`,
      )
      .join(' ');
  });
}

function observeReveals() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
        const c = en.target.querySelector?.('[data-count]');
        if (c) countUp(c);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  );
  document.querySelectorAll('.reveal, .split').forEach((el, i) => {
    if (el.closest('.hero')) el.style.transitionDelay = `${0.15 + i * 0.1}s`;
    io.observe(el);
  });
}

function countUp(el) {
  const target = +el.dataset.count;
  const suffix = el.querySelector('span').outerHTML;
  const t0 = performance.now();
  const dur = reduced ? 0 : 1600;
  const tick = (now) => {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1;
    const e = 1 - Math.pow(1 - k, 4);
    el.innerHTML = Math.round(target * e) + suffix;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function typeRoles() {
  const el = $('#typed');
  let r = 0, i = 0, del = false;
  const tick = () => {
    const word = site.roles[r];
    i += del ? -1 : 1;
    el.textContent = word.slice(0, i);
    let wait = del ? 35 : 70;
    if (!del && i === word.length) (del = true), (wait = 1800);
    else if (del && i === 0) (del = false), (r = (r + 1) % site.roles.length), (wait = 300);
    setTimeout(tick, wait);
  };
  if (reduced) el.textContent = site.roles[0];
  else tick();
}

// About paragraph words light up as you scroll through them.
function scrollLitWords() {
  const words = [...document.querySelectorAll('#aboutText .w')];
  const update = () => {
    const box = $('#aboutText').getBoundingClientRect();
    const start = innerHeight * 0.85, end = innerHeight * 0.35;
    const prog = Math.min(1, Math.max(0, (start - box.top) / (start - end + box.height * 0.6)));
    const n = Math.round(prog * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < n));
  };
  if (reduced) return words.forEach((w) => w.classList.add('lit'));
  addEventListener('scroll', update, { passive: true });
  update();
}

/* ───────── chrome ───────── */
function chrome() {
  const nav = $('#nav');
  let lastY = scrollY;
  const sections = ['about', 'work', 'playground', 'contact'].map((id) => document.getElementById(id));
  const links = [...document.querySelectorAll('.nav__links a')];
  addEventListener(
    'scroll',
    () => {
      const y = scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      nav.classList.toggle('is-scrolled', y > 40);
      nav.classList.toggle('is-hidden', y > lastY && y > 400);
      lastY = y;
      const mid = innerHeight / 2;
      let active = null;
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top < mid && r.bottom > mid) active = s.id;
      });
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${active}`));
      if (max > 0 && y >= max - 4) unlock('bottom');
    },
    { passive: true },
  );
}

function clocks() {
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: site.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtShort = new Intl.DateTimeFormat('en-GB', { timeZone: site.timezone, hour: '2-digit', minute: '2-digit' });
  const tick = () => {
    const now = new Date();
    $('#heroClock').textContent = fmtShort.format(now);
    const fc = $('#factClock');
    if (fc) fc.textContent = fmt.format(now);
  };
  tick();
  setInterval(tick, 1000);
}

function avatar() {
  const av = $('#avatar');
  const pupils = av.querySelectorAll('.avatar__eye span');
  addEventListener('pointermove', (e) => {
    const r = av.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const a = Math.atan2(dy, dx), d = Math.min(6, Math.hypot(dx, dy) / 40);
    pupils.forEach((p) => (p.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px)`));
  });
  setInterval(() => {
    av.classList.add('is-blink');
    setTimeout(() => av.classList.remove('is-blink'), 140);
  }, 3800);
  let pokes = 0;
  const lines = ['hey!', 'ouch', 'stop that 😤', 'seriously?', 'ok you win'];
  av.addEventListener('click', () => {
    av.classList.remove('is-poked');
    void av.offsetWidth;
    av.classList.add('is-poked');
    toast(lines[Math.min(pokes, lines.length - 1)], '🫵', 1400);
    if (++pokes === 5) unlock('poke');
  });
}

function konami() {
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let i = 0;
  addEventListener('keydown', (e) => {
    i = e.key.toLowerCase() === seq[i].toLowerCase() ? i + 1 : e.key === seq[0] ? 1 : 0;
    if (i === seq.length) {
      i = 0;
      unlock('konami');
      document.body.classList.add('party');
      confetti(260);
      setTimeout(() => document.body.classList.remove('party'), 6000);
    }
  });
}

/* ───────── boot ───────── */
(async function main() {
  fillContent();
  splitText();
  initTheme();
  initAchievements();
  initCursor();
  initMagnetic();
  bindTilt($('[data-tilt]'), 12);
  initProjects(reduced);
  initPlayground(site.skills);
  initTerminals();
  initMagnetic();
  initHero(site.name, reduced);
  chrome();
  clocks();
  avatar();
  konami();
  typeRoles();
  scrollLitWords();
  await runLoader();
  observeReveals();
  console.log(
    '%c👋 Hey, fellow dev! %cLike what you see? Press ` to open the terminal, or try the Konami code.',
    'color:#7cf8c4;font-size:16px;font-weight:bold',
    'color:#b388ff',
  );
})();
