(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasAnime = typeof anime !== 'undefined';

  /* ---------- Scroll progress bar + shrinking header ---------- */
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  var header = document.querySelector('header');
  var ticking = false;

  function onScrollFrame() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    progress.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + '%';
    if (header) header.classList.toggle('scrolled', doc.scrollTop > 40);
    ticking = false;
  }
  document.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScrollFrame);
      ticking = true;
    }
  }, { passive: true });
  onScrollFrame();

  /* Everything past this point is progressive enhancement: if the
     browser has no anime.js or asked for reduced motion, bail out
     and leave every element in its normal, fully visible state. */
  if (reduceMotion || !hasAnime) return;

  /* ---------- Hero entrance: brief, whole-block, no per-character gimmick ---------- */
  (function heroEntrance() {
    var blocks = document.querySelectorAll(
      '.home-hero .eyebrow, .home-hero h1, .home-hero .hero-line, .home-hero .intro-text, .home-hero .actions, .home-hero .hero-plate'
    );
    if (!blocks.length) return;
    blocks.forEach(function (el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(14px)';
    });
    anime({
      targets: blocks,
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 560,
      delay: anime.stagger(70),
      easing: 'easeOutCubic'
    });
  })();

  /* ---------- Generic reveal-on-scroll ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      revealObserver.unobserve(el);
      anime({
        targets: el,
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 550,
        easing: 'easeOutCubic'
      });
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  var SINGLE_SELECTORS = [
    '.honor-society', '.project-video', '.contact-page .email',
    '.process-heading', '.section-title'
  ];
  SINGLE_SELECTORS.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(16px)';
      revealObserver.observe(el);
    });
  });

  /* ---------- Staggered group reveal ---------- */
  var groupObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var container = entry.target;
      groupObserver.unobserve(container);
      var items = container.__revealItems;
      anime({
        targets: items,
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 500,
        delay: anime.stagger(70),
        easing: 'easeOutCubic'
      });
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  var GROUPS = [
    ['.cards', ':scope > .card'],
    ['.split', ':scope > *'],
    ['.lab-overview', ':scope > *'],
    ['.mining-layout', ':scope > *'],
    ['.science-layout', ':scope > *'],
    ['.evidence-grid', ':scope > .evidence-item'],
    ['.movie-overview', ':scope > *'],
    ['.movie-capabilities', ':scope > div'],
    ['.story-grid', ':scope > .story-card'],
    ['.process-grid', ':scope > section'],
    ['.contact-links', ':scope > a'],
    ['.stat-strip', ':scope > .stat'],
    ['.toolbox-group', ':scope > .toolbox-tags > span']
  ];
  GROUPS.forEach(function (pair) {
    document.querySelectorAll(pair[0]).forEach(function (container) {
      var items = container.querySelectorAll(pair[1]);
      if (!items.length) return;
      items.forEach(function (el) {
        el.style.opacity = 0;
        el.style.transform = 'translateY(14px)';
      });
      container.__revealItems = items;
      groupObserver.observe(container);
    });
  });

  /* ---------- Animated counters ---------- */
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      counterObserver.unobserve(el);
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var obj = { val: 0 };
      anime({
        targets: obj,
        val: target,
        duration: 1400,
        easing: 'easeOutExpo',
        round: decimals ? Math.pow(10, decimals) : 1,
        update: function () { el.textContent = obj.val.toFixed(decimals) + suffix; }
      });
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) {
    counterObserver.observe(el);
  });
})();
