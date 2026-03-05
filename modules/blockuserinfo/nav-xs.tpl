{**
* NOTICE OF LICENSE
*
* This source file is subject to the Open Software License version 3.0
* that is bundled with this package in the file LICENSE.md
* It is also available through the world-wide-web at this URL:
* https://opensource.org/license/osl-3-0-php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to support@qloapps.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade this module to a newer
* versions in the future. If you wish to customize this module for your needs
* please refer to https://store.webkul.com/customisation-guidelines for more information.
*
* @author Webkul IN
* @copyright Since 2010 Webkul
* @license https://opensource.org/license/osl-3-0-php Open Software License version 3.0
*}

<ul class="nav nav-pills nav-stacked visible-xs wk-nav-style">
	{assign var='fewo_keycloak_login_url' value='https://fewolauscha.de/auth/realms/fewo/protocol/openid-connect/auth?client_id=qloapps-customer&response_type=code&scope=openid%20email%20profile&redirect_uri=https%3A%2F%2Ffewolauscha.de%2Fen%2Fmodule%2Ffewokeycloak%2Fcustomercallback'}
	{assign var='fewo_keycloak_register_url' value='https://fewolauscha.de/auth/realms/fewo/protocol/openid-connect/registrations?client_id=qloapps-customer&redirect_uri=https%3A%2F%2Ffewolauscha.de%2Fen%2Fmodule%2Ffewokeycloak%2Fcustomercallback&response_type=code&scope=openid%20email%20profile'}
	{if $logged}
		<li>
			<a class="navigation-link" href="{$link->getPageLink('history', true)|escape:'html'}" title="{l s='Bookings' mod='blockuserinfo'}">{l s='Bookings' mod='blockuserinfo'}</a>
		</li>
		<li>
			<a class="navigation-link" href="{$link->getPageLink('my-account', true)|escape:'html'}" title="{l s='View my customer account' mod='blockuserinfo'}">{l s='Accounts Settings' mod='blockuserinfo'}</a>
		</li>
		<li>
			<a class="navigation-link" href="{$link->getPageLink('index', true, NULL, "mylogout=1&token={$static_token}")|escape:'html':'UTF-8'}"  title="{l s='Log me out' mod='blockuserinfo'}">{l s='Sign Out' mod='blockuserinfo'}</a>
		</li>
	{else}
		<li>
			<a class="navigation-link" href="{$fewo_keycloak_login_url}" rel="nofollow" title="{l s='Log in to your customer account' mod='blockuserinfo'}">{l s='Sign in' mod='blockuserinfo'}</a>
		</li>
		<li>
			<a class="navigation-link" href="{$fewo_keycloak_register_url|escape:'html':'UTF-8'}" rel="nofollow" title="{l s='Create an account' mod='blockuserinfo'}">{l s='Register' mod='blockuserinfo'}</a>
		</li>
	{/if}
</ul>
