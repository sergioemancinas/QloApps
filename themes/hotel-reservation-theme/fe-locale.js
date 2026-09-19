/* FeWo Lauscha — locale auto-detect.
   Uses the browser language (no location permission needed):
   German browsers land on /de/, everyone else on /en/, once per device.
   A manual language switch is remembered and never overridden. */
(function () {
	'use strict';

	var KEY = 'fw-locale-choice';
	var stored = null;
	try { stored = window.localStorage.getItem(KEY); } catch (e) {}

	if (stored === 'manual') { return; }
	if (stored) { return; } // auto-redirect already done once

	var path = window.location.pathname;
	var onDe = /\/de(\/|$)/.test(path);
	var onEn = /\/en(\/|$)/.test(path);
	if (!onDe && !onEn) { return; } // only storefront pages

	// ignore admin, module endpoints, previews
	if (/\/(admin|module|auth)\//.test(path)) { return; }

	var lang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
	lang = String(lang).toLowerCase();
	var wantsDe = lang.indexOf('de') === 0;

	if (wantsDe && !onDe) {
		try { window.localStorage.setItem(KEY, 'auto'); } catch (e) {}
		window.location.replace(path.replace(/^\/en/, '/de'));
	} else if (!wantsDe && onDe) {
		try { window.localStorage.setItem(KEY, 'auto'); } catch (e) {}
		window.location.replace(path.replace(/^\/de/, '/en'));
	} else {
		try { window.localStorage.setItem(KEY, 'auto'); } catch (e) {}
	}

	// Remember manual switches made via the language selector.
	document.addEventListener('click', function (ev) {
		var a = ev.target && ev.target.closest ? ev.target.closest('a[href*="/de/"], a[href*="/en/"]') : null;
		if (!a) { return; }
		var target = a.getAttribute('href') || '';
		var from = onDe ? '/de/' : '/en/';
		var to = onDe ? '/en/' : '/de/';
		if (target.indexOf(to) !== -1 && !target.includes('/module/')) {
			try { window.localStorage.setItem(KEY, 'manual'); } catch (e) {}
		}
	}, true);
})();

/* ===== Brand navigation interactions ===== */
(function () {
  function initNav() {
    var dropdowns = document.querySelectorAll('.fe-nav-dropdown');
    dropdowns.forEach(function (dd) {
      var toggle = dd.querySelector('.fe-nav-lang__toggle');
      if (!toggle || toggle.dataset.feNavInit) return;
      toggle.dataset.feNavInit = '1';
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = dd.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    document.addEventListener('click', function () {
      dropdowns.forEach(function (dd) { dd.classList.remove('is-open'); });
    });
    var burger = document.querySelector('.fe-nav-burger');
    var items = document.getElementById('fe-mobile-nav');
    if (burger && items && !burger.dataset.feNavInit) {
      burger.dataset.feNavInit = '1';
      burger.addEventListener('click', function () {
        items.classList.toggle('is-open');
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNav);
  else initNav();
})();
