// A small fake shell. Two instances share the same command set: one inline in
// the page, one floating (opened with the `>_` button or the ` / ~ key).
import { site } from '../data/site.js';
import { projects } from '../data/projects.js';
import { unlock, status, resetAchievements } from './achievements.js';
import { openModal } from './projects.js';
import { toggleTheme } from './theme.js';
import { confetti, matrix } from './fx.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const banner = `<span class="hl">
 ███████╗ █████╗ ██╗███╗   ███╗
 ██╔════╝██╔══██╗██║████╗ ████║
 ███████╗███████║██║██╔████╔██║
 ╚════██║██╔══██║██║██║╚██╔╝██║
 ███████║██║  ██║██║██║ ╚═╝ ██║
 ╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝</span>
<span class="dim">Welcome to saim-os v1.0 — type</span> <span class="prompt">help</span> <span class="dim">to see what I can do.</span>`;

const commands = {
  help: {
    desc: 'list commands',
    run: () =>
      Object.entries(commands)
        .filter(([, c]) => !c.hidden)
        .map(([k, c]) => `  <span class="prompt">${k.padEnd(12)}</span><span class="dim">${c.desc}</span>`)
        .join('\n') + '\n<span class="dim">  …and a few hidden ones. Tab completes, ↑/↓ for history.</span>',
  },
  whoami: { desc: 'who is this guy?', run: () => `${site.name} — ${site.roles[0]}\n${site.education}\n📍 ${site.location}` },
  about: { desc: 'short bio', run: () => site.about.join('\n\n') },
  ls: {
    desc: 'list projects',
    run: () =>
      projects
        .map((p, i) => `<span class="path">${String(i + 1).padStart(2)}. ${slug(p.title).padEnd(22)}</span><span class="dim">${esc(p.subtitle)}</span>`)
        .join('\n') + `\n<span class="dim">try</span> open 1 <span class="dim">or</span> cat ${slug(projects[0].title)}`,
  },
  projects: { desc: 'alias for ls', hidden: true, run: (a, t) => commands.ls.run(a, t) },
  open: {
    desc: 'open a project: open <n|name>',
    run: (args) => {
      const p = find(args[0]);
      if (!p) return `<span class="err">open: no such project "${esc(args[0] || '')}"</span> — try <span class="prompt">ls</span>`;
      openModal(projects.indexOf(p));
      return `opening ${esc(p.title)}…`;
    },
  },
  cat: {
    desc: 'print a project: cat <name>',
    run: (args) => {
      const p = find(args[0]);
      if (!p) return `<span class="err">cat: ${esc(args[0] || '')}: No such file</span>`;
      return `<span class="hl"># ${esc(p.title)}</span> <span class="dim">(${esc(p.year)})</span>\n${esc(p.summary)}\n\n${p.highlights
        .map((h) => `  • ${esc(h)}`)
        .join('\n')}\n\n<span class="dim">stack:</span> ${esc(p.stack.join(', '))}${
        p.repo ? `\n<span class="dim">repo:</span>  <a href="${esc(p.repo)}" target="_blank" rel="noopener">${esc(p.repo)}</a>` : ''
      }${p.live ? `\n<span class="dim">live:</span>  <a href="${esc(p.live)}" target="_blank" rel="noopener">${esc(p.live)}</a>` : ''}`;
    },
  },
  filter: {
    desc: 'filter work: filter <saas|ai|client|frontend|all>',
    run: (args) => {
      const c = (args[0] || 'all').toLowerCase();
      const chip = document.querySelector(`[data-filter="${c}"]`);
      if (!chip) return `<span class="err">filter: unknown category "${esc(c)}"</span>`;
      chip.click();
      document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
      return `filtered by ${esc(c)}`;
    },
  },
  skills: {
    desc: 'what I work with',
    run: () => {
      const g = {};
      site.skills.forEach((s) => (g[s.group] ||= []).push(s.name));
      return Object.entries(g)
        .map(([k, v]) => `<span class="path">${k.padEnd(7)}</span>${v.join(' · ')}`)
        .join('\n');
    },
  },
  contact: {
    desc: 'how to reach me',
    run: () =>
      [
        site.email && `email     <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`,
        site.github && `github    <a href="${esc(site.github)}" target="_blank" rel="noopener">${esc(site.github)}</a>`,
        site.linkedin && `linkedin  <a href="${esc(site.linkedin)}" target="_blank" rel="noopener">${esc(site.linkedin)}</a>`,
      ]
        .filter(Boolean)
        .join('\n'),
  },
  goto: {
    desc: 'scroll to: goto <about|work|playground|contact>',
    run: (args) => {
      const el = document.getElementById(args[0] || '');
      if (!el) return '<span class="err">goto: unknown section</span>';
      el.scrollIntoView({ behavior: 'smooth' });
      return `→ ${esc(args[0])}`;
    },
  },
  theme: { desc: 'toggle light / dark', run: () => `theme set to ${toggleTheme()}` },
  secrets: {
    desc: 'show unlocked secrets',
    run: () => {
      const s = status();
      return `${s.filter((a) => a.got).length}/${s.length} found\n` + s.map((a) => `  ${a.got ? a.ico : '🔒'} ${a.got ? a.title : '???'}`).join('\n');
    },
  },
  date: { desc: 'local time in Karachi', run: () => new Date().toLocaleString('en-GB', { timeZone: site.timezone }) },
  clear: { desc: 'clear the screen', run: (a, t) => (t.clear(), null) },
  sudo: {
    desc: 'try it ;)',
    run: (args) => {
      const cmd = args.join(' ').toLowerCase();
      if (/^hire( saim)?$/.test(cmd) || cmd === 'hire-me' || cmd === 'hire me') {
        unlock('hire');
        confetti();
        return `<span class="prompt">[sudo] password for recruiter: ********</span>\n✔ Access granted. Excellent decision.\n${
          site.email ? `Drop a line at <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : `Reach out via <a href="${esc(site.github)}" target="_blank" rel="noopener">GitHub</a>`
        } and let's build something.`;
      }
      if (cmd.startsWith('rm')) return '<span class="err">nice try. this portfolio is load-bearing.</span>';
      return `<span class="err">${esc(cmd || 'sudo')}: permission denied</span> <span class="dim">(hint: sudo hire saim)</span>`;
    },
  },
  matrix: { desc: 'follow the white rabbit', hidden: true, run: () => (unlock('matrix'), matrix(), 'Wake up, Neo…') },
  party: { desc: '', hidden: true, run: () => (confetti(), '🎉🎉🎉') },
  hello: { desc: '', hidden: true, run: () => 'hey there 👋 thanks for stopping by.' },
  hi: { desc: '', hidden: true, run: () => commands.hello.run() },
  coffee: { desc: '', hidden: true, run: () => '☕ brewing… error 418: I\'m a teapot.' },
  exit: { desc: 'close the floating terminal', hidden: true, run: (a, t) => (t.close?.(), 'bye 👋') },
  reset: { desc: '', hidden: true, run: () => (resetAchievements(), 'secrets reset. happy hunting!') },
  echo: { desc: '', hidden: true, run: (args) => esc(args.join(' ')) },
  vim: { desc: '', hidden: true, run: () => 'you are now trapped forever. (just kidding — type :q)' },
  ':q': { desc: '', hidden: true, run: () => 'phew.' },
};

function find(q) {
  if (!q) return null;
  const n = parseInt(q, 10);
  if (!isNaN(n)) return projects[n - 1];
  q = slug(q);
  return projects.find((p) => slug(p.title) === q || p.id === q || slug(p.title).startsWith(q));
}

export function createTerminal(root, opts = {}) {
  const history = [];
  let hIdx = 0;
  root.innerHTML = '';
  const out = document.createElement('div');
  const row = document.createElement('div');
  row.className = 'input-row';
  row.innerHTML = `<span><span class="prompt">saim@portfolio</span>:<span class="path">~</span>$</span>`;
  const input = document.createElement('input');
  input.setAttribute('aria-label', 'Terminal input');
  input.autocomplete = 'off';
  input.autocapitalize = 'off';
  input.spellcheck = false;
  row.appendChild(input);
  root.append(out, row);

  const api = {
    print(html, cls = '') {
      const l = document.createElement('div');
      l.className = `line ${cls}`;
      l.innerHTML = html;
      out.appendChild(l);
      root.scrollTop = root.scrollHeight;
    },
    clear() {
      out.innerHTML = '';
    },
    focus() {
      input.focus({ preventScroll: true });
    },
    close: opts.onClose,
    run(raw) {
      const line = raw.trim();
      api.print(`<span class="prompt">saim@portfolio</span>:<span class="path">~</span>$ ${esc(line)}`);
      if (!line) return;
      history.push(line);
      hIdx = history.length;
      const [name, ...args] = line.split(/\s+/);
      const cmd = commands[name.toLowerCase()];
      if (!cmd) {
        api.print(`<span class="err">command not found: ${esc(name)}</span> <span class="dim">— type help</span>`);
        return;
      }
      unlock('shell');
      const res = cmd.run(args, api);
      if (res != null) api.print(res);
    },
  };

  api.print(banner);
  root.addEventListener('click', () => {
    if (!getSelection()?.toString()) api.focus();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      api.run(input.value);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      hIdx = Math.max(0, hIdx - 1);
      input.value = history[hIdx] ?? '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      hIdx = Math.min(history.length, hIdx + 1);
      input.value = history[hIdx] ?? '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const v = input.value.toLowerCase();
      const parts = v.split(/\s+/);
      if (parts.length === 1) {
        const m = Object.keys(commands).filter((k) => !commands[k].hidden && k.startsWith(v));
        if (m.length === 1) input.value = m[0] + ' ';
        else if (m.length) api.print(m.join('  '), 'dim');
      } else if (['open', 'cat'].includes(parts[0])) {
        const m = projects.map((p) => slug(p.title)).filter((s) => s.startsWith(parts[1]));
        if (m.length === 1) input.value = `${parts[0]} ${m[0]}`;
        else if (m.length) api.print(m.join('  '), 'dim');
      }
    } else if (e.key === 'Escape') {
      opts.onClose?.();
    }
    e.stopPropagation();
  });
  return api;
}

export function initTerminals() {
  createTerminal(document.getElementById('terminalInline'));

  const float = document.getElementById('termFloat');
  const setOpen = (open) => {
    float.classList.toggle('is-open', open);
    float.setAttribute('aria-hidden', String(!open));
    if (open) setTimeout(() => ft.focus(), 50);
  };
  const ft = createTerminal(document.getElementById('terminalFloat'), { onClose: () => setOpen(false) });
  const toggle = () => setOpen(!float.classList.contains('is-open'));

  document.getElementById('termBtn').addEventListener('click', toggle);
  document.querySelectorAll('[data-open-terminal]').forEach((b) => b.addEventListener('click', () => setOpen(true)));
  float.querySelector('[data-close-term]').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName);
    if (!typing && (e.key === '`' || e.key === '~')) {
      e.preventDefault();
      toggle();
    }
  });
}
