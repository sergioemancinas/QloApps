/* FeWo Lauscha — homepage availability calendar (FullCalendar v6, global build) */
(function () {
	'use strict';

	function boot() {
		var el = document.getElementById('fewo-availability-calendar');
		if (!el || typeof FullCalendar === 'undefined') {
			return;
		}

		var initialView = window.matchMedia('(min-width: 768px)').matches
			? 'dayGridMonth'
			: 'listMonth';

		var calendar = new FullCalendar.Calendar(el, {
			initialView: initialView,
			locale: document.documentElement.lang || 'de',
			firstDay: 1,
			height: 'auto',
			headerToolbar: {
				left: 'prev,next today',
				center: 'title',
				right: 'dayGridMonth,listMonth'
			},
			loading: function (isLoading) {
				el.classList.toggle('is-loading', isLoading);
			},
			events: {
				url: (typeof fewoAvailabilityUrl !== 'undefined' && fewoAvailabilityUrl)
					? fewoAvailabilityUrl
					: '/module/fewobooking/availability',
				method: 'GET',
				failure: function () {
					el.classList.add('has-error');
				}
			},
			dateClick: function (info) {
				var picker = document.getElementById('check_in_time');
				if (picker) {
					picker.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}
			},
			eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false },
			displayEventTime: false,
			selectable: false
		});

		calendar.render();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}
})();
