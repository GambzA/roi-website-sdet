// Mobile menu toggle for the overlay nav. Ported from the advanced-modern POC
// minus the drill-down sub-pages, which a single-page site has no use for.
(() => {
  document.querySelectorAll('[data-mobile-menu-toggle]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls') || '');
    const iconOpen = btn.querySelector('[data-icon-open]');
    const iconClose = btn.querySelector('[data-icon-close]');

    const setOpen = (willOpen) => {
      btn.setAttribute('aria-expanded', String(willOpen));
      panel && panel.classList.toggle('hidden', !willOpen);
      iconOpen && iconOpen.classList.toggle('hidden', willOpen);
      iconClose && iconClose.classList.toggle('hidden', !willOpen);
      // Full-height overlay: block the page behind it from scrolling.
      document.body.classList.toggle('overflow-hidden', willOpen);
    };

    btn.addEventListener('click', () => {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });

    // Every in-page link closes the overlay, or the anchor would scroll the
    // document underneath while the menu still covers it.
    panel && panel.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.querySelectorAll('[data-mobile-menu-close]').forEach((closeBtn) => {
      closeBtn.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
  });
})();
