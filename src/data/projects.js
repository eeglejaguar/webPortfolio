// ─────────────────────────────────────────────────────────────
//  Your projects. To add one, copy any object below, paste it
//  into the list and change the values. Order = display order.
//
//  category: 'saas' | 'ai' | 'client' | 'frontend' | 'backend'
//  accent:   any CSS colour; drives the card's glow & artwork
//  art:      'radar' | 'grid' | 'waves' | 'orbit' | 'bars' | 'rings'
//  live / repo: leave "" to hide the button
//  featured: true makes the card twice as wide on desktop
// ─────────────────────────────────────────────────────────────
export const projects = [
  {
    id: 'redmind',
    title: 'RedMind-AI',
    subtitle: 'AI-assisted VAPT (security testing) platform',
    category: 'saas',
    tags: ['SaaS', 'AI', 'Security'],
    year: '2026',
    accent: '#ff4d6d',
    art: 'radar',
    featured: true,
    summary:
      'A SaaS-style cybersecurity platform that scans web apps for vulnerabilities with 179 modular checks, streams progress live, and uses an LLM assistant to explain each finding and suggest fixes.',
    highlights: [
      'Custom vulnerability engine: one check = one independent module (179 total)',
      'Detects SQLi, XSS, IDOR, SSRF, path traversal, auth & session flaws, header misconfig',
      'Live scan progress over WebSockets with a Next.js dashboard',
      'AI remediation assistant (Groq + Llama) with security-focused prompt engineering',
      'Scan profiles (Quick / Web / Network / Full), history and exportable reports',
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'Zustand', 'FastAPI', 'Python', 'WebSockets', 'Groq LLM'],
    live: '',
    repo: 'https://github.com/eeglejaguar/RedMind-AI',
  },
  {
    id: 'mtp-erp',
    title: 'MTP ERP',
    subtitle: 'All-in-one business management SaaS',
    category: 'saas',
    tags: ['SaaS', 'Full-Stack'],
    year: '2026',
    accent: '#4cc9f0',
    art: 'bars',
    featured: true,
    summary:
      'A full ERP web application covering the whole business: CRM, sales, purchasing, inventory, manufacturing, accounting, invoicing, HR, fleet and a point-of-sale — behind secure, role-based auth.',
    highlights: [
      '15+ modules: CRM, Sales, POS, Inventory, Stock, Reorders, Manufacturing, Accounting, Invoicing, Expenses, Fleet, Projects, Employees, Time-off, Approvals',
      'Interactive analytics dashboards with Chart.js',
      'JWT auth, bcrypt hashing, Helmet headers and rate limiting',
      'Express REST API with Prisma ORM',
    ],
    stack: ['React 19', 'React Router', 'Chart.js', 'Node.js', 'Express', 'Prisma', 'JWT'],
    live: '',
    repo: 'https://github.com/suas99/MTP-ERP',
  },
  {
    id: 'docchat',
    title: 'DocChat AI',
    subtitle: 'Chat with your PDFs — Rust back end',
    category: 'ai',
    tags: ['AI', 'Rust', 'Backend'],
    year: '2025',
    accent: '#f9a826',
    art: 'waves',
    summary:
      'A high-performance Rust service that ingests PDFs, extracts their text and powers a retrieval-augmented chat so you can ask questions about any document.',
    highlights: [
      'Async Axum + Tokio server with a PDF upload endpoint',
      'Text extraction with lopdf / pdf_extract',
      'RAG pipeline design: embeddings → vector DB (Qdrant / Pinecone) → LLM answers',
    ],
    stack: ['Rust', 'Axum', 'Tokio', 'lopdf', 'Embeddings', 'Vector DB'],
    live: '',
    repo: 'https://github.com/eeglejaguar/DocChat-AI',
  },
  {
    id: 'kitchen-king',
    title: 'Kitchen King',
    subtitle: 'Caribbean restaurant website — Nassau, Bahamas',
    category: 'client',
    tags: ['Client', 'Nuxt', 'Motion'],
    year: '2026',
    accent: '#ffd166',
    art: 'rings',
    summary:
      'A richly animated marketing site for a Caribbean restaurant, built from Figma designs with smooth scrolling, motion presets, an interactive map and production security headers on Vercel.',
    highlights: [
      'Nuxt 4 with motion-v animations and Lenis smooth scroll',
      'Leaflet map, single-source business config, component-driven sections',
      'Hardened Vercel deploy with a strict Content-Security-Policy',
    ],
    stack: ['Nuxt 4', 'Vue 3', 'motion-v', 'Lenis', 'Leaflet', 'Vercel'],
    live: 'https://kitchen-king-ecru.vercel.app',
    repo: 'https://github.com/easyumer/kitchenking-unfinished',
  },
  {
    id: 'chef-donovan',
    title: 'Chef Donovan Smith',
    subtitle: 'Luxury private-chef brand site',
    category: 'client',
    tags: ['Client', 'Multi-page'],
    year: '2026',
    accent: '#c9a66b',
    art: 'orbit',
    summary:
      'A premium, 25+ page website for a private chef serving villas, yachts and private jets across the Bahamas & Caribbean — with video hero, galleries, reservations and a blog.',
    highlights: [
      'Elegant editorial design with video hero and dark/light variants',
      'Experience pages, menus, gallery, reviews, reservations, blog',
      'Tailwind + hand-written CSS/JS, fully responsive',
    ],
    stack: ['HTML', 'Tailwind', 'JavaScript', 'CSS'],
    live: '',
    repo: 'https://github.com/sannanumer2003/chef-donovan-smith-website',
  },
  {
    id: 'fitness',
    title: 'Fitness Portal',
    subtitle: 'Gym programs & trainers website',
    category: 'frontend',
    tags: ['Angular', 'Frontend'],
    year: '2025',
    accent: '#7cf8c4',
    art: 'grid',
    summary:
      'A multi-page fitness website with routed pages for programs, trainers and contact — built as a component-based Angular SPA.',
    highlights: ['Angular 19 SPA with routing', 'Programs, trainers and contact pages', 'Reusable component structure'],
    stack: ['Angular 19', 'TypeScript', 'CSS'],
    live: '',
    repo: 'https://github.com/eeglejaguar/Fitness-Web',
  },
  {
    id: 'animals',
    title: 'Animal Knowledge',
    subtitle: 'Educational wildlife site',
    category: 'frontend',
    tags: ['Angular', 'Frontend'],
    year: '2025',
    accent: '#90be6d',
    art: 'waves',
    summary: 'An educational Angular site with dedicated routed pages for lions, tigers and elephants.',
    highlights: ['Angular 19 with lazy routed pages', 'Content-focused, responsive layouts'],
    stack: ['Angular 19', 'TypeScript', 'CSS'],
    live: '',
    repo: 'https://github.com/eeglejaguar/animal-knowledge-site',
  },
  {
    id: 'book',
    title: 'Book Website',
    subtitle: 'Angular 20 web tutor / book site',
    category: 'frontend',
    tags: ['Angular', 'Frontend'],
    year: '2025',
    accent: '#b388ff',
    art: 'grid',
    summary: 'A book / tutoring website built with Angular 20 — home, about, services and call-to-action components.',
    highlights: ['Angular 20 standalone components', 'Services, about and CTA sections'],
    stack: ['Angular 20', 'TypeScript', 'CSS'],
    live: '',
    repo: 'https://github.com/eeglejaguar/my_angular_web_tutor',
  },
];

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'saas', label: 'SaaS' },
  { id: 'ai', label: 'AI' },
  { id: 'client', label: 'Client Work' },
  { id: 'frontend', label: 'Front-End' },
];
