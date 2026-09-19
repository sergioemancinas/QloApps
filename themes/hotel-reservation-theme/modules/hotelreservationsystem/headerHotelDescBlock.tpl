{*
 * Pack-8 homepage hero + booking calendar bar (FeWo Lauscha brand).
 * Replaces the default "Welcome to" hero. The old search form stays in the
 * DOM (hidden by CSS) — fe-booking.js fills its fields and submits it, so
 * QloApps remains the authoritative booking flow.
*}
{block name='header_hotel_block'}

	{if $lang_iso == 'de'}
		{assign var=feEyebrow value='Lauscha · Thüringer Wald'}
		{assign var=feHeroTitle value='Eine ruhige Wohnung am Waldrand.'}
		{assign var=feHeroDesc value='Platz für vier, Holz-Sauna im Garten, der Rennsteig zehn Minuten bergauf.'}
		{assign var=feInLabel value='Anreise'}
		{assign var=feOutLabel value='Abreise'}
		{assign var=feAddDate value='Datum wählen'}
		{assign var=feGuestsLabel value='Gäste · max. 4, Kinder inklusive'}
		{assign var=feDogLabel value='Hund · auf Anfrage'}
		{assign var=feDogYes value='Ja, ein Hund'}
		{assign var=feDogNo value='Kein Hund'}
		{assign var=feCheckLabel value='Verfügbarkeit prüfen'}
		{assign var=feBookLabel value='buchen'}
		{assign var=feNightsLabel value='Nächte'}
		{assign var=feGuestsQuote value='Gäste'}
		{assign var=feRateQuote value='Preis'}
		{assign var=fePerNight value='pro Nacht'}
		{assign var=feTotalLabel value='Gesamt'}
		{assign var=feCheckoutNote value='Endpreis wird im Buchungsablauf bestätigt.'}
		{assign var=feDone value='Fertig'}
		{assign var=feClear value='Zurücksetzen'}
		{assign var=feAvailLegend value='Frei'}
		{assign var=feStayLegend value='Ihr Aufenthalt'}
		{assign var=feBookedLegend value='Belegt'}
		{assign var=feMinNote value='Mindestens zwei Nächte · max. 4 Gäste, Kinder inklusive · ein Hund willkommen'}
		{assign var=feErrMin value='Der Mindestaufenthalt beträgt zwei Nächte.'}
		{assign var=feErrBlocked value='Diese Daten liegen über einer Nacht, die bereits belegt ist.'}
		{assign var=feErrPast value='Bitte wählen Sie ein Ankunftsdatum in der Zukunft.'}
	{else}
		{assign var=feEyebrow value='Lauscha · Thüringer Wald'}
		{assign var=feHeroTitle value='A quiet flat at the forest edge.'}
		{assign var=feHeroDesc value='Sleeps four, wood-fired sauna in the garden, the Rennsteig ten minutes uphill.'}
		{assign var=feInLabel value='Check-in'}
		{assign var=feOutLabel value='Check-out'}
		{assign var=feAddDate value='Add a date'}
		{assign var=feGuestsLabel value='Guests · max 4, children included'}
		{assign var=feDogLabel value='Dog · on request'}
		{assign var=feDogYes value='Yes, one dog'}
		{assign var=feDogNo value='No dog'}
		{assign var=feCheckLabel value='Check availability'}
		{assign var=feBookLabel value='book'}
		{assign var=feNightsLabel value='Nights'}
		{assign var=feGuestsQuote value='Guests'}
		{assign var=feRateQuote value='Rate'}
		{assign var=fePerNight value='per night'}
		{assign var=feTotalLabel value='Total'}
		{assign var=feCheckoutNote value='Final price confirmed at checkout.'}
		{assign var=feDone value='Done'}
		{assign var=feClear value='Clear'}
		{assign var=feAvailLegend value='Available'}
		{assign var=feStayLegend value='Your stay'}
		{assign var=feBookedLegend value='Booked'}
		{assign var=feMinNote value='Minimum two nights · max 4 guests, children included · one dog welcome'}
		{assign var=feErrMin value='Minimum stay is two nights.'}
		{assign var=feErrBlocked value='Those dates run across a night that is already booked.'}
		{assign var=feErrPast value='Please pick an arrival date in the future.'}
	{/if}
	<div class="header-desc-container fe-hero8" data-availability-url="{$link->getModuleLink('fewobooking', 'availability')|escape:'html':'UTF-8'}"
		data-err-min="{$feErrMin}" data-err-blocked="{$feErrBlocked}" data-err-past="{$feErrPast}"
		data-add-date="{$feAddDate}" data-done="{$feDone}" data-clear="{$feClear}" data-check="{$feCheckLabel}" data-book="{$feBookLabel}" data-night="{$feNightsLabel|strtolower}" data-nights="{$feNightsLabel|strtolower}" data-guest-one="Gast" data-guests-de="Gäste" data-guest-en="guest" data-guests-en="guests">
		<div class="fe-hero8__bg" style="background-image:url('{$link->getMediaLink("`$smarty.const._PS_IMG_`{Configuration::get('WK_HOTEL_HEADER_IMAGE')}")}');"></div>
		<div class="fe-hero8__shade" aria-hidden="true"></div>
		<div class="fe-hero8__inner">
			<div class="fe-hero8__copy">
				<div class="fe-hero8__eyebrow">{$feEyebrow}</div>
				<h1 class="fe-hero8__title">{$feHeroTitle}</h1>
				<p class="fe-hero8__desc">{$feHeroDesc}</p>
			</div>

			<div class="fe-hero8__barwrap">
				<div class="fe-hero8__bar" id="fe-bookbar">
					<button type="button" class="fe-hero8__field" id="fe-in-field">
						<span class="fe-hero8__fieldlabel">{$feInLabel}</span>
						<span class="fe-hero8__fieldvalue" id="fe-in-value">{$feAddDate}</span>
					</button>
					<button type="button" class="fe-hero8__field" id="fe-out-field">
						<span class="fe-hero8__fieldlabel">{$feOutLabel}</span>
						<span class="fe-hero8__fieldvalue" id="fe-out-value">{$feAddDate}</span>
					</button>
					<div class="fe-hero8__field fe-hero8__field--guests">
						<span class="fe-hero8__fieldlabel">{$feGuestsLabel}</span>
						<div class="fe-hero8__guestrow">
							<span class="fe-hero8__fieldvalue" id="fe-guests-value">2</span>
							<span class="fe-hero8__stepper">
								<button type="button" id="fe-guests-less" aria-label="-">−</button>
								<button type="button" id="fe-guests-more" aria-label="+">+</button>
							</span>
						</div>
					</div>
					<button type="button" class="fe-hero8__field" id="fe-dog-toggle">
						<span class="fe-hero8__fieldlabel">{$feDogLabel}</span>
						<div class="fe-hero8__guestrow">
							<span class="fe-hero8__fieldvalue" id="fe-dog-value">{$feDogNo}</span>
							<span class="fe-hero8__switch" aria-hidden="true"><span class="fe-hero8__knob"></span></span>
						</div>
					</button>
					<button type="button" class="fe-hero8__cta" id="fe-book-submit">
						<span id="fe-book-submit-label">{$feCheckLabel}</span>
					</button>
				</div>

				<input type="hidden" id="fewo_chargeable_guests" name="fewo_chargeable_guests" value="2" />

				<div class="fe-hero8__cal" id="fe-cal" hidden>
					<div class="fe-hero8__calhead">
						<button type="button" class="fe-hero8__calnav" id="fe-cal-prev" aria-label="←">
							<svg width="8" height="12" viewBox="0 0 8 12" fill="none"><path d="M6.5 1L1.5 6l5 5" stroke="currentColor" stroke-width="1.5"/></svg>
						</button>
						<div class="fe-hero8__caltitles"><div id="fe-cal-m1"></div><div id="fe-cal-m2"></div></div>
						<button type="button" class="fe-hero8__calnav" id="fe-cal-next" aria-label="→">
							<svg width="8" height="12" viewBox="0 0 8 12" fill="none"><path d="M1.5 1l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg>
						</button>
					</div>
					<div class="fe-hero8__calgrid">
						<div class="fe-hero8__month" id="fe-month1"></div>
						<div class="fe-hero8__month" id="fe-month2"></div>
					</div>
					<div class="fe-hero8__calfoot">
						<div class="fe-hero8__legend">
							<span><i class="fe-lg fe-lg--avail"></i>{$feAvailLegend}</span>
							<span><i class="fe-lg fe-lg--stay"></i>{$feStayLegend}</span>
							<span><i class="fe-lg fe-lg--booked"></i>{$feBookedLegend}</span>
							<span class="fe-hero8__minnote">{$feMinNote}</span>
						</div>
						<div class="fe-hero8__calactions">
							<button type="button" class="fe-hero8__clear" id="fe-cal-clear">{$feClear}</button>
							<button type="button" class="fe-hero8__done" id="fe-cal-done">{$feDone}</button>
						</div>
					</div>
					<div class="fe-hero8__calerror" id="fe-cal-error" hidden></div>
				</div>

				<div class="fe-hero8__quote" id="fe-quote" hidden>
					<div class="fe-hero8__quoterows">
						<div class="fe-hero8__quotecell"><span class="fe-hero8__quotelabel">{$feNightsLabel}</span><span class="fe-hero8__quotevalue" id="fe-q-nights"></span></div>
						<div class="fe-hero8__quotecell"><span class="fe-hero8__quotelabel">{$feGuestsQuote}</span><span class="fe-hero8__quotevalue" id="fe-q-guests"></span></div>
						<div class="fe-hero8__quotecell"><span class="fe-hero8__quotelabel">{$feRateQuote}</span><span class="fe-hero8__quotevalue" id="fe-q-rate"></span></div>
					</div>
					<div class="fe-hero8__quotetotal">
						<span class="fe-hero8__quotelabel">{$feTotalLabel}</span>
						<span class="fe-hero8__total" id="fe-q-total"></span>
					</div>
				</div>
				<p class="fe-hero8__checkoutnote" id="fe-checkout-note" hidden>{$feCheckoutNote}</p>
			</div>
		</div>
	</div>
{/block}
