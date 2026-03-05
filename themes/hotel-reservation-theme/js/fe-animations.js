(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  function markRevealTargets() {
    var selectors = [
      '.home_block_container',
      '.home_block_desc_wrapper',
      '.hotelRoomDescContainer',
      '.testimonial-card',
      '.feature_wrapper',
      '.fe-welcome-card',
      '#blocknewsletter',
      '#footer'
    ];
    var nodes = [];
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (!el.classList.contains('fe-reveal')) {
          el.classList.add('fe-reveal');
        }
        nodes.push(el);
      });
    });
    return nodes;
  }

  function initReveal() {
    var nodes = markRevealTargets();
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    nodes.forEach(function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();
