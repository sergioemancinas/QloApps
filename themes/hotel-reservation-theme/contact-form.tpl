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

{block name='contact_form'}
	{if isset($smarty.get.confirm)}
		<p class="alert alert-success fe-contact-success">{l s='Your message has been successfully sent to our team.'}</p>
	{/if}
	{block name='errors'}
		{include file="$tpl_dir./errors.tpl"}
	{/block}
	{if $lang_iso == 'de'}
		{assign var=feHeroTitle value='So erreichen Sie uns'}
		{assign var=feHeroDesc value='Fragen zu Ihrem Aufenthalt oder besondere Wünsche? Wir helfen Ihnen gerne weiter.'}
		{assign var=feCardTitle value='FeWo Lauscha'}
		{assign var=feCardMeta value='Ihr Rückzugsort im Thüringer Wald'}
		{assign var=feCardAddress value='Steinachtal 1, 98724 Lauscha, Deutschland'}
		{assign var=feFormTitle value='Schreiben Sie uns'}
		{assign var=feFormNote value='Wir antworten in der Regel innerhalb von 24 Stunden.'}
		{assign var=feWaText value='Per WhatsApp schreiben'}
		{assign var=feWaAria value='Per WhatsApp an uns schreiben'}
		{assign var=feMapTitle value='So finden Sie uns'}
	{else}
		{assign var=feHeroTitle value='Get in touch'}
		{assign var=feHeroDesc value='Have a question about your stay or want to share special requests? We are here to help.'}
		{assign var=feCardTitle value='FeWo Lauscha'}
		{assign var=feCardMeta value='Your retreat in the Thuringian Forest'}
		{assign var=feCardAddress value='Steinachtal 1, 98724 Lauscha, Germany'}
		{assign var=feFormTitle value='Send us a message'}
		{assign var=feFormNote value='We typically respond within 24 hours.'}
		{assign var=feWaText value='Chat on WhatsApp'}
		{assign var=feWaAria value='Contact us via WhatsApp'}
		{assign var=feMapTitle value='Find us on the map'}
	{/if}
	{assign var=feWaNumber value=Configuration::get('FEWO_WHATSAPP_NUMBER')}
	{if !$feWaNumber}{assign var=feWaNumber value='4917612345678'}{* PLACEHOLDER: set real number via scripts/update_contact.sql *}{/if}
	<div class="margin-top-50 htl-contact-page fe-contact-page-v2">
		<div class="row">
			<div class="col-sm-offset-2 col-sm-8 fe-contact-hero">
				<p class="contact-header">{$feHeroTitle}</p>
				<p class="contact-desc">{$feHeroDesc}</p>
			</div>
		</div>
		<div class="row margin-top-50">
			<div class="col-sm-5 col-md-4">
				{block name='contact_form_info'}
					<div class="htl-global-address-div col-sm-12 fe-contact-card fe-contact-info-card">
						<div class="fe-contact-info-header">
							<span class="fe-contact-info-icon"><i class="icon-home"></i></span>
							<div>
								<p class="fe-contact-card-title">{$feCardTitle}</p>
								<p class="fe-contact-meta">{$feCardMeta}</p>
							</div>
						</div>
						<ul class="fe-contact-list">
							<li class="fe-contact-item">
								<span class="fe-contact-icon"><i class="icon-map-marker"></i></span>
								<div>
									<span class="fe-contact-label">{l s='Address'}</span>
									<span class="fe-contact-value">{$feCardAddress}</span>
								</div>
							</li>
							<li class="fe-contact-item">
								<span class="fe-contact-icon"><i class="icon-phone"></i></span>
								<div>
									<span class="fe-contact-label">{l s='Phone'}</span>
									<span class="fe-contact-value"><a href="tel:+493670222944">+49 36702 22944</a></span>
								</div>
							</li>
							<li class="fe-contact-item">
								<span class="fe-contact-icon"><i class="icon-envelope"></i></span>
								<div>
									<span class="fe-contact-label">{l s='Email'}</span>
									<span class="fe-contact-value"><a href="mailto:info@fewolauscha.de">info@fewolauscha.de</a></span>
								</div>
							</li>
						</ul>
						<div class="fe-contact-tip">
							<i class="icon-lightbulb-o"></i>
							<span>{l s='For the fastest response, include your travel dates and booking number if you have one.'}</span>
						</div>
						<a class="fe-wa-btn fe-wa-inline" href="https://wa.me/{$feWaNumber}?text={if $lang_iso == 'de'}Hallo%20FeWo%20Lauscha%2C%20ich%20h%C3%A4tte%20eine%20Frage%20zu%20einem%20Aufenthalt.{else}Hello%20FeWo%20Lauscha%2C%20I%20have%20a%20question%20about%20a%20stay.{/if}" target="_blank" rel="noopener" aria-label="{$feWaAria}">
							<i class="icon-whatsapp"></i>
							<span>{$feWaText}</span>
						</a>
					</div>
				{/block}
			</div>
			<div class="col-sm-7 col-md-8">
			{block name='contact_form_content'}
				{if isset($customerThread.token)}
					<form action="{$link->getPageLink('contact', null, null, array('token' => $customerThread.token))}" method="post" class="contact-form-box fe-contact-card fe-contact-form-card" enctype="multipart/form-data">
				{else}
					<form action="{$link->getPageLink('contact')}" method="post" class="contact-form-box fe-contact-card fe-contact-form-card" enctype="multipart/form-data">
				{/if}
					<p class="fe-contact-section-title">{$feFormTitle}</p>
					<p class="fe-contact-section-note">{$feFormNote}</p>
					<div class="row fe-contact-grid">
						{if isset($displayContactName) && $displayContactName}
							<div class="form-group col-sm-6">
								<label for="user_name" class="control-label">
									{l s='Your name'}{if isset($contactNameRequired) && $contactNameRequired} <span class="fe-required">*</span>{/if}
								</label>
								<input class="form-control contact_input fe-input" type="text" id="user_name" name="user_name" placeholder="{l s='Enter your name'}" value="{if isset($smarty.post.user_name)}{$smarty.post.user_name}{elseif isset($customerThread.user_name)}{$customerThread.user_name|escape:'html':'UTF-8'}{elseif isset($customerName)}{$customerName}{/if}" {if isset($customerThread.user_name)} readonly{/if}/>
							</div>
						{/if}
						<div class="form-group col-sm-6">
							<label for="Email" class="control-label">
								{l s='Email address'} <span class="fe-required">*</span>
							</label>
							{if isset($customerThread.email)}
								<input class="form-control contact_input fe-input" type="email" id="email" name="from" value="{if isset($customerThread.email)}{$customerThread.email|escape:'html':'UTF-8'}" readonly="readonly"{/if} />
							{else}
								<input class="form-control contact_input validate fe-input" type="email" id="email" name="from" data-validate="isEmail" placeholder="{l s='your@email.com'}" value="{if isset($smarty.post.email)}{$smarty.post.email}{else}{$email|escape:'html':'UTF-8'}{/if}" />
							{/if}
						</div>
						{if isset($displayContactPhone) && $displayContactPhone}
							<div class="form-group col-sm-6">
								<label for="phone" class="control-label">
									{l s='Phone number'}{if isset($contactPhoneRequired) && $contactPhoneRequired} <span class="fe-required">*</span>{/if}
								</label>
								<input class="form-control contact_input fe-input" type="text" id="phone" name="phone" placeholder="{l s='+49 123 456789'}" value="{if isset($smarty.post.phone)}{$smarty.post.phone}{else if isset($customerThread.phone)}{$customerThread.phone|escape:'html':'UTF-8'}{elseif isset($customerPhone)}{$customerPhone}{/if}" {if isset($customerThread.phone)}readonly="readonly"{/if}/>
							</div>
						{/if}
						<div class="form-group col-sm-6">
							<label for="subject" class="control-label">
								{l s='Subject'} <span class="fe-required">*</span>
							</label>
							<input class="form-control contact_input fe-input" type="text" id="subject" name="subject" placeholder="{l s='What is your enquiry about?'}" value="{if isset($smarty.post.subject)}{$smarty.post.subject}{else if isset($customerThread.subject)}{$customerThread.subject|escape:'html':'UTF-8'}{/if}" {if isset($customerThread.subject)}readonly="readonly"{/if}/>
						</div>
						{if !isset($customerThread.id_contact) && isset($allowContactSelection) && $allowContactSelection}
							<div class="form-group col-sm-6">
								<label for="message" class="control-label">
									{l s='Topic'} <span class="fe-required">*</span>
								</label>
								<div class="dropdown">
									<button class="form-control contact_type_input fe-input" type="button" data-toggle="dropdown">
										<span id="contact_type" class="pull-left">{l s='Select a topic'}</span>
										<input type="hidden" id="id_contact" name="id_contact" value="0">
										<span class="arrow_span">
											<i class="icon icon-angle-down"></i>
										</span>
									</button>
									<ul class="dropdown-menu contact_type_ul">
										{foreach from=$contacts item=contact}
											<li value="{$contact.id_contact|intval}"{if isset($smarty.request.id_contact) && $smarty.request.id_contact == $contact.id_contact} selected="selected"{/if}>{$contact.name|escape:'html':'UTF-8'}
											</li>
										{/foreach}
									</ul>
								</div>
							</div>
						{elseif isset($customerThread.id_contact) && isset($allowContactSelection) && $allowContactSelection}
							<input type="hidden" id="id_contact" name="id_contact" value="{$customerThread.id_contact|escape:'html':'UTF-8'}"/>
						{/if}
						<div class="form-group col-sm-12">
							<label for="message" class="control-label">
								{l s='Your message'} <span class="fe-required">*</span>
							</label>
							<textarea class="form-control contact_textarea fe-textarea" id="message" name="message" placeholder="{l s='Tell us about your enquiry, travel dates, number of guests...'}">{if isset($message)}{$message|escape:'html':'UTF-8'|stripslashes}{/if}</textarea>
						</div>
						{if $fileupload == 1}
							<div class="form-group col-sm-12">
								<label for="fileUpload" class="control-label">
									{l s='Attachment'} <span class="fe-optional">({l s='optional'})</span>
								</label>
								<input type="hidden" name="MAX_FILE_SIZE" value="{if isset($max_upload_size) && $max_upload_size}{$max_upload_size|intval}{else}2000000{/if}" />
								<input type="file" name="fileUpload" id="fileUpload" class="form-control fe-file-input" />
							</div>
						{/if}
					</div>
					<div class="fe-contact-footer">
						<div class="fe-contact-privacy">
							<i class="icon-lock"></i>
							<span>{l s='Your information is secure and will only be used to respond to your enquiry.'}</span>
						</div>
						{hook h='displayGDPRConsent' moduleName='contactform'}
						{hook h='displayContactFormFieldsAfter'}
						<div class="fe-contact-submit">
							<input type="text" name="url" value="" class="hidden" />
							<input type="hidden" name="contactKey" value="{$contactKey}" />
							<button class="btn button button-medium contact_btn fe-submit-btn" type="submit" name="submitMessage" id="submitMessage">
								<i class="icon-paper-plane"></i>
								<span>{l s='Send message'}</span>
							</button>
						</div>
					</div>
				</form>
				{/block}
			</div>
		</div>
		<div class="row margin-top-50 fe-contact-map-row">
			<div class="col-sm-12">
				<div class="fe-contact-card fe-contact-map-card">
					<p class="fe-contact-section-title">{$feMapTitle}</p>
					<iframe class="fe-contact-map" title="{$feMapTitle}" src="https://www.openstreetmap.org/export/embed.html?bbox=11.108537%2C50.468244%2C11.158537%2C50.488244&amp;layer=mapnik&amp;marker=50.478244%2C11.133537" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
					<a class="fe-map-link" href="https://www.openstreetmap.org/?mlat=50.478244&amp;mlon=11.133537#map=15/50.478244/11.133537" target="_blank" rel="noopener">{if $lang_iso == 'de'}Größere Karte öffnen{else}Open larger map{/if}</a>
				</div>
			</div>
		</div>
		<div style="clear:both;"></div>
	</div>

	{block name='contact_form_js_vars'}
		{strip}
			{addJsDefL name='contact_fileDefaultHtml'}{l s='No file selected' js=1}{/addJsDefL}
			{addJsDefL name='contact_fileButtonHtml'}{l s='Choose File' js=1}{/addJsDefL}
			{addJsDefL name='contact_map_get_dirs'}{l s='Get Directions' js=1}{/addJsDefL}
		{/strip}
		{if isset($hotelLocationArray)}
			{strip}
				{addJsDef hotelLocationArray = $hotelLocationArray}
			{/strip}
		{else}
			{strip}
				{addJsDef hotelLocationArray = 0}
			{/strip}
		{/if}
	{/block}
{/block}
