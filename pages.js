/* ===========================================================
   pages.js — comportamento EXTRA só das páginas internas
   (about.html, journey.html, geo.html). Carrega depois do script.js.
   1) Lightbox: clicar numa foto amplia-a (setas / teclado para navegar)
   2) Atalhos (pillnav): destaca o atalho da secção que está visível
   =========================================================== */
(() => {
  'use strict';

  /* ---------- 1. Lightbox ---------- */
  // Cada contentor com o atributo data-lightbox forma um "grupo" de fotos.
  const groups = [...document.querySelectorAll('[data-lightbox]')];
  if (groups.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML =
      '<button class="lb-btn lb-close" aria-label="Close">&times;</button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous">&#8249;</button>' +
      '<img alt=""><p></p>' +
      '<button class="lb-btn lb-next" aria-label="Next">&#8250;</button>';
    document.body.appendChild(box);

    const big = box.querySelector('img');
    const cap = box.querySelector('p');
    let list = [];
    let i = 0;

    const show = n => {
      i = (n + list.length) % list.length;
      const img = list[i];
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      const fc = img.closest('figure')?.querySelector('figcaption');
      cap.textContent = (fc ? fc.textContent : img.alt) + '  ·  ' + (i + 1) + '/' + list.length;
    };
    const open = (group, img) => {
      list = [...group.querySelectorAll('img')];
      show(list.indexOf(img));
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      box.classList.remove('open');
      document.body.style.overflow = '';
    };

    groups.forEach(g => g.addEventListener('click', e => {
      const img = e.target.closest('img');
      if (img) open(g, img);
    }));
    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', () => show(i - 1));
    box.querySelector('.lb-next').addEventListener('click', () => show(i + 1));
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', e => {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
  }

  /* ---------- 2. Atalhos: destacar a secção visível ---------- */
  const pills = [...document.querySelectorAll('.pillnav a')];
  if (pills.length && 'IntersectionObserver' in window) {
    const map = new Map();
    pills.forEach(a => {
      const sec = document.querySelector(a.getAttribute('href'));
      if (sec) map.set(sec, a);
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          pills.forEach(p => p.classList.remove('on'));
          map.get(en.target)?.classList.add('on');
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    map.forEach((_, sec) => io.observe(sec));
  }
})();
