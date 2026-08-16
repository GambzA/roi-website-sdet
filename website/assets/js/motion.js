/**
 * Motion engine for the advanced-modern POC.
 *
 * Design rules this file sticks to:
 *  - Progressive enhancement. Every section is readable with JS disabled; CSS
 *    only hides [data-reveal] content, and we strip that guard immediately if
 *    the user prefers reduced motion or IntersectionObserver is unavailable.
 *  - Transform/opacity only, so animation stays on the compositor.
 *  - One shared rAF loop for all scroll-driven work — no per-element listeners.
 *
 * Authoring API (all opt-in via data attributes):
 *   data-reveal="up|down|left|right|scale|blur|wipe|wipe-up"
 *   data-reveal-stagger="80"     on a parent: staggers its revealed children
 *   data-parallax=""|"x"|"scale"|"rotate"   with --p-range / --p-scale / --p-rot
 *   data-split="words"           splits a heading for a word-by-word rise
 *   data-count="1962"            counts up when scrolled into view
 */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsIO = 'IntersectionObserver' in window;

  /* ——— Reduced motion / no-IO: show everything, wire nothing. ——— */
  if (reduced || !supportsIO) {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    document.querySelectorAll('[data-count]').forEach((el) => {
      el.textContent = el.dataset.countPrefix || '';
      el.textContent += el.dataset.count;
      el.textContent += el.dataset.countSuffix || '';
    });
    return;
  }

  /* ————————————————— headline splitting —————————————————
     Done before observers are attached so the wrapper spans exist when the
     reveal fires. Each word gets its own overflow-hidden line box, which
     gives a per-word rise without needing real line detection. */
  document.querySelectorAll('[data-split="words"]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((word, i) => {
      const line = document.createElement('span');
      line.className = 'split-line';
      line.style.display = 'inline-block';
      // Keep the trailing space outside the clipped box or words run together.
      const inner = document.createElement('span');
      inner.textContent = word;
      inner.style.setProperty('--d', `${i * 60}ms`);
      line.appendChild(inner);
      el.appendChild(line);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ————————————————— stagger —————————————————
     A parent marked data-reveal-stagger hands each revealed descendant an
     increasing --d, so one observer entry animates a whole group in sequence. */
  document.querySelectorAll('[data-reveal-stagger]').forEach((parent) => {
    const step = parseInt(parent.dataset.revealStagger, 10) || 80;
    parent.querySelectorAll('[data-reveal]').forEach((child, i) => {
      child.style.setProperty('--d', `${i * step}ms`);
    });
  });

  /* ————————————————— reveal on enter ————————————————— */
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealIO.unobserve(entry.target); // one-shot; never re-hide on scroll up
      });
    },
    // Fire a little before the element is fully on screen so the motion has
    // already settled by the time it's centred.
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('[data-reveal], [data-split="words"]').forEach((el) => revealIO.observe(el));

  /* ————————————————— count-up stats ————————————————— */
  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countIO.unobserve(el);

        const target = parseFloat(el.dataset.count);
        const prefix = el.dataset.countPrefix || '';
        const suffix = el.dataset.countSuffix || '';
        const duration = parseInt(el.dataset.countDuration, 10) || 1600;
        const start = performance.now();

        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          // easeOutExpo — fast start, long settle, matches the reveal easing.
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll('[data-count]').forEach((el) => {
    el.textContent = (el.dataset.countPrefix || '') + '0' + (el.dataset.countSuffix || '');
    countIO.observe(el);
  });

  /* ————————————————— scroll-driven work —————————————————
     One rAF loop handles parallax, the progress bar and the nav state. Layout
     reads are cached and only refreshed on resize, so the loop never forces a
     reflow mid-scroll. */
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  const progressBar = document.querySelector('[data-scroll-progress]');
  const nav = document.querySelector('[data-nav]');

  let vh = window.innerHeight;
  let docHeight = document.documentElement.scrollHeight - vh;
  let cache = [];
  let ticking = false;

  const measure = () => {
    vh = window.innerHeight;
    docHeight = Math.max(document.documentElement.scrollHeight - vh, 1);
    const scrollY = window.scrollY;
    cache = parallaxEls.map((el) => {
      const rect = el.getBoundingClientRect();
      return { el, top: rect.top + scrollY, height: rect.height };
    });
  };

  const update = () => {
    ticking = false;
    const scrollY = window.scrollY;
    const viewportCenter = scrollY + vh / 2;

    for (let i = 0; i < cache.length; i++) {
      const { el, top, height } = cache[i];
      const elCenter = top + height / 2;
      // -1 while the element sits below the viewport, +1 once it's above it.
      const span = vh / 2 + height / 2;
      let p = (viewportCenter - elCenter) / span;
      if (p < -1) p = -1;
      else if (p > 1) p = 1;
      el.style.setProperty('--p', p.toFixed(4));
    }

    if (progressBar) {
      progressBar.style.transform = `scaleX(${(scrollY / docHeight).toFixed(4)})`;
    }
    if (nav) {
      nav.classList.toggle('is-scrolled', scrollY > 24);
    }
    document.documentElement.style.setProperty('--scroll', (scrollY / docHeight).toFixed(4));
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  measure();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    update();
  });
  // Late-loading images change offsets; re-measure once everything settles.
  window.addEventListener('load', () => {
    measure();
    update();
  });
})();
