{if isset($fewo_reviews) && $fewo_reviews}
<div class="fe-reviews" id="gaestestimmen">
	<div class="container">
		<h3 class="fe-reviews-title">{l s='What our guests say' mod='feworeviews'}</h3>
		<div class="fe-reviews-grid">
			{foreach from=$fewo_reviews item=review}
				<figure class="fe-review-card">
					<div class="fe-review-stars" aria-label="{$review.rating}/5">
						{section name=star loop=5}
							{if $smarty.section.star.index < $review.rating}★{else}☆{/if}
						{/section}
					</div>
					{if $review.title}<figcaption class="fe-review-heading">{$review.title|escape:'html':'UTF-8'}</figcaption>{/if}
					<blockquote class="fe-review-body">{$review.body|escape:'html':'UTF-8'|nl2br}</blockquote>
					<p class="fe-review-meta">
						{$review.author_name|escape:'html':'UTF-8'}
						{if $review.source == 'airbnb'} · Airbnb{/if}
						{if $review.source == 'booking'} · Booking.com{/if}
					</p>
				</figure>
			{/foreach}
		</div>
		<div class="fe-reviews-actions">
			<a class="btn btn-default" href="{$link->getModuleLink('feworeviews', 'feedback')}">{l s='Leave your own review' mod='feworeviews'}</a>
		</div>
	</div>
</div>
{/if}
