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
		{assign var=imprintId value=Configuration::get('FEWO_CMS_IMPRINT_ID')}
		<div id="fe-cookie-banner" class="fe-cookie-banner" role="dialog" aria-live="polite" aria-label="Privacy settings">
			<div class="fe-cookie-banner__content">
				<div class="fe-cookie-banner__text">
					<h3>{l s='Your privacy matters'}</h3>
					<p>
						{l s='We use necessary cookies to run this site. Optional cookies (analytics and marketing) are only used with your consent.'}
						{if $privacyId}
							<a href="{$link->getCMSLink($privacyId)}">{l s='Privacy Policy'}</a>
						{/if}
						{if $cookiesId}
							&nbsp;•&nbsp;<a href="{$link->getCMSLink($cookiesId)}">{l s='Cookie Policy'}</a>
						{/if}
						{if $imprintId}
							&nbsp;•&nbsp;<a href="{$link->getCMSLink($imprintId)}">{l s='Imprint'}</a>
						{/if}
					</p>
				</div>
				<div class="fe-cookie-actions">
					<button type="button" class="btn btn-primary" data-cookie-action="accept-all">{l s='Accept all'}</button>
					<button type="button" class="btn btn-default" data-cookie-action="reject">{l s='Reject non-essential'}</button>
					<button type="button" class="btn btn-link" data-cookie-action="settings">{l s='Settings'}</button>
				</div>
			</div>
		</div>

		<div id="fe-cookie-modal" class="fe-cookie-modal" aria-hidden="true">
			<div class="fe-cookie-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="fe-cookie-title">
				<button class="fe-cookie-close" type="button" aria-label="{l s='Close'}">&times;</button>
				<h3 id="fe-cookie-title">{l s='Privacy settings'}</h3>
				<p>{l s='Manage your cookie preferences. Necessary cookies are always on to keep the site working.'}</p>
				<div class="fe-cookie-category">
					<label>
						<input type="checkbox" checked="checked" disabled="disabled" />
						{l s='Necessary cookies'}
					</label>
					<small>{l s='Required for core functionality like booking, security, and language preferences.'}</small>
				</div>
				<div class="fe-cookie-category">
					<label>
						<input type="checkbox" data-consent="preferences" />
						{l s='Preference cookies'}
					</label>
					<small>{l s='Remember your settings to improve your experience.'}</small>
				</div>
				<div class="fe-cookie-category">
					<label>
						<input type="checkbox" data-consent="analytics" />
						{l s='Analytics cookies'}
					</label>
					<small>{l s='Help us understand how the website is used so we can improve it.'}</small>
				</div>
				<div class="fe-cookie-category">
					<label>
						<input type="checkbox" data-consent="marketing" />
						{l s='Marketing cookies'}
					</label>
					<small>{l s='Used to show relevant offers and measure campaign performance.'}</small>
				</div>
				<div class="fe-cookie-actions">
					<button type="button" class="btn btn-default" data-cookie-action="reject">{l s='Reject non-essential'}</button>
					<button type="button" class="btn btn-primary" data-cookie-action="save-settings">{l s='Save settings'}</button>
				</div>
			</div>
		</div>
{/if}
{block name='global'}
	{include file="$tpl_dir./global.tpl"}
{/block}
	<script type="text/javascript" src="{$js_dir}fe-animations.js?v=1"></script>
	<script type="text/javascript" src="{$js_dir}cookie-consent.js?v=1"></script>
	{if $page_name == 'cms' && isset($cms) && isset($cms->id) && $cms->id|intval == 9}
	<script type="text/javascript" src="{$js_dir}fe-weather.js?v=1"></script>
	{/if}
	<script type="text/javascript" src="{$js_dir}fe-travel.js?v=2"></script>
	</body>
</html>
