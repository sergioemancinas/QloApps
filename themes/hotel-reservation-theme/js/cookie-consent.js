(function () {
  'use strict';

  var consentKey = 'fewa_cookie_consent';
  var maxAgeDays = 180;

  function getCookie(name) {
    var match = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\\[\\]\\\\/+^])/g, '\\$1') + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var maxAge = days * 24 * 60 * 60;
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + '=' + encodeURIComponent(value) + '; Max-Age=' + maxAge + '; Path=/' + secure + '; SameSite=Lax';
  }

  function parseConsent(raw) {
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function defaultConsent() {
    return {
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString()
    };
  }

  function applyConsent(consent) {
    if (!consent) {
      return;
    }
    var mode = consent.analytics || consent.marketing || consent.preferences ? 'custom' : 'necessary';
    if (consent.analytics && consent.marketing && consent.preferences) {
      mode = 'all';
    }
    document.documentElement.setAttribute('data-cookie-consent', mode);
    document.documentElement.setAttribute('data-analytics-consent', consent.analytics ? 'true' : 'false');
    document.documentElement.setAttribute('data-marketing-consent', consent.marketing ? 'true' : 'false');
    document.documentElement.setAttribute('data-preferences-consent', consent.preferences ? 'true' : 'false');
  }

  function activateDeferredScripts(consent) {
    var nodes = document.querySelectorAll('script[type="text/plain"][data-requires-consent]');
    nodes.forEach(function (node) {
      var category = node.getAttribute('data-requires-consent');
      if (!consent[category]) {
        return;
      }
      var script = document.createElement('script');
      Array.prototype.slice.call(node.attributes).forEach(function (attr) {
        if (attr.name === 'type' || attr.name === 'data-requires-consent') {
          return;
        }
        script.setAttribute(attr.name, attr.value);
      });
      script.text = node.text || node.textContent || '';
      if (node.src) {
        script.src = node.src;
      }
      node.parentNode.insertBefore(script, node.nextSibling);
      node.setAttribute('data-consent-activated', 'true');
    });
  }

  function loadCloudflareAnalytics() {
    if (window.__feCfBeaconLoaded) {
      return;
    }
    var meta = document.querySelector('meta[name="cf-beacon-token"]');
    var token = meta && meta.getAttribute('content');
    if (!token) {
      return;
    }
    window.__feCfBeaconLoaded = true;
    var script = document.createElement('script');
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.defer = true;
    script.setAttribute('data-cf-beacon', JSON.stringify({ token: token }));
    document.head.appendChild(script);
  }

  function loadOptionalServices(consent) {
    if (!consent) {
      return;
    }
    if (consent.analytics) {
      loadCloudflareAnalytics();
    }
    activateDeferredScripts(consent);
    try {
      window.dispatchEvent(new CustomEvent('fewo:consent', { detail: consent }));
    } catch (e) {
      // IE fallback not required
    }
  }

  function saveConsent(consent) {
    consent.updatedAt = new Date().toISOString();
    setCookie(consentKey, JSON.stringify(consent), maxAgeDays);
    applyConsent(consent);
    loadOptionalServices(consent);
  }

  function setCheckboxes(consent) {
    document.querySelectorAll('[data-consent]').forEach(function (box) {
      var key = box.getAttribute('data-consent');
      box.checked = Boolean(consent[key]);
    });
  }

  function readCheckboxes() {
    var consent = defaultConsent();
    document.querySelectorAll('[data-consent]').forEach(function (box) {
      var key = box.getAttribute('data-consent');
      consent[key] = box.checked;
    });
    return consent;
  }

  function syncScrollLock() {
    var banner = document.getElementById('fe-cookie-banner');
    var modal = document.getElementById('fe-cookie-modal');
    var open = (banner && banner.classList.contains('is-visible'))
      || (modal && modal.classList.contains('is-open'));
    document.body.classList.toggle('fe-consent-open', !!open);
  }

  function showBanner() {
    var banner = document.getElementById('fe-cookie-banner');
    if (banner) {
      banner.classList.add('is-visible');
    }
    syncScrollLock();
  }

  function hideBanner() {
    var banner = document.getElementById('fe-cookie-banner');
    if (banner) {
      banner.classList.remove('is-visible');
    }
    syncScrollLock();
  }

  function openModal() {
    var modal = document.getElementById('fe-cookie-modal');
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    }
    syncScrollLock();
  }

  function closeModal() {
    var modal = document.getElementById('fe-cookie-modal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    syncScrollLock();
  }

  function handleAction(action) {
    if (action === 'accept-all') {
      saveConsent({
        necessary: true,
        preferences: true,
        analytics: true,
        marketing: true
      });
      hideBanner();
      closeModal();
      return;
    }

    if (action === 'reject') {
      saveConsent(defaultConsent());
      hideBanner();
      closeModal();
      return;
    }

    if (action === 'settings') {
      openModal();
      return;
    }

    if (action === 'save-settings') {
      saveConsent(readCheckboxes());
      hideBanner();
      closeModal();
    }
  }

  function bindActions() {
    document.addEventListener('click', function (event) {
      var actionTarget = event.target.closest('[data-cookie-action]');
      if (actionTarget) {
        event.preventDefault();
        handleAction(actionTarget.getAttribute('data-cookie-action'));
      }

      if (event.target.classList.contains('fe-cookie-open')) {
        event.preventDefault();
        openModal();
      }

      if (event.target.classList.contains('fe-cookie-close')
        || (event.target.classList.contains('fe-cookie-modal') && event.target === event.currentTarget)) {
        event.preventDefault();
        closeModal();
      }
    });
  }

  function unwrapUniform() {
    if (window.jQuery && window.jQuery.uniform && typeof window.jQuery.uniform.restore === 'function') {
      window.jQuery('.fe-cookie-category input[type="checkbox"]').each(function () {
        window.jQuery.uniform.restore(this);
      });
    }
  }

  function dedupeBanner() {
    var banners = document.querySelectorAll('#fe-cookie-banner');
    if (banners.length > 1) {
      for (var i = 1; i < banners.length; i += 1) {
        banners[i].parentNode.removeChild(banners[i]);
      }
    }
    var modals = document.querySelectorAll('#fe-cookie-modal');
    if (modals.length > 1) {
      for (var j = 1; j < modals.length; j += 1) {
        modals[j].parentNode.removeChild(modals[j]);
      }
    }
  }

  function init() {
    dedupeBanner();
    unwrapUniform();
    var stored = parseConsent(getCookie(consentKey));
    if (stored) {
      applyConsent(stored);
      setCheckboxes(stored);
      loadOptionalServices(stored);
    } else {
      setCheckboxes(defaultConsent());
      showBanner();
    }
    bindActions();
    window.addEventListener('load', unwrapUniform);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
