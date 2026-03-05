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

<div class="row">
    <section class="col-xs-12 col-sm-12">
        <div class="row margin-lr-0 footer-section-heading">
            <p>{l s='Get in touch' mod='blocksocial'}</p>
            <hr/>
        </div>
        <div class="row margin-lr-0 fe-footer-contact">
            <a class="btn btn-default fe-footer-contact-btn" href="{$link->getPageLink('contact', true)|escape:'html':'UTF-8'}">
                {l s='Contact us' mod='blocksocial'}
            </a>
            <p class="fe-footer-contact-text">{l s='Have questions about your stay? We reply quickly by email.' mod='blocksocial'}</p>
            <a class="btn btn-link fe-cookie-open" href="#">{l s='Privacy settings' mod='blocksocial'}</a>
        </div>
    </section>
</div>
