{*
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

<div class="row">
	<section class="col-xs-12 col-sm-12">
		<div class="row margin-lr-0 footer-section-heading">
			<p>{l s='payment accepted' mod='wkfooterpaymentblock'}</p>
			<hr/>
		</div>
		<div class="row margin-lr-0 footer-payment-block">
			{if isset($allPaymentBlocks) && $allPaymentBlocks}
				{assign var='hasStripe' value=0}
				{foreach $allPaymentBlocks as $paymentBlock}
					{if isset($paymentBlock['id_payment_block']) && $paymentBlock['id_payment_block']|intval == 5}
						{assign var='hasStripe' value=1}
					{/if}
					<img
						src="{$link->getMediaLink("`$module_dir`views/img/payment_img/`$paymentBlock['id_payment_block']`.jpg")}"
						alt="{$paymentBlock['name']|escape:'html':'UTF-8'}"
						onerror="this.style.display='none'; if (this.nextElementSibling) { this.nextElementSibling.style.display='inline-flex'; }"
					>
					<span class="fe-payment-fallback">{$paymentBlock['name']|escape:'html':'UTF-8'}</span>
				{/foreach}
				{if !$hasStripe}
					<span class="fe-footer-stripe-fallback"><i class="icon-cc-stripe"></i> Stripe</span>
				{/if}
			{/if}
		</div>
	</section>
</div>
