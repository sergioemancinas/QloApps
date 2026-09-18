{*
* FeWo Lauscha footer copyright override.
* Avoid duplicate years when launch year equals the current year.
*}
{assign var='fe_current_year' value=$smarty.now|date_format:'%Y'}
{assign var='fe_start_year' value=2026}
{if isset($WK_HTL_ESTABLISHMENT_YEAR) && $WK_HTL_ESTABLISHMENT_YEAR|intval > 0}
    {assign var='fe_start_year' value=$WK_HTL_ESTABLISHMENT_YEAR|intval}
{/if}
{if $fe_start_year == $fe_current_year}
    {assign var='fe_year_label' value=$fe_current_year}
{else}
    {assign var='fe_year_label' value="{$fe_start_year}-{$fe_current_year}"}
{/if}
{assign var='fe_shop_name' value='Fewo Lauscha'}
{if isset($WK_HTL_CHAIN_NAME) && $WK_HTL_CHAIN_NAME}
    {assign var='fe_shop_name' value=$WK_HTL_CHAIN_NAME}
{elseif isset($shop_name) && $shop_name}
    {assign var='fe_shop_name' value=$shop_name}
{/if}
<p class="copyRight">
    &copy; {$fe_year_label|escape:'html':'UTF-8'}&nbsp;
    <a href="{$urls.base_url|escape:'html':'UTF-8'}">&nbsp;{$fe_shop_name|escape:'html':'UTF-8'}</a>.&nbsp;
    {l s='All rights reserved.' mod='hotelreservationsystem'}
</p>
