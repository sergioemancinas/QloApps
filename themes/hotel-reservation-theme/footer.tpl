{*
* 2007-2017 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author PrestaShop SA <contact@prestashop.com>
*  @copyright  2007-2017 PrestaShop SA
*  @license    http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*}
{if !isset($content_only) || !$content_only}
					</div><!-- #center_column -->
					{if isset($right_column_size) && !empty($right_column_size)}
						<div id="right_column" class="col-xs-12 col-sm-{$right_column_size|intval} column">{$HOOK_RIGHT_COLUMN}</div>
					{/if}
					</div><!-- .row -->
					{block name='displayColumnsBottom'}
						{hook h='displayColumnsBottom'}
					{/block}
				</div><!-- #columns -->
			</div><!-- .columns-container -->
			{block name='displayFooter'}
				{if isset($HOOK_FOOTER)}
					{block name='displayFooterBefore'}
						{hook h='displayFooterBefore'}
					{/block}
					<!-- Footer -->
					<div class="footer-container">
						<footer id="footer"  class="container">
							<div class="row margin-btm-50">{$HOOK_FOOTER}</div>
						</footer>
						{block name='displayAfterDefautlFooterHook'}
							{hook h="displayAfterDefautlFooterHook"}
						{/block}
					</div><!-- #footer -->
				{/if}
			{/block}
		</div><!-- #page -->
		{assign var=privacyId value=Configuration::get('FEWO_CMS_PRIVACY_ID')}
		{assign var=cookiesId value=Configuration::get('FEWO_CMS_COOKIES_ID')}
		{if !$privacyId}{assign var=privacyId value=6}{/if}
		{if !$cookiesId}{assign var=cookiesId value=7}{/if}
		{assign var=fewo_banner_lang value='en'}
		{if isset($lang_iso) && $lang_iso|lower == 'de'}
			{assign var=fewo_banner_lang value='de'}
		{/if}
		<div id="fe-cookie-banner" class="fe-cookie-banner" role="dialog" aria-live="polite" aria-label="Privacy settings" data-lang="{$fewo_banner_lang|escape:'html':'UTF-8'}">
			<div class="fe-cookie-banner__content">
				<div class="fe-cookie-banner__text">
					<h3 data-lang-block="en">Your privacy matters</h3>
					<h3 data-lang-block="de">Ihre Privatsphäre zählt</h3>
					<p data-lang-block="en">
						We use your details to manage bookings and provide service. We keep data only as long as needed for your stay and legal obligations.
						<a href="{$link->getCMSLink($privacyId)|escape:'html':'UTF-8'}">Privacy Policy</a>
						&nbsp;&bull;&nbsp;
						<a href="{$link->getCMSLink($cookiesId)|escape:'html':'UTF-8'}">Cookie Policy</a>
					</p>
					<p data-lang-block="de">
						Wir verwenden Ihre Angaben für Buchungen und den Service. Daten werden nur so lange gespeichert, wie es für Ihren Aufenthalt und gesetzliche Pflichten erforderlich ist.
						<a href="{$link->getCMSLink($privacyId)|escape:'html':'UTF-8'}">Datenschutzerklärung</a>
						&nbsp;&bull;&nbsp;
						<a href="{$link->getCMSLink($cookiesId)|escape:'html':'UTF-8'}">Cookie-Richtlinie</a>
					</p>
					<p class="fe-cookie-legal-note" data-lang-block="en">
						Legal basis: contract performance and legitimate interests for bookings; consent for optional analytics and marketing cookies. Retention follows our privacy policy and statutory periods.
					</p>
					<p class="fe-cookie-legal-note" data-lang-block="de">
						Rechtsgrundlage: Vertragserfüllung und berechtigtes Interesse für Buchungen; Einwilligung für optionale Analyse- und Marketing-Cookies. Speicherung gemäß Datenschutzerklärung und gesetzlichen Fristen.
					</p>
				</div>
				<div class="fe-cookie-actions">
					<button type="button" class="btn btn-primary" data-cookie-action="accept-all" data-lang-block="en">Accept all</button>
					<button type="button" class="btn btn-primary" data-cookie-action="accept-all" data-lang-block="de">Alle akzeptieren</button>
					<button type="button" class="btn btn-default" data-cookie-action="reject" data-lang-block="en">Reject non-essential</button>
					<button type="button" class="btn btn-default" data-cookie-action="reject" data-lang-block="de">Nicht notwendige ablehnen</button>
					<button type="button" class="btn btn-link" data-cookie-action="settings" data-lang-block="en">Settings</button>
					<button type="button" class="btn btn-link" data-cookie-action="settings" data-lang-block="de">Einstellungen</button>
				</div>
			</div>
		</div>

		<div id="fe-cookie-modal" class="fe-cookie-modal" aria-hidden="true" data-lang="{$fewo_banner_lang|escape:'html':'UTF-8'}">
			<div class="fe-cookie-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="fe-cookie-title">
				<button class="fe-cookie-close" type="button" aria-label="Close">&times;</button>
				<h3 id="fe-cookie-title" data-lang-block="en">Privacy settings</h3>
				<h3 id="fe-cookie-title-de" data-lang-block="de">Datenschutz-Einstellungen</h3>
				<p data-lang-block="en">Manage your cookie preferences. Necessary cookies are always on to keep the site working.</p>
				<p data-lang-block="de">Verwalten Sie Ihre Cookie-Einstellungen. Notwendige Cookies sind immer aktiv.</p>
				<div class="fe-cookie-category">
					<label>
						<input type="checkbox" checked="checked" disabled="disabled" />
						<span data-lang-block="en">Necessary cookies</span>
						<span data-lang-block="de">Notwendige Cookies</span>
					</label>
					<small data-lang-block="en">Required for core functionality like booking, security, and language preferences.</small>
					<small data-lang-block="de">Erforderlich für Buchung, Sicherheit und Spracheinstellungen.</small>
				</div>
				<div class="fe-cookie-category">
					<label>
						<input type="checkbox" data-consent="preferences" />
						<span data-lang-block="en">Preference cookies</span>
						<span data-lang-block="de">Präferenz-Cookies</span>
					</label>
					<small data-lang-block="en">Remember your settings to improve your experience.</small>
					<small data-lang-block="de">Speichern Ihre Einstellungen für ein besseres Erlebnis.</small>
				</div>
				<div class="fe-cookie-category">
					<label>
						<input type="checkbox" data-consent="analytics" />
						<span data-lang-block="en">Analytics cookies</span>
						<span data-lang-block="de">Analyse-Cookies</span>
					</label>
					<small data-lang-block="en">Help us understand how the website is used so we can improve it.</small>
					<small data-lang-block="de">Helfen uns zu verstehen, wie die Website genutzt wird.</small>
				</div>
				<div class="fe-cookie-category">
					<label>
						<input type="checkbox" data-consent="marketing" />
						<span data-lang-block="en">Marketing cookies</span>
						<span data-lang-block="de">Marketing-Cookies</span>
					</label>
					<small data-lang-block="en">Used to show relevant offers and measure campaign performance.</small>
					<small data-lang-block="de">Für relevante Angebote und Kampagnenmessung.</small>
				</div>
				<div class="fe-cookie-actions">
					<button type="button" class="btn btn-default" data-cookie-action="reject" data-lang-block="en">Reject non-essential</button>
					<button type="button" class="btn btn-default" data-cookie-action="reject" data-lang-block="de">Nicht notwendige ablehnen</button>
					<button type="button" class="btn btn-primary" data-cookie-action="save-settings" data-lang-block="en">Save settings</button>
					<button type="button" class="btn btn-primary" data-cookie-action="save-settings" data-lang-block="de">Einstellungen speichern</button>
				</div>
			</div>
		</div>
{/if}
{block name='global'}
	{include file="$tpl_dir./global.tpl"}
{/block}
	<script type="text/javascript" src="{$js_dir}fe-animations.js?v=1"></script>
	<script type="text/javascript" src="{$js_dir}cookie-consent.js?v=7"></script>
	{if $page_name == 'cms' && isset($cms) && isset($cms->id) && $cms->id|intval == 9}
	<script type="text/javascript" src="{$js_dir}fe-weather.js?v=1"></script>
	{/if}
	<script type="text/javascript" src="{$js_dir}fe-travel.js?v=2"></script>
	<script type="text/javascript" src="{$js_dir}fe-labels.js?v=3"></script>
	{assign var=feWaNumber value=Configuration::get('FEWO_WHATSAPP_NUMBER')}
	{if !$feWaNumber}{assign var=feWaNumber value='4917612345678'}{* PLACEHOLDER: set real number via scripts/update_contact.sql *}{/if}
	{if $lang_iso == 'de'}
		{assign var=feWaAria value='Per WhatsApp an uns schreiben'}
		{assign var=feWaText value='Hallo FeWo Lauscha, ich hätte eine Frage zu einem Aufenthalt.'}
	{else}
		{assign var=feWaAria value='Contact us via WhatsApp'}
		{assign var=feWaText value='Hello FeWo Lauscha, I have a question about a stay.'}
	{/if}
	<a class="fe-wa-float" href="https://wa.me/{$feWaNumber}?text={$feWaText|urlencode}" target="_blank" rel="noopener" aria-label="{$feWaAria}">
		<i class="icon-whatsapp" aria-hidden="true"></i>
		<span class="fe-wa-float-label">{$feWaAria}</span>
	</a>
	</body>
</html>
