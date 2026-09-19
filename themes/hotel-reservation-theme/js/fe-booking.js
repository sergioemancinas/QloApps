/* Pack-8 homepage booking bar + two-month availability calendar.
 * Fills the existing #search_hotel_block_form fields and submits it, so the
 * server-side search/checkout flow stays authoritative. */
(function () {
  var CFG = {
    baseRate2: 190.0,
    baseRate4: 200.0,
    weekly2: 997.5,
    weekly4: 1050.0
  };
  var AVAIL_TTL = 5 * 60 * 1000;

  function root() { return document.querySelector('.fe-hero8'); }
  function labels(r) {
    var d = r.dataset;
    return {
      addDate: d.addDate, done: d.done, clear: d.clear, check: d.check,
      book: d.book, night: d.night, nights: d.nights,
      guest: { de: d.guestOne, en: d.guestEn },
      guests: { de: d.guestsDe, en: d.guestsEn }
    };
  }
  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

  var availabilityCache = null, availabilityAt = 0, availabilityPromise = null;

  function loadAvailability(url) {
    if (availabilityCache && Date.now() - availabilityAt < AVAIL_TTL) return Promise.resolve(availabilityCache);
    if (availabilityPromise) return availabilityPromise;
    availabilityPromise = fetch(url, { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var blocked = {};
        (data.events || []).forEach(function (ev) {
          if (!ev.start || !ev.end) return;
          var d = startOfDay(new Date(ev.start + 'T00:00:00'));
          var end = startOfDay(new Date(ev.end + 'T00:00:00'));
          while (d < end) { blocked[iso(d)] = true; d = addDays(d, 1); }
        });
        availabilityCache = blocked;
        availabilityAt = Date.now();
        return blocked;
      })
      .catch(function () { availabilityCache = {}; availabilityAt = Date.now(); return availabilityCache; });
    return availabilityPromise;
  }

  function init() {
    var r = root();
    if (!r || r.dataset.feBookingInit) return;
    r.dataset.feBookingInit = '1';
    var L = labels(r);
    var isDe = (document.documentElement.getAttribute('lang') || 'en').toLowerCase().indexOf('de') === 0;
    var langTag = isDe ? 'de-DE' : 'en-GB';

    var inField = r.querySelector('#fe-in-field'),
        outField = r.querySelector('#fe-out-field'),
        inValue = r.querySelector('#fe-in-value'),
        outValue = r.querySelector('#fe-out-value'),
        cal = r.querySelector('#fe-cal'),
        calError = r.querySelector('#fe-cal-error'),
        guestsValue = r.querySelector('#fe-guests-value'),
        chargeable = r.querySelector('#fewo_chargeable_guests'),
        dogToggle = r.querySelector('#fe-dog-toggle'),
        dogValue = r.querySelector('#fe-dog-value'),
        dogSwitch = r.querySelector('.fe-hero8__switch'),
        submitBtn = r.querySelector('#fe-book-submit'),
        submitLabel = r.querySelector('#fe-book-submit-label'),
        quote = r.querySelector('#fe-quote'),
        note = r.querySelector('#fe-checkout-note');

    var state = { view: null, checkIn: null, checkOut: null, hover: null, guests: 2, dog: false, open: false, error: '' };
    state.view = startOfDay(new Date());
    state.view = new Date(state.view.getFullYear(), state.view.getMonth(), 1);
    var today = startOfDay(new Date());

    function setError(msg) {
      state.error = msg || '';
      if (!calError) return;
      if (msg) { calError.textContent = msg; calError.hidden = false; }
      else { calError.hidden = true; }
    }

    function info(d, blocked) {
      return { available: !blocked[iso(d)] };
    }

    function perNight(nights, guests) {
      var two = nights >= 7 ? CFG.weekly2 / 7 : CFG.baseRate2;
      var four = nights >= 7 ? CFG.weekly4 / 7 : CFG.baseRate4;
      return guests >= 3 ? four : two;
    }

    function money(n) {
      return n.toLocaleString(langTag, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (isDe ? ' €' : ' €');
    }

    function fmtDay(d) {
      return d.toLocaleDateString(langTag, { weekday: 'short', day: 'numeric', month: 'short' });
    }
    function fmtMonth(d) {
      return d.toLocaleDateString(langTag, { month: 'long', year: 'numeric' });
    }

    function blockedBetween(a, b, blocked) {
      for (var d = addDays(a, 1); d < b; d = addDays(d, 1)) {
        if (blocked[iso(d)]) return true;
      }
      return false;
    }

    function pick(d, blocked) {
      if (d < today) { setError(r.dataset.errPast); return; }
      if (blocked[iso(d)]) return;
      if (!state.checkIn || state.checkOut || d <= state.checkIn) {
        state.checkIn = d; state.checkOut = null; setError(''); render(blocked); return;
      }
      var nights = Math.round((d - state.checkIn) / 86400000);
      if (nights < 2) { setError(r.dataset.errMin); return; }
      if (blockedBetween(state.checkIn, d, blocked)) { setError(r.dataset.errBlocked); return; }
      state.checkOut = d; setError(''); render(blocked);
    }

    function dayCell(d, blocked) {
      var past = d < today;
      var available = !blocked[iso(d)];
      var isIn = state.checkIn && +d === +state.checkIn;
      var end = state.checkOut || (state.checkIn && state.hover && state.hover > state.checkIn ? state.hover : null);
      var isOut = end && +d === +end;
      var inRange = state.checkIn && end && d > state.checkIn && d < end;
      var usable = !past && available;

      var cell = document.createElement('div');
      cell.className = 'fe-cal-day';
      cell.innerHTML = '<span class="fe-cal-day__num"></span>';
      cell.firstChild.textContent = d.getDate();

      if (past) cell.classList.add('is-past');
      if (!available && !past) cell.classList.add('is-booked');
      if (inRange) cell.classList.add('is-range');
      if (isIn || isOut) cell.classList.add('is-edge');
      if (isIn) cell.classList.add('is-in');
      if (isOut) cell.classList.add('is-out');

      if (usable) {
        cell.addEventListener('click', function () { pick(d, blocked); });
        cell.addEventListener('mouseenter', function () {
          if (state.checkIn && !state.checkOut) { state.hover = d; render(blocked); }
        });
      }
      return cell;
    }

    function monthGrid(base, blocked) {
      var wrap = document.createElement('div');
      var dowsRow = document.createElement('div');
      dowsRow.className = 'fe-cal-dows';
      var dows = isDe ? ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'] : ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
      dows.forEach(function (w) {
        var el = document.createElement('div'); el.textContent = w; dowsRow.appendChild(el);
      });
      wrap.appendChild(dowsRow);

      var grid = document.createElement('div');
      grid.className = 'fe-cal-grid';
      var y = base.getFullYear(), m = base.getMonth();
      var lead = (new Date(y, m, 1).getDay() + 6) % 7;
      var count = new Date(y, m + 1, 0).getDate();
      for (var i = 0; i < lead; i++) {
        var pad = document.createElement('div'); pad.className = 'fe-cal-pad'; grid.appendChild(pad);
      }
      for (var n = 1; n <= count; n++) {
        grid.appendChild(dayCell(new Date(y, m, n), blocked));
      }
      wrap.appendChild(grid);
      return wrap;
    }

    function render(blocked) {
      inValue.textContent = state.checkIn ? fmtDay(state.checkIn) : L.addDate;
      outValue.textContent = state.checkOut ? fmtDay(state.checkOut) : L.addDate;
      guestsValue.textContent = isDe
        ? state.guests + (state.guests === 1 ? ' ' + L.guest.de : ' ' + L.guests.de)
        : state.guests + (state.guests > 1 ? ' ' + L.guests.en : ' ' + L.guest.en);
      dogValue.textContent = state.dog ? (isDe ? 'Ja, ein Hund' : 'Yes, one dog') : (isDe ? 'Kein Hund' : 'No dog');
      if (dogSwitch) dogSwitch.classList.toggle('is-on', state.dog);
      if (chargeable) chargeable.value = String(state.guests);

      var nights = 0, total = 0;
      if (state.checkIn && state.checkOut) {
        nights = Math.round((state.checkOut - state.checkIn) / 86400000);
        var pn = perNight(nights, state.guests);
        total = pn * nights;
        for (var d = new Date(state.checkIn); d < state.checkOut; d = addDays(d, 1)) {
          if (blocked[iso(d)]) { /* safety */ }
        }
      }
      submitLabel.textContent = nights
        ? L.book + ' ' + nights + ' ' + (nights === 1 ? (isDe ? 'Nacht' : 'night') : (isDe ? 'Nächte' : 'nights')).toUpperCase()
        : L.check;

      var m1 = r.querySelector('#fe-month1'), m2 = r.querySelector('#fe-month2');
      m1.innerHTML = ''; m2.innerHTML = '';
      m1.appendChild(monthGrid(state.view, blocked));
      m2.appendChild(monthGrid(new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1), blocked));
      r.querySelector('#fe-cal-m1').textContent = fmtMonth(state.view);
      r.querySelector('#fe-cal-m2').textContent = fmtMonth(new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1));
      var atStart = state.view.getFullYear() === today.getFullYear() && state.view.getMonth() === today.getMonth();
      r.querySelector('#fe-cal-prev').disabled = atStart;

      var q = r.querySelector('#fe-q-nights'),
          qg = r.querySelector('#fe-q-guests'),
          qr = r.querySelector('#fe-q-rate'),
          qt = r.querySelector('#fe-q-total');
      if (state.checkIn && state.checkOut) {
        q.textContent = String(nights);
        qg.textContent = isDe ? state.guests + (state.guests === 1 ? ' ' + L.guest.de : ' ' + L.guests.de) : state.guests + (state.guests > 1 ? ' ' + L.guests.en : ' ' + L.guest.en);
        qr.textContent = money(perNight(nights, state.guests)) + (isDe ? ' / Nacht' : ' / night');
        qt.textContent = money(total);
        quote.hidden = false;
        note.hidden = false;
      } else {
        quote.hidden = true;
        note.hidden = true;
      }
    }

    function openCal() {
      loadAvailability(r.dataset.availabilityUrl).then(function (blocked) {
        state.open = true;
        cal.hidden = false;
        render(blocked);
      });
    }
    function closeCal() {
      state.open = false;
      state.hover = null;
      cal.hidden = true;
    }

    loadAvailability(r.dataset.availabilityUrl).then(function (blocked) { render(blocked); });

    inField.addEventListener('click', function () {
      if (state.open) { closeCal(); return; }
      state.checkIn = null; state.checkOut = null; setError(''); openCal();
    });
    outField.addEventListener('click', function () {
      if (state.open) { closeCal(); return; }
      openCal();
    });
    r.querySelector('#fe-cal-prev').addEventListener('click', function () {
      state.view = new Date(state.view.getFullYear(), state.view.getMonth() - 1, 1);
      loadAvailability(r.dataset.availabilityUrl).then(function (b) { render(b); });
    });
    r.querySelector('#fe-cal-next').addEventListener('click', function () {
      state.view = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1);
      loadAvailability(r.dataset.availabilityUrl).then(function (b) { render(b); });
    });
    r.querySelector('#fe-cal-clear').addEventListener('click', function () {
      state.checkIn = null; state.checkOut = null; state.hover = null; setError('');
      loadAvailability(r.dataset.availabilityUrl).then(render);
    });
    r.querySelector('#fe-cal-done').addEventListener('click', closeCal);
    document.addEventListener('click', function (e) {
      if (!state.open) return;
      if (r.querySelector('.fe-hero8__barwrap').contains(e.target)) return;
      closeCal();
    });

    r.querySelector('#fe-guests-less').addEventListener('click', function () {
      state.guests = Math.max(1, state.guests - 1);
      loadAvailability(r.dataset.availabilityUrl).then(render);
    });
    r.querySelector('#fe-guests-more').addEventListener('click', function () {
      state.guests = Math.min(4, state.guests + 1);
      loadAvailability(r.dataset.availabilityUrl).then(render);
    });
    dogToggle.addEventListener('click', function () {
      state.dog = !state.dog;
      loadAvailability(r.dataset.availabilityUrl).then(render);
    });

    submitBtn.addEventListener('click', function () {
      if (!(state.checkIn && state.checkOut)) { openCal(); return; }
      var form = document.getElementById('search_hotel_block_form');
      if (!form) { return; }
      document.getElementById('check_in_time').value = iso(state.checkIn);
      document.getElementById('check_out_time').value = iso(state.checkOut);
      var btn = document.getElementById('search_room_submit');
      if (btn) btn.click(); else form.submit();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
