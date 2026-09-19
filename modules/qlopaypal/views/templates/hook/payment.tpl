{*
 * PayPal Smart Buttons rendered on the checkout payment step.
 * Approve client-side, capture server-side.
*}

<div id="qlopaypal-button-container"></div>

<div id="qlopaypal-overlay" style="display:none;">
    {l s='Please wait...' mod='qlopaypal'}
</div>

<script>
    (function () {
        function postJson(url, payload) {
            return fetch(url, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(function (res) {
                return res.json();
            });
        }

        paypal.Buttons({
            style: {
                layout: 'vertical',
                shape: 'rect',
                color: 'gold'
            },
            createOrder: function () {
                return postJson(qlopaypal_create_order, {}).then(function (data) {
                    if (!data.success) {
                        throw new Error(data.message || 'Could not create PayPal order');
                    }
                    return data.orderID;
                });
            },
            onApprove: function (data) {
                document.getElementById('qlopaypal-overlay').style.display = 'block';

                return postJson(qlopaypal_capture_order, { orderID: data.orderID })
                    .then(function (result) {
                        if (result.success && result.redirect) {
                            window.location.href = result.redirect;
                            return;
                        }
                        if (result.message) {
                            window.location.href = qlopaypal_error_url
                                + '?err_name=PAYMENT_ERROR&err_msg=' + encodeURIComponent(result.message);
                        }
                    })
                    .catch(function (err) {
                        window.location.href = qlopaypal_error_url
                            + '?err_name=PAYMENT_ERROR&err_msg=' + encodeURIComponent(err.message);
                    });
            },
            onCancel: function () {
                window.location.href = qlopaypal_cancel_url;
            },
            onError: function (err) {
                window.location.href = qlopaypal_error_url
                    + '?err_name=PAYMENT_ERROR&err_msg=' + encodeURIComponent(err && err.message ? err.message : 'Unexpected error');
            }
        }).render('#qlopaypal-button-container');
    })();
</script>
