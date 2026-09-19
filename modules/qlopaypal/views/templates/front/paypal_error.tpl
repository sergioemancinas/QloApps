{*
 * PayPal payment error page.
*}

<div id="qlopaypal-error">
    <h2>{l s='PayPal payment could not be completed' mod='qlopaypal'}</h2>
    {if $err_name || $err_msg}
        <p class="warning">
            {if $err_name}{$err_name}{/if}
            {if $err_name && $err_msg} &mdash; {/if}
            {if $err_msg}{$err_msg}{/if}
        </p>
    {/if}
    <p>
        <a href="{$link->getPageLink('order-opc', true)|escape:'html'}">
            {l s='Back to checkout' mod='qlopaypal'}
        </a>
    </p>
</div>
