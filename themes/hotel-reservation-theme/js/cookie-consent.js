(function () {
  var consentKey = 'fewa_cookie_consent';
  var maxAgeDays = 180;

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
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

  function saveConsent(consent) {
    consent.updatedAt = new Date().toISOString();
    setCookie(consentKey, JSON.stringify(consent), maxAgeDays);
    applyConsent(consent);
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
  }

  function setCheckboxes(consent) {
    var boxes = document.querySelectorAll('[data-consent]');
    boxes.forEach(function (box) {
      var key = box.getAttribute('data-consent');
      box.checked = Boolean(consent[key]);
    });
  }

  function readCheckboxes() {
    var consent = defaultConsent();
    var boxes = document.querySelectorAll('[data-consent]');
    boxes.forEach(function (box) {
      var key = box.getAttribute('data-consent');
      consent[key] = box.checked;
    });
    return consent;
  }

  function showBanner() {
    var banner = document.getElementById('fe-cookie-banner');
    if (banner) {
      banner.classList.add('is-visible');
    }
  }

  function hideBanner() {
    var banner = document.getElementById('fe-cookie-banner');
    if (banner) {
      banner.classList.remove('is-visible');
    }
  }

  function openModal() {
    var modal = document.getElementById('fe-cookie-modal');
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    var modal = document.getElementById('fe-cookie-modal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
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

      if (event.target.classList.contains('fe-cookie-close') || event.target.classList.contains('fe-cookie-modal')) {
        if (event.target.classList.contains('fe-cookie-modal')) {
          closeModal();
          return;
        }
        event.preventDefault();
        closeModal();
      }
    });
  }

  function init() {
    var stored = parseConsent(getCookie(consentKey));
    if (stored) {
      applyConsent(stored);
      setCheckboxes(stored);
    } else {
      setCheckboxes(defaultConsent());
      showBanner();
    }
    bindActions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
