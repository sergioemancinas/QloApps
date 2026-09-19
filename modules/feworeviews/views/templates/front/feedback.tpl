{extends file=$layout}

{block name='content'}
<div class="fewo-feedback-page">
	<div class="container">
		<div class="fe-feedback-card">
			<h1 class="fe-feedback-title">{l s='How was your stay?' mod='feworeviews'}</h1>

			{if $fewo_submitted}
				<div class="alert alert-success">
					<p>{l s='Thank you — your feedback has been received. We read every comment.' mod='feworeviews'}</p>
					<p><a href="{$base_dir}" class="btn btn-default">{l s='Back to the apartment page' mod='feworeviews'}</a></p>
				</div>
			{else}
				{if $fewo_token !== '' && !$fewo_token_valid}
					<div class="alert alert-warning">
						{l s='This feedback link is no longer valid. You can still leave general feedback below.' mod='feworeviews'}
					</div>
				{/if}

				{if $fewo_error}
					<div class="alert alert-danger">{$fewo_error|escape:'html':'UTF-8'}</div>
				{/if}

				<p class="fe-feedback-sub">
					{l s='Your review helps other guests find us — and helps us make the apartment better. Reviews appear on our website after a short check.' mod='feworeviews'}
				</p>

				<form method="post" action="" id="fewo-feedback-form" class="fe-feedback-form">
					{* Honeypot — humans never see this field *}
					<div style="position:absolute; left:-9999px;" aria-hidden="true">
						<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
					</div>

					<input type="hidden" name="token" value="{$fewo_token|escape:'html':'UTF-8'}" />

					<div class="form-group">
						<label for="fw-rating">{l s='Your rating' mod='feworeviews'} *</label>
						<select name="rating" id="fw-rating" class="form-control" required>
							<option value="">{l s='Choose…' mod='feworeviews'}</option>
							<option value="5" {if isset($fewo_form.rating) && $fewo_form.rating == 5}selected{/if}>★★★★★ {l s='Wonderful' mod='feworeviews'}</option>
							<option value="4" {if isset($fewo_form.rating) && $fewo_form.rating == 4}selected{/if}>★★★★ {l s='Great' mod='feworeviews'}</option>
							<option value="3" {if isset($fewo_form.rating) && $fewo_form.rating == 3}selected{/if}>★★★ {l s='Good' mod='feworeviews'}</option>
							<option value="2" {if isset($fewo_form.rating) && $fewo_form.rating == 2}selected{/if}>★★ {l s='Needs improvement' mod='feworeviews'}</option>
							<option value="1" {if isset($fewo_form.rating) && $fewo_form.rating == 1}selected{/if}>★ {l s='Poor' mod='feworeviews'}</option>
						</select>
					</div>

					<div class="row">
						<div class="form-group col-sm-6">
							<label for="fw-name">{l s='Name (shown with your review)' mod='feworeviews'} *</label>
							<input type="text" class="form-control" id="fw-name" name="author_name" required maxlength="96"
								value="{if isset($fewo_form.author_name)}{$fewo_form.author_name|escape:'html':'UTF-8'}{/if}" />
						</div>
						<div class="form-group col-sm-6">
							<label for="fw-email">{l s='Email (optional, never published)' mod='feworeviews'}</label>
							<input type="email" class="form-control" id="fw-email" name="author_email" maxlength="128"
								value="{if isset($fewo_form.author_email)}{$fewo_form.author_email|escape:'html':'UTF-8'}{elseif $fewo_stay}{$fewo_stay.author_email|escape:'html':'UTF-8'}{/if}" />
						</div>
					</div>

					<div class="form-group">
						<label for="fw-title">{l s='Headline (optional)' mod='feworeviews'}</label>
						<input type="text" class="form-control" id="fw-title" name="title" maxlength="128"
							value="{if isset($fewo_form.title)}{$fewo_form.title|escape:'html':'UTF-8'}{/if}" />
					</div>

					<div class="form-group">
						<label for="fw-body">{l s='Your review' mod='feworeviews'} *</label>
						<textarea class="form-control" id="fw-body" name="body" rows="6" required
							>{if isset($fewo_form.body)}{$fewo_form.body|escape:'html':'UTF-8'}{/if}</textarea>
					</div>

					<button type="submit" class="btn btn-primary">{l s='Send review' mod='feworeviews'}</button>
				</form>
			{/if}
		</div>
	</div>
</div>
{/block}
