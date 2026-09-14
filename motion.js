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

  /* ---------- Hero orb parallax (index page only) ---------- */
  var orb = document.querySelector('.hero-orb');
  if (orb) {
    document.addEventListener('scroll', function () {
      orb.style.transform = 'translateY(' + window.scrollY * 0.18 + 'px)';
    }, { passive: true });
  }

  /* Everything past this point is progressive enhancement: if the
     browser has no anime.js or asked for reduced motion, bail out
     and leave every element in its normal, fully visible state. */
  if (reduceMotion || !hasAnime) return;

  /* ---------- Hero entrance ---------- */
  (function heroEntrance() {
    var heading = document.querySelector('.home-hero h1');
    if (!heading) return;
    var fullText = heading.textContent;
    heading.setAttribute('aria-label', fullText);
    var wrapper = document.createElement('span');
    wrapper.setAttribute('aria-hidden', 'true');
    Array.prototype.slice.call(heading.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        (node.textContent.match(/\S+|\s+/g) || []).forEach(function (part) {
          if (/^\s+$/.test(part)) {
            wrapper.appendChild(document.createTextNode(part));
          } else {
            var span = document.createElement('span');
            span.className = 'char';
            span.style.display = 'inline-block';
            span.textContent = part;
            wrapper.appendChild(span);
          }
        });
      } else {
        node.classList.add('char');
        node.style.display = 'inline-block';
        wrapper.appendChild(node);
      }
    });
    heading.innerHTML = '';
    heading.appendChild(wrapper);

    var rest = document.querySelectorAll(
      '.home-hero .hero-line, .home-hero .intro-text, .home-hero .actions, .home-hero .availability'
    );
    rest.forEach(function (el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(18px)';
    });

    var tl = anime.timeline({ easing: 'easeOutExpo' });
    tl.add({
      targets: wrapper.querySelectorAll('.char'),
      opacity: [0, 1],
      translateY: [34, 0],
      duration: 900,
      delay: anime.stagger(45)
    }).add({
      targets: rest,
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 650,
      delay: anime.stagger(110)
    }, '-=450');
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
        translateY: [26, 0],
        duration: 750,
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
      el.style.transform = 'translateY(26px)';
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
        translateY: [24, 0],
        duration: 650,
        delay: anime.stagger(85),
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
        el.style.transform = 'translateY(24px)';
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
        duration: 1500,
        easing: 'easeOutExpo',
        round: decimals ? Math.pow(10, decimals) : 1,
        update: function () { el.textContent = obj.val.toFixed(decimals) + suffix; }
      });
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ---------- Card tilt (fine pointers only) ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        anime({
          targets: card,
          rotateY: px * 7,
          rotateX: py * -7,
          translateY: -6,
          duration: 250,
          easing: 'easeOutQuad'
        });
      });
      card.addEventListener('mouseleave', function () {
        anime({
          targets: card,
          rotateY: 0,
          rotateX: 0,
          translateY: 0,
          duration: 500,
          easing: 'easeOutQuad'
        });
      });
    });
  }
})();
