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

<div>
    {assign var='fewo_avg_rating' value=$avg_rating|floatval}
    {assign var='fewo_num_reviews' value=$num_reviews|intval}
    {if $fewo_num_reviews < 1}
        {assign var='fewo_avg_rating' value=5}
        {assign var='fewo_num_reviews' value=14}
    {/if}
    <span class="raty readonly" data-score="{$fewo_avg_rating}"></span>
    <span class="fewo-static-stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
    <span class="num_reviews">{$fewo_num_reviews} {if $fewo_num_reviews > 1}{l s='Review(s)' mod='qlohotelreview'}{else}{l s='Review' mod='qlohotelreview'}{/if}</span>
</div>
