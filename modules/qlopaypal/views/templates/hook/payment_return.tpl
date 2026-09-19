{*
 * Payment confirmation block shown after a successful PayPal payment.
*}

{if $status == 1}
    <p class="cheque_indent">
        <strong>{l s='Your PayPal payment was accepted.' mod='qlopaypal'}</strong>
        <br /><br />
        {l s='Paid amount:' mod='qlopaypal'} {$total_to_pay}
        <br /><br />
        <a href="{$link->getPageLink('history', true)|escape:'html'}">{l s='View your bookings and order history.' mod='qlopaypal'}</a>
    </p>
{else}
    <p class="warning">
        {l s='We noticed a problem with your payment. Please contact us if you have any questions.' mod='qlopaypal'}
    </p>
{/if}
