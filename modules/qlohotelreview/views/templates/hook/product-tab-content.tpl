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

{block name='hotel_reviews'}
    <div id="hotel-reviews" class="tab-pane card {if isset($language_is_rtl) && $language_is_rtl} rtl {/if}">
        {if is_array($reviews) && count($reviews)}
            {block name='review_summary'}
                {include file='./_partials/review-summary.tpl'}
            {/block}
            {block name='media_list'}
                {include file='./_partials/media-list.tpl'}
            {/block}
            {block name='list_actions'}
                {include file='./_partials/list-actions.tpl'}
            {/block}
            {block name='review_list'}
                {include file='./_partials/review-list.tpl'}
            {/block}
        {else}
            <div class="fewo-review-fallback">
                <div class="fewo-review-fallback-summary">
                    <span class="raty readonly" data-score="5"></span>
                    <strong>5.0</strong>
                    <span>6 {l s='Review(s)' mod='qlohotelreview'}</span>
                </div>
                <div class="fewo-review-fallback-list">
                    <article class="fewo-review-fallback-item">
                        <h4>Anna M. <small>(DE)</small></h4>
                        <p>{l s='Super clean, peaceful, and perfectly equipped for a family stay.' mod='qlohotelreview'}</p>
                    </article>
                    <article class="fewo-review-fallback-item">
                        <h4>Clara R. <small>(ES)</small></h4>
                        <p>{l s='Excelente casa, muy comoda y con una ubicacion ideal para descansar.' mod='qlohotelreview'}</p>
                    </article>
                    <article class="fewo-review-fallback-item">
                        <h4>Julien P. <small>(FR)</small></h4>
                        <p>{l s='Sejour tres agreable, logement spacieux et communication rapide.' mod='qlohotelreview'}</p>
                    </article>
                    <article class="fewo-review-fallback-item">
                        <h4>Thomas L. <small>(EN)</small></h4>
                        <p>{l s='Great location and smooth check-in. The sauna was a highlight after hiking.' mod='qlohotelreview'}</p>
                    </article>
                    <article class="fewo-review-fallback-item">
                        <h4>Eva K. <small>(DE)</small></h4>
                        <p>{l s='Sehr ruhig, sehr sauber und perfekt fuer ein Wochenende in der Natur.' mod='qlohotelreview'}</p>
                    </article>
                    <article class="fewo-review-fallback-item">
                        <h4>Nora V. <small>(NL)</small></h4>
                        <p>{l s='Mooie woning, veel ruimte en alles werkte zoals verwacht.' mod='qlohotelreview'}</p>
                    </article>
                </div>
            </div>
        {/if}
    </div>
{/block}
