/**
 * Page behaviour specific to this portfolio: the Projects tab switcher, the
 * copy-to-clipboard email button, and the nav scroll-spy.
 *
 * Motion (reveals, parallax, counters) lives in motion.js and is shared,
 * unmodified, with the design it was ported from.
 */
(() => {
  /* ————————————————— Projects tabs ————————————————— */
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.setAttribute('tabindex', selected ? '0' : '-1');
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });

    // A panel that was hidden never intersected, so its cards are still sitting
    // at opacity 0. Reveal them now that the panel has a layout box; the
    // stagger --d that motion.js already wrote gives them their cascade.
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (panel) {
      requestAnimationFrame(() => {
        panel.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
      });
    }
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    // Roving focus, per the tabs pattern.
    tab.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      selectTab(next);
    });
  });

  /* ————————————————— copy email ————————————————— */
  const copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.email);
        copyBtn.classList.add('copied');
        setTimeout(() => copyBtn.classList.remove('copied'), 2000);
      } catch {
        /* Clipboard blocked (insecure origin, denied permission) — the address
           is a live mailto link right beside the button, so do nothing. */
      }
    });
  }

  /* ————————————————— nav scroll-spy —————————————————
     Marks the nav link whose section currently owns the viewport. Uses the
     same one-observer approach as motion.js rather than a scroll handler. */
  const links = new Map();
  document.querySelectorAll('[data-nav] .nav-link[href^="#"]').forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) links.set(section, link);
  });

  if (links.size && 'IntersectionObserver' in window) {
    const visible = new Set();
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        // When several sections straddle the line, the topmost one wins.
        const active = [...links.keys()].find((section) => visible.has(section));
        links.forEach((link, section) => {
          link.setAttribute('aria-current', String(section === active));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    links.forEach((_, section) => spy.observe(section));
  }
})();
