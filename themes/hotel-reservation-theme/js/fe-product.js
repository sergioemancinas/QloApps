/* Pack-9 apartment page: search strip, gallery polish, sticky booking card. */
(function () {
  function init() {
    var strip = document.getElementById('fe-search-strip');
    if (!strip || strip.dataset.feInit) return;
    strip.dataset.feInit = '1';

    function param(name) {
      var m = new RegExp('[?&]' + name + '=([^&#]+)').exec(window.location.search);
      return m ? decodeURIComponent(m[1]) : '';
    }
    function cookieVal(name) {
      var m = new RegExp('(?:^|;\\s*)' + name + '=([^;]*)').exec(document.cookie);
      return m ? decodeURIComponent(m[1]) : '';
    }

    var from = param('date_from') || cookieVal('fewo_date_from');
    var to = param('date_to') || cookieVal('fewo_date_to');
    var chargeable = param('fewo_chargeable_guests') || cookieVal('fewo_chargeable_guests');
    var under3 = param('fewo_under3_guests') || cookieVal('fewo_under3_guests');

    var isDe = (document.documentElement.getAttribute('lang') || 'en').toLowerCase().indexOf('de') === 0;
    var langTag = isDe ? 'de-DE' : 'en-GB';

    function fmtDate(isoDate) {
      var d = new Date(isoDate + 'T00:00:00');
      if (isNaN(d)) return null;
      return d.toLocaleDateString(langTag, { day: 'numeric', month: 'short', year: 'numeric' });
    }

    var datesEl = document.getElementById('fe-strip-dates');
    var nightsEl = document.getElementById('fe-strip-nights');
    var guestsEl = document.getElementById('fe-strip-guests');

    if (from && to && datesEl) {
      datesEl.textContent = fmtDate(from) + ' – ' + fmtDate(to);
      var nights = Math.round((new Date(to) - new Date(from)) / 86400000);
      if (nights > 0 && nightsEl) {
        nightsEl.textContent = nights + ' ' + (nights === 1 ? strip.dataset.n1 : strip.dataset.n2);
      }
    } else {
      datesEl.textContent = isDe ? 'Datum wählen' : 'Pick your dates';
    }

    if (guestsEl) {
      var total = parseInt(chargeable, 10) || 2;
      if (under3) total += parseInt(under3, 10) || 0;
      guestsEl.textContent = total + ' ' + (total === 1 ? strip.dataset.g1 : strip.dataset.g2) + (under3 && parseInt(under3, 10) > 0 ? (isDe ? ' · ' + under3 + ' unter 3' : ' · ' + under3 + ' under 3') : '');
    }

    var changeBtn = document.getElementById('fe-change-dates');
    if (changeBtn) {
      changeBtn.addEventListener('click', function () {
        var target = document.getElementById('fewo_chargeable_guests') ||
          document.querySelector('.fewo-date-input, #check_in_time, input[name="check_in_time"], .date-picker-input');
        var anchor = document.querySelector('.pb-right-column') || target;
        if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var input = document.querySelector('input.datepicker, .hasDatepicker, #daterange_value, input[name="check_in_time"]');
        if (input) setTimeout(function () { input.focus(); input.click && input.click(); }, 350);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
