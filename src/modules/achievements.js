// Tiny gamification layer: visitors unlock "secrets" by playing with the site.
const LIST = [
  { id: 'hello', ico: '👋', title: 'Hello, world', desc: 'Visited the portfolio' },
  { id: 'boom', ico: '💥', title: 'Demolition', desc: 'Blew up the hero letters' },
  { id: 'case', ico: '🔍', title: 'Case closed', desc: 'Opened a project case study' },
  { id: 'binge', ico: '🍿', title: 'Binge reader', desc: 'Opened 3 different case studies' },
  { id: 'throw', ico: '🏀', title: 'Yeet', desc: 'Threw a skill across the playground' },
  { id: 'gravity', ico: '🪐', title: 'Physics teacher', desc: 'Messed with gravity' },
  { id: 'shell', ico: '⌨️', title: 'Hacker voice', desc: 'Ran a terminal command' },
  { id: 'hire', ico: '🤝', title: 'Smart move', desc: 'Ran `sudo hire saim`' },
  { id: 'matrix', ico: '🟩', title: 'Red pill', desc: 'Entered the matrix' },
  { id: 'theme', ico: '🌗', title: 'Light switch', desc: 'Toggled the theme' },
  { id: 'poke', ico: '🫵', title: 'Rude', desc: 'Poked the avatar 5 times' },
  { id: 'konami', ico: '🎮', title: 'Old school', desc: 'Entered the Konami code' },
  { id: 'bottom', ico: '🏁', title: 'Completionist', desc: 'Scrolled all the way down' },
];

const KEY = 'saim-portfolio-ach';
let got = new Set();
const listeners = [];

function load() {
  try {
    got = new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  } catch {
    got = new Set();
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...got]));
  } catch {
    /* storage unavailable — progress just won't persist */
  }
}

export function toast(html, ico = '✨', ms = 3200) {
  const wrap = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="ico">${ico}</span><span>${html}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, ms);
}

export function unlock(id) {
  if (got.has(id)) return;
  const a = LIST.find((x) => x.id === id);
  if (!a) return;
  got.add(id);
  save();
  render();
  toast(`<b>Secret unlocked: ${a.title}</b>${a.desc}`, a.ico);
  listeners.forEach((fn) => fn(id, got.size, LIST.length));
  if (got.size === LIST.length) {
    setTimeout(() => toast('<b>100% complete!</b>You found every secret. Now you have to hire me 😄', '🏆', 5000), 1200);
  }
}

export function onUnlock(fn) {
  listeners.push(fn);
}

export function status() {
  return LIST.map((a) => ({ ...a, got: got.has(a.id) }));
}

export function resetAchievements() {
  got.clear();
  save();
  render();
}

function render() {
  document.getElementById('trophyCount').textContent = `${got.size}/${LIST.length}`;
  document.getElementById('achList').innerHTML = LIST.map(
    (a) =>
      `<li class="${got.has(a.id) ? 'is-got' : ''}"><span class="ico">${a.ico}</span><span>${
        got.has(a.id) ? a.title : '???'
      }<small>${a.desc}</small></span></li>`,
  ).join('');
}

export function initAchievements() {
  load();
  render();
  const panel = document.getElementById('achievements');
  const toggle = (open) => {
    const isOpen = open ?? !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', isOpen);
    panel.setAttribute('aria-hidden', String(!isOpen));
  };
  document.getElementById('trophyBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });
  panel.querySelector('[data-close-ach]').addEventListener('click', () => toggle(false));
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target)) toggle(false);
  });
  setTimeout(() => unlock('hello'), 4500);
}
