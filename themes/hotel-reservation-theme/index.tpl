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

{block name='displayHomeTabContent'}
	{if isset($HOOK_HOME_TAB_CONTENT) && $HOOK_HOME_TAB_CONTENT|trim}
		{block name='displayHomeTab'}
			{if isset($HOOK_HOME_TAB) && $HOOK_HOME_TAB|trim}
				<ul id="home-page-tabs" class="nav nav-tabs clearfix">
					{$HOOK_HOME_TAB}
				</ul>
			{/if}
		{/block}
		<div class="tab-content">{$HOOK_HOME_TAB_CONTENT}</div>
	{/if}
{/block}
{block name='displayHome'}
	<div class="fe-weather-section">
		<div class="container">
			<div class="fe-weather-widget" id="fe-weather-widget">
				<div class="fe-weather-header">
					<div class="fe-weather-location">
						<i class="fa fa-map-marker"></i>
						<span>Lauscha, {l s='Thuringia'}</span>
					</div>
					<p class="fe-weather-subtitle">{l s='Plan your forest escape'}</p>
				</div>
				<div class="fe-weather-loading">
					<div class="fe-weather-spinner"></div>
					<span>{l s='Loading weather...'}</span>
				</div>
				<div class="fe-weather-content" style="display: none;">
					<div class="fe-weather-current">
						<div class="fe-weather-today">
							<span class="fe-weather-now-label">{l s='Now'}</span>
							<span class="fe-weather-icon-large" id="fe-weather-icon"></span>
							<div class="fe-weather-temp-wrap">
								<span class="fe-weather-temp" id="fe-weather-temp">--</span>
								<span class="fe-weather-unit">°C</span>
							</div>
						</div>
						<div class="fe-weather-details">
							<p class="fe-weather-desc" id="fe-weather-desc">--</p>
							<div class="fe-weather-meta">
								<span><i class="fa fa-thermometer-half"></i> {l s='Feels like'} <strong id="fe-weather-feels">--</strong>°C</span>
								<span><i class="fa fa-tint"></i> {l s='Humidity'} <strong id="fe-weather-humidity">--</strong>%</span>
								<span><i class="fa fa-flag"></i> {l s='Wind'} <strong id="fe-weather-wind">--</strong> km/h</span>
							</div>
						</div>
					</div>
					<div class="fe-weather-forecast" id="fe-weather-forecast"></div>
				</div>
				<div class="fe-weather-error" style="display: none;">
					<p>{l s='Weather data unavailable'}</p>
				</div>
			</div>
		</div>
	</div>
	{if isset($HOOK_HOME) && $HOOK_HOME|trim}
		<div class="fe-welcome-offer">
			<div class="container">
				<div class="fe-welcome-card">
					<div class="fe-welcome-copy">
						<p class="fe-welcome-eyebrow">{l s='Welcome offer'}</p>
						<h3>{l s='Register for a welcome voucher on your next stay'}</h3>
						<p>{l s='Subscribe to our newsletter and receive a welcome voucher by email for your next forest escape in Lauscha.'}</p>
					</div>
					<div class="fe-welcome-actions">
						<a class="btn btn-primary" href="{$link->getPageLink('authentication', true)|escape:'html':'UTF-8'}?create_account=1">{l s='Claim voucher'}</a>
						<a class="btn btn-default" href="{$link->getPageLink('contact', true)|escape:'html':'UTF-8'}">{l s='Ask a question'}</a>
					</div>
				</div>
			</div>
		</div>
		<div class="clearfix">{$HOOK_HOME}</div>
	{/if}
{/block}
