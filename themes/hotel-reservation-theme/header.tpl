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
<!DOCTYPE HTML>
<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7"{if isset($language_code) && $language_code} lang="{$language_code|escape:'html':'UTF-8'}"{/if}><![endif]-->
<!--[if IE 7]><html class="no-js lt-ie9 lt-ie8 ie7"{if isset($language_code) && $language_code} lang="{$language_code|escape:'html':'UTF-8'}"{/if}><![endif]-->
<!--[if IE 8]><html class="no-js lt-ie9 ie8"{if isset($language_code) && $language_code} lang="{$language_code|escape:'html':'UTF-8'}"{/if}><![endif]-->
<!--[if gt IE 8]> <html class="no-js ie9"{if isset($language_code) && $language_code} lang="{$language_code|escape:'html':'UTF-8'}"{/if}><![endif]-->
<html{if isset($language_code) && $language_code} lang="{$language_code|escape:'html':'UTF-8'}"{/if} {if isset($language_is_rtl) && $language_is_rtl}dir="rtl"{/if} style="{if $page_name == 'index'}height: 100%;{/if}">
	<head>
		<meta charset="utf-8" />
		{assign var='fewo_meta_title' value=$meta_title|escape:'html':'UTF-8'}
		{if $fewo_meta_title|strstr:'Hotel Prime'}
			{assign var='fewo_meta_title' value=$fewo_meta_title|replace:'Hotel Prime - ':''|replace:' - Hotel Prime':''|replace:'Hotel Prime':'FeWo Lauscha'}
		{/if}
		{if $shop_name && $fewo_meta_title == "`$shop_name` - `$shop_name`"}
			{assign var='fewo_meta_title' value=$shop_name|escape:'html':'UTF-8'}
		{/if}
		<title>{$fewo_meta_title}</title>
		{if isset($meta_description) AND $meta_description}
			<meta name="description" content="{$meta_description|escape:'html':'UTF-8'}" />
		{/if}
		{if isset($meta_keywords) AND $meta_keywords}
			<meta name="keywords" content="{$meta_keywords|escape:'html':'UTF-8'}" />
		{/if}
		<meta name="generator" content="QloApps" />
		<meta name="robots" content="{if isset($nobots)}no{/if}index,{if isset($nofollow) && $nofollow}no{/if}follow" />
		<meta name="viewport" content="width=device-width, minimum-scale=0.25, maximum-scale=1.6, initial-scale=1.0" />
		<meta name="mobile-web-app-capable" content="yes" />
		<link rel="icon" type="image/svg+xml" href="{$img_dir}brand/favicon.svg?v=1" />
		<link rel="icon" type="image/png" sizes="32x32" href="{$img_dir}brand/favicon-32.png?v=1" />
		<link rel="shortcut icon" type="image/png" href="{$img_dir}brand/favicon-32.png?v=1" />
		<link rel="apple-touch-icon" sizes="180x180" href="{$img_dir}brand/apple-touch-icon.png?v=1" />
		{if isset($css_files)}
			{foreach from=$css_files key=css_uri item=media}
				{if $css_uri == 'lteIE9'}
					<!--[if lte IE 9]>
					{foreach from=$css_files[$css_uri] key=css_uriie9 item=mediaie9}
					<link rel="stylesheet" href="{$css_uriie9|escape:'html':'UTF-8'}" type="text/css" media="{$mediaie9|escape:'html':'UTF-8'}" />
					{/foreach}
					<![endif]-->
				{else}
					<link rel="stylesheet" href="{$css_uri|escape:'html':'UTF-8'}" type="text/css" media="{$media|escape:'html':'UTF-8'}" />
				{/if}
			{/foreach}
		{/if}
		{if isset($js_defer) && !$js_defer && isset($js_files) && isset($js_def)}
			{$js_def}
			{foreach from=$js_files item=js_uri}
			<script type="text/javascript" src="{$js_uri|escape:'html':'UTF-8'}"></script>
			{/foreach}
		{/if}
		{block name='displayHeader'}
			{$HOOK_HEADER}
		{/block}
		<link rel="stylesheet" href="{$css_dir}fewo-responsive.css?v=3" type="text/css" media="all" />
		<link rel="stylesheet" href="{$css_dir}cookie-consent.css?v=7" type="text/css" media="all" />
		{if $page_name == 'contact'}
		<link rel="stylesheet" href="{$css_dir}fewo-contact.css?v=1" type="text/css" media="all" />
		{/if}
		<link rel="stylesheet" href="{$css_dir}fewo-brand.css?v=10" type="text/css" media="all" />
		<script src="{$js_dir}fe-locale.js?v=2" defer></script>
		<script src="{$js_dir}fe-booking.js?v=1" defer></script>
		<script src="{$js_dir}fe-product.js?v=1" defer></script>
		<link rel="stylesheet" href="{$css_dir}fewo-whatsapp.css?v=1" type="text/css" media="all" />
		<!-- <link rel="stylesheet" href="http{if Tools::usingSecureMode()}s{/if}://fonts.googleapis.com/css?family=Open+Sans:300,600&amp;subset=latin,latin-ext" type="text/css" media="all" /> -->

		<!--[if IE 8]>
		<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
		<script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
		<![endif]-->

		<!-- by webkul -->
		<!-- <link href='https://fonts.googleapis.com/css?family=Parisienne' rel='stylesheet' type='text/css'> -->
		<!-- <link href='https://fonts.googleapis.com/css?family=PT+Serif:400,400italic,700,700italic' rel='stylesheet' type='text/css'> -->
		<link href='//fonts.googleapis.com/css?family=Oxygen:400,300,700' rel='stylesheet' type='text/css'>
	</head>
	<body{if isset($page_name)} id="{$page_name|escape:'html':'UTF-8'}"{/if} class="{if isset($page_name)}{$page_name|escape:'html':'UTF-8'}{/if}{if isset($body_classes) && $body_classes|@count} {' '|implode:$body_classes}{/if}{if $hide_left_column} hide-left-column{else} show-left-column{/if}{if $hide_right_column} hide-right-column{else} hide-right-column{/if}{if isset($content_only) && $content_only} content_only{/if} lang_{$lang_iso}" style="{if $page_name == 'index'}height: 100%;{/if}">
	{if !isset($content_only) || !$content_only}
		{if isset($restricted_country_mode) && $restricted_country_mode}
			<div id="restricted-country">
				<p>{l s='You cannot place a new order from your country.'}{if isset($geolocation_country) && $geolocation_country} <span class="bold">{$geolocation_country|escape:'html':'UTF-8'}</span>{/if}</p>
			</div>
		{/if}
		<div id="page" style="{if $page_name == 'index'}height: 100%;{/if}">
			<div class="header-container" style="{if $page_name == 'index'}height: 100%;{/if}">
				<header id="header" style='{if $page_name == "index"}background-image:url("{$link->getMediaLink("`$smarty.const._PS_IMG_`{Configuration::get('WK_HOTEL_HEADER_IMAGE')}")}"); height: 100%;{else}background-color:#252525;{/if}' >
					<div class="banner">
						<div class="container">
							<div class="row">
								{block name='displayBanner'}
									{hook h="displayBanner"}
								{/block}
							</div>
						</div>
					</div>
					{block name='header_nav'}
						<div class="fe-nav">
							<div class="fe-nav-utility">
								<div class="fe-nav-utility__inner">
									<span class="fe-nav-utility__note">{l s='Direct booking · best rate, no platform fee'}</span>
									<div class="fe-nav-utility__actions">
										<div class="fe-nav-lang fe-nav-dropdown">
											<button type="button" class="fe-nav-lang__toggle" data-fe-dropdown="lang" aria-haspopup="true" aria-expanded="false">
												<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.6" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 8h13M8 1.4c1.8 1.9 2.7 4.1 2.7 6.6S9.8 12.7 8 14.6C6.2 12.7 5.3 10.5 5.3 8S6.2 3.3 8 1.4Z" stroke="currentColor" stroke-width="1.2"/></svg>
												<span>{$lang_iso|strtoupper}</span>
												<svg class="fe-caret" width="9" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.3"/></svg>
											</button>
											<div class="fe-nav-dropdown__menu" role="menu">
												{if isset($languages)}
													{foreach from=$languages item=language}
														<a role="menuitem" href="{$link->getLanguageLink($language.id_lang, null, null, null, $language.language_code)|escape:'html':'UTF-8'}" class="fe-nav-dropdown__item{if $language.id_lang == $cookie->id_lang} is-active{/if}">
															<span>{$language.name}</span>
															<code>{$language.language_code|strtoupper}</code>
														</a>
													{/foreach}
												{/if}
											</div>
										</div>
										<span class="fe-nav-utility__divider" aria-hidden="true"></span>
										{if isset($cookie) && $cookie->isLogged()}
											<a class="fe-nav-utility__link" href="{$link->getPageLink('my-account', true)}">{l s='My account'}</a>
											<a class="fe-nav-utility__link" href="{$link->getPageLink('index', true)}?mylogout">{l s='Sign out'}</a>
										{else}
											<a class="fe-nav-utility__link" href="{$link->getModuleLink('fewokeycloak', 'customerlogin')|escape:'html':'UTF-8'}">{l s='Sign in'}</a>
											<a class="fe-nav-utility__link" href="{$link->getModuleLink('fewokeycloak', 'customerregister')|escape:'html':'UTF-8'}">{l s='Register'}</a>
										{/if}
										<a class="fe-nav-utility__link fe-nav-cart" href="{$link->getPageLink('order-opc', true)|escape:'html':'UTF-8'}">
											<svg width="14" height="15" viewBox="0 0 15 16" fill="none" aria-hidden="true"><path d="M1 3.2h2.1l1.8 8.3h7.2l1.6-6H4.3" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="6.2" cy="14" r="1.1" fill="currentColor"/><circle cx="11.4" cy="14" r="1.1" fill="currentColor"/></svg>
											<span class="fe-nav-cart__count ajax_cart_quantity{if !$cart_qties || $cart_qties == 0} unvisible{/if}">{if isset($cart_qties)}{$cart_qties|intval}{else}0{/if}</span>
											<span class="fe-nav-cart__count ajax_cart_no_product{if $cart_qties && $cart_qties > 0} unvisible{/if}">0</span>
										</a>
									</div>
								</div>
							</div>
							<div class="fe-nav-main">
								<div class="fe-nav-main__inner">
									<a href="{if isset($force_ssl) && $force_ssl}{$base_dir_ssl}{else}{$base_dir}{/if}" title="{$shop_name|escape:'html':'UTF-8'}" class="fe-nav-brand">
										<img class="fe-nav-brand__mark" src="{$img_dir}brand/logo-mark-color.svg?v=1" alt="{$shop_name|escape:'html':'UTF-8'}" width="42" height="42"/>
										<span class="fe-nav-brand__text">
											<span class="fe-nav-brand__sub">FERIENWOHNUNG</span>
											<span class="fe-nav-brand__name">LAUSCHA</span>
										</span>
									</a>
									<button type="button" class="fe-nav-burger" aria-label="{l s='Menu'}" data-fe-toggle="mobile-nav">
										<span></span><span></span><span></span>
									</button>
									<nav class="fe-nav-items" id="fe-mobile-nav" aria-label="{l s='Main navigation'}">
										<a href="{$link->getPageLink('index')|escape:'html':'UTF-8'}" class="fe-nav-item{if $page_name == 'index'} is-active{/if}">{l s='Home'}</a>
										<a href="{$link->getPageLink('index')|escape:'html':'UTF-8'}#hotelInteriorBlock" class="fe-nav-item">{l s='The apartment'}</a>
										<a href="{$link->getPageLink('contact', true)|escape:'html':'UTF-8'}" class="fe-nav-item{if $page_name == 'contact'} is-active{/if}">{l s='Contact Us'}</a>
										<a href="{$link->getCMSLink(10)|escape:'html':'UTF-8'}" class="fe-nav-item{if $smarty.server.REQUEST_URI|strstr:'getting-here'} is-active{/if}">{l s='Getting Here'}</a>
										<a href="{$link->getCMSLink(9)|escape:'html':'UTF-8'}" class="fe-nav-item{if $smarty.server.REQUEST_URI|strstr:'discover-lauscha'} is-active{/if}">{l s='Discover Lauscha'}</a>
										<a href="{$link->getPageLink('index')|escape:'html':'UTF-8'}#search_hotel_block" class="fe-nav-cta">{l s='Check availability'}</a>
									</nav>
								</div>
							</div>
						</div>
					{/block}
					{block name='header_top'}
						<div class="header-top">
							<div class="container">
								<div class="row">
									<div class="col-xs-12">
										<div class="header-top-menu">
											{block name='displayTop'}
												{if isset($HOOK_TOP)}{$HOOK_TOP}{/if}
											{/block}
											{if isset($WK_DISPLAY_PROPERTIES_LINK_IN_HEADER) && $WK_DISPLAY_PROPERTIES_LINK_IN_HEADER}
												<div>
													<a href="{$link->getPageLink('our-properties')}" class="our_properties_link">{l s='Our Properties'}</a>
												</div>
											{/if}
										</div>
									</div>
								</div>
								{block name='displaySearchHotelPanel'}
									{hook h='displaySearchHotelPanel'}
								{/block}
							</div>
						</div>
					{/block}
					{block name='displayAfterHookTop'}
						{hook h='displayAfterHookTop'}
					{/block}
				</header>
			</div>
			<div class="columns-container">
				<div id="columns" class="container">
					{if $show_breadcrump}
						{block name='breadcrumb'}
							{include file="$tpl_dir./breadcrumb.tpl"}
						{/block}
					{/if}
					<div id="slider_row" class="row">
						<div id="top_column" class="center_column col-xs-12 col-sm-12">{hook h="displayTopColumn"}</div>
					</div>
					<div class="row">
						{if isset($left_column_size) && !empty($left_column_size)}
						<div id="left_column" class="column col-xs-12 col-sm-{$left_column_size|intval}">{$HOOK_LEFT_COLUMN}</div>
						{/if}
						{if isset($left_column_size) && isset($right_column_size)}{assign var='cols' value=(12 - $left_column_size - $right_column_size)}{else}{assign var='cols' value=12}{/if}
						<div id="center_column" class="center_column col-xs-12 col-sm-{$cols|intval}">
	{/if}
