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

{block name='cms'}
	{if isset($cms) && !isset($cms_category)}
		{if !$cms->active}
			<br />
			<div id="admin-action-cms">
				<p>
					<span>{l s='This CMS page is not visible to your customers.'}</span>
					<input type="hidden" id="admin-action-cms-id" value="{$cms->id}" />
					<input type="submit" value="{l s='Publish'}" name="publish_button" class="button btn btn-default"/>
					<input type="submit" value="{l s='Back'}" name="lnk_view" class="button btn btn-default"/>
				</p>
				<div class="clear" ></div>
				<p id="admin-action-result"></p>
			</div>
		{/if}
		{if isset($cms->id) && $cms->id|intval == 10}
			{if $lang_iso == 'de'}
				{assign var=fePageEyebrow value='Anreise'}
				{assign var=fePageTitle value='Lauscha ist leichter zu erreichen, als es aussieht.'}
				{assign var=fePageDesc value='Drei Stunden von Leipzig, vier von Frankfurt — und der Zug hält direkt im Ort. Planen Sie Ihre Route, lesen Sie dann die Hinweise für den letzten Abschnitt.'}
			{else}
				{assign var=fePageEyebrow value='Getting here'}
				{assign var=fePageTitle value='Lauscha is easier to reach than it looks.'}
				{assign var=fePageDesc value='Three hours from Leipzig, four from Frankfurt, and the train stops in the village itself. Plan your route below, then check the notes for the last stretch.'}
			{/if}
		{elseif isset($cms->id) && $cms->id|intval == 9}
			{if $lang_iso == 'de'}
				{assign var=fePageEyebrow value='Lauscha entdecken'}
				{assign var=fePageTitle value='Ein Glasbläserdorf im Thüringer Wald.'}
				{assign var=fePageDesc value='Waldrand-Komfort und Aktivitäten: entspannen Sie in der Holz-Sauna im Freien, erkunden Sie die Wanderwege und kehren Sie in die warme, gut ausgestattete Ferienwohnung zurück.'}
			{else}
				{assign var=fePageEyebrow value='Discover Lauscha'}
				{assign var=fePageTitle value='A glassmaking village in the Thüringer Wald.'}
				{assign var=fePageDesc value='Forest-side comforts and activities: unwind in the wood-fired outdoor sauna, explore nearby hiking trails, and return to a warm, well-equipped Ferienwohnung for quiet evenings in nature.'}
			{/if}
		{/if}
		{if isset($fePageTitle)}
			<div class="fe-page-hero">
				<div class="fe-page-hero__inner">
					<div class="fe-page-hero__eyebrow">{$fePageEyebrow}</div>
					<h1 class="fe-page-hero__title">{$fePageTitle}</h1>
					<p class="fe-page-hero__desc">{$fePageDesc}</p>
				</div>
			</div>
		{/if}
		<div class="rte{if $content_only} content_only{/if}{if isset($fePageTitle)} fe-cms-page{/if}">
			{if isset($cms->id) && $cms->id|intval == 9}
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
			{/if}
			{if isset($cms->id) && $cms->id|intval == 10}
				<div class="fe-cms-card fe-route-planner" id="fe-route-planner">
					<div class="fe-rp-head">
						<div class="fe-rp-title">{if $lang_iso == 'de'}Planen Sie Ihre Route{else}Plan your route{/if}</div>
						<div class="fe-rp-note">{if $lang_iso == 'de'}Geben Sie Ihren Startpunkt ein — das Tool deckt Auto, Bahn und Bus ab.{else}Enter where you start; the tool covers car, train and bus.{/if}</div>
					</div>
					<div class="fe-rp-controls">
						<div class="fe-rp-modes">
							<button type="button" class="is-active" data-mode="auto">{if $lang_iso == 'de'}Auto{else}Car{/if}</button>
							<button type="button" data-mode="transit">{if $lang_iso == 'de'}Bahnen{else}Public transport{/if}</button>
						</div>
						<div class="fe-rp-search">
							<input type="text" placeholder="{if $lang_iso == 'de'}Stadt oder Adresse{else}City or address{/if}" aria-label="{if $lang_iso == 'de'}Planen Sie Ihre Route{else}Plan your route{/if}" />
							<button type="button" class="fe-rp-go">{if $lang_iso == 'de'}Route berechnen{else}Plan route{/if}</button>
						</div>
					</div>
					<div class="fe-rp-presets">
						<span>{if $lang_iso == 'de'}Schnellauswahl:{else}Quick picks:{/if}</span>
						<button type="button" data-lat="51.3397" data-lon="12.3731">Leipzig</button>
						<button type="button" data-lat="50.1109" data-lon="8.6821">Frankfurt am Main</button>
						<button type="button" data-lat="49.4521" data-lon="11.0767">N&uuml;rnberg</button>
						<button type="button" data-lat="50.9848" data-lon="11.0299">Erfurt</button>
						<button type="button" data-lat="50.3753" data-lon="11.1808">Sonneberg</button>
					</div>
					<div class="fe-rp-map" role="application" aria-label="{if $lang_iso == 'de'}Planen Sie Ihre Route{else}Plan your route{/if}"></div>
					<div class="fe-rp-summary" hidden>
						<span class="fe-rp-dist"></span>
						<span class="fe-rp-sep">&middot;</span>
						<span class="fe-rp-time"></span>
					</div>
					<div class="fe-rp-status" aria-live="polite"></div>
					<div class="fe-rp-privacy">{if $lang_iso == 'de'}Karte &amp; Suche: OpenStreetMap. Routing: eigener Server — keine Datenweitergabe.{else}Map &amp; search: OpenStreetMap. Routing: our own server — no data shared.{/if}</div>
				</div>
			{/if}
			{$cms->content}
		</div>
	{elseif isset($cms_category)}
		<div class="block-cms">
			<h1><a href="{if $cms_category->id eq 1}{if isset($force_ssl) && $force_ssl}{$base_dir_ssl}{else}{$base_dir}{/if}{else}{$link->getCMSCategoryLink($cms_category->id, $cms_category->link_rewrite)}{/if}">{$cms_category->name|escape:'html':'UTF-8'}</a></h1>
			{if $cms_category->description}
				<p>{$cms_category->description|escape:'html':'UTF-8'}</p>
			{/if}
			{if isset($sub_category) && !empty($sub_category)}
				<p class="title_block">{l s='List of sub categories in %s:' sprintf=$cms_category->name}</p>
				<ul class="bullet list-group">
					{foreach from=$sub_category item=subcategory}
						<li>
							<a class="list-group-item" href="{$link->getCMSCategoryLink($subcategory.id_cms_category, $subcategory.link_rewrite)|escape:'html':'UTF-8'}">{$subcategory.name|escape:'html':'UTF-8'}</a>
						</li>
					{/foreach}
				</ul>
			{/if}
			{if isset($cms_pages) && !empty($cms_pages)}
			<p class="title_block">{l s='List of pages in %s:' sprintf=$cms_category->name}</p>
				<ul class="bullet list-group">
					{foreach from=$cms_pages item=cmspages}
						<li>
							<a class="list-group-item" href="{$link->getCMSLink($cmspages.id_cms, $cmspages.link_rewrite)|escape:'html':'UTF-8'}">{$cmspages.meta_title|escape:'html':'UTF-8'}</a>
						</li>
					{/foreach}
				</ul>
			{/if}
		</div>
	{else}
		<div class="alert alert-danger">
			{l s='This page does not exist.'}
		</div>
	{/if}
	<br />
	{block name='cms_js_vars'}
		{strip}
			{if isset($smarty.get.ad) && $smarty.get.ad}
				{addJsDefL name=ad}{$base_dir|cat:$smarty.get.ad|escape:'html':'UTF-8'}{/addJsDefL}
			{/if}
			{if isset($smarty.get.adtoken) && $smarty.get.adtoken}
				{addJsDefL name=adtoken}{$smarty.get.adtoken|escape:'html':'UTF-8'}{/addJsDefL}
			{/if}
		{/strip}
	{/block}
{/block}
