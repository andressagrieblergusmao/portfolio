/* ===========================================================
   Andressa Griebler Gusmão — Portfolio
   - procedural forest (SVG trees)
   - parallax layers
   - falling leaves
   - scroll reveal, growing-tree progress, nav, gallery
   =========================================================== */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- 1. Procedural forest ---------- */
  // Small seeded random so the forest looks the same on every load
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const FOREST = {
    far:  { colors: ['#3d6e5a', '#386753', '#427560'], count: 38, min: 150, max: 260, round: .10, seed: 11 },
    mid:  { colors: ['#27533f', '#224a38', '#2c5c46'], count: 28, min: 200, max: 320, round: .12, seed: 23 },
    near: { colors: ['#112f24', '#0e271e', '#14372a'], count: 18, min: 260, max: 420, round: .10, seed: 37 },
    foot: { colors: ['#0b261b', '#08201a', '#0f3023'], count: 26, min: 200, max: 360, round: .10, seed: 51 }
  };

  const pine = (x, base, h, color) => {
    const w = h * 0.42;
    const tiers = 4;
    let d = '';
    for (let i = 0; i < tiers; i++) {
      const top = base - h + (h * 0.78 / tiers) * i * 0.85;
      const bottom = base - h * 0.14 - (h * 0.62) * (1 - (i + 1) / tiers);
      const half = (w / 2) * ((i + 1) / tiers) * 0.95 + w * 0.08;
      d += `M${x} ${top.toFixed(1)}L${(x + half).toFixed(1)} ${bottom.toFixed(1)}L${(x - half).toFixed(1)} ${bottom.toFixed(1)}Z`;
    }
    const trunkW = Math.max(4, h * 0.035);
    return `<g fill="${color}"><path d="${d}"/><rect x="${(x - trunkW / 2).toFixed(1)}" y="${(base - h * 0.16).toFixed(1)}" width="${trunkW.toFixed(1)}" height="${(h * 0.16 + 4).toFixed(1)}"/></g>`;
  };

  const broadleaf = (x, base, h, color, rnd) => {
    const r = h * 0.3;
    const cy = base - h * 0.68;
    const trunkW = Math.max(5, h * 0.045);
    const blobs = [
      [0, 0, r], [-r * .8, r * .35, r * .72], [r * .8, r * .35, r * .72],
      [-r * .35, -r * .55, r * .65], [r * .4, -r * .45, r * .62]
    ].map(([dx, dy, rr]) => `<circle cx="${(x + dx).toFixed(1)}" cy="${(cy + dy).toFixed(1)}" r="${rr.toFixed(1)}"/>`).join('');
    return `<g fill="${color}"><rect x="${(x - trunkW / 2).toFixed(1)}" y="${(cy + r * .2).toFixed(1)}" width="${trunkW.toFixed(1)}" height="${(base - cy).toFixed(1)}"/>${blobs}</g>`;
  };

  function buildForest(svg) {
    const cfg = FOREST[svg.dataset.layer];
    if (!cfg) return;
    const rnd = mulberry32(cfg.seed);
    const base = 520;
    const step = 1700 / cfg.count;
    let out = '';
    for (let i = 0; i < cfg.count; i++) {
      const x = -50 + step * i + (rnd() - .5) * step * .9;
      const h = cfg.min + rnd() * (cfg.max - cfg.min);
      const color = cfg.colors[Math.floor(rnd() * cfg.colors.length)];
      out += rnd() < cfg.round ? broadleaf(x, base, h, color, rnd) : pine(x, base, h, color);
    }
    // ground strip so there are no gaps at the bottom
    out += `<rect x="-50" y="${base - 12}" width="1700" height="60" fill="${cfg.colors[0]}"/>`;
    svg.insertAdjacentHTML('beforeend', out);
  }
  $$('svg[data-layer]').forEach(buildForest);

  /* ---------- 2. Falling leaves ---------- */
  const leavesBox = $('#leaves');
  if (leavesBox && !reduceMotion) {
    const colors = ['#a9c28a', '#7bb08a', '#cfe0b0', '#d2a35a', '#b8734a', '#8fbf93'];
    const leafSvg = c => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M20 4C10 4 4 10 4 16c0 2.5 1.5 4 4 4 7 0 12-6 12-16z" fill="${c}"/><path d="M4 21c3-6 7-10 12-13" stroke="rgba(0,0,0,.22)" stroke-width="1" fill="none"/></svg>`;
    const total = window.innerWidth < 700 ? 10 : 20;
    for (let i = 0; i < total; i++) {
      const el = document.createElement('span');
      el.className = 'leaf-fall';
      const size = 14 + Math.random() * 20;
      el.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;` +
        `animation-duration:${10 + Math.random() * 9}s;animation-delay:${-Math.random() * 18}s;`;
      el.innerHTML = leafSvg(colors[i % colors.length]);
      leavesBox.appendChild(el);
    }
  }

  /* ---------- 3. Parallax ---------- */
  const heroLayers = $$('.hero [data-speed]');
  const bandLayers = $$('.band-bg, .projects-bg');
  const hero = $('.hero');
  let ticking = false;

  function parallax() {
    const y = window.scrollY;
    const vh = window.innerHeight;

    if (hero && y < hero.offsetHeight + 100) {
      heroLayers.forEach(el => {
        const s = parseFloat(el.dataset.speed) || 0;
        el.style.transform = `translate3d(0, ${(y * s).toFixed(1)}px, 0)`;
      });
    }

    bandLayers.forEach(el => {
      const parent = el.parentElement;
      const r = parent.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const s = parseFloat(el.dataset.speed) || 0;
      const rel = r.top + r.height / 2 - vh / 2;
      const limit = r.height * 0.24;
      const t = Math.max(-limit, Math.min(limit, -rel * s));
      el.style.transform = `translate3d(0, ${t.toFixed(1)}px, 0)`;
    });
  }

  /* ---------- 4. Nav state + growing tree progress ---------- */
  const nav = $('#nav');
  const growFill = $('#growFill');
  const growLeaf = $('#growLeaf');
  const growBox = $('.grow');

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    if (growFill) growFill.style.height = (p * 100).toFixed(1) + '%';
    if (growLeaf && growBox) {
      const h = growBox.clientHeight - growLeaf.clientHeight;
      growLeaf.style.transform = `translateY(${(p * h).toFixed(1)}px) rotate(${(p * 240).toFixed(0)}deg)`;
    }
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (!reduceMotion) parallax();
      onScroll();
      ticking = false;
    });
  }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  requestTick();

  /* ---------- 5. Mobile menu ---------- */
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  if (toggle && links) {
    const setOpen = open => {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
    links.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  }

  /* ---------- 6. Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- 7. Gallery arrows ---------- */
  const gallery = $('#gallery');
  const step = () => Math.min(400, gallery.clientWidth * 0.8);
  $('#gPrev')?.addEventListener('click', () => gallery.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('#gNext')?.addEventListener('click', () => gallery.scrollBy({ left: step(), behavior: 'smooth' }));

  /* ---------- 8. Footer year ---------- */
  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();
})();