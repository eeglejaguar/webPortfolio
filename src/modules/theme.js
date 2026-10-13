import { unlock } from './achievements.js';

const KEY = 'saim-portfolio-theme';

export function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* ignore */
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'light' ? '#f3efe6' : '#07070c');
  document.dispatchEvent(new CustomEvent('themechange', { detail: t }));
}

export function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  // circular reveal where supported
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.startViewTransition(() => setTheme(next));
  } else {
    setTheme(next);
  }
  unlock('theme');
  return next;
}

export function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {
    /* ignore */
  }
  if (saved) setTheme(saved);
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
}
