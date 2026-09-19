<?php
/**
 * Front controller: server-side PayPal order creation and capture.
 *
 * Amounts are always recomputed from the QloApps cart server-side.
 * The client may never influence the amount. Capture is idempotent.
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class QloPaypalPaymentModuleFrontController extends ModuleFrontController
{
    public function init()
    {
        parent::init();

        $cart = $this->context->cart;

        if (!$cart || $cart->id_customer == 0 || !$this->module->active) {
            Tools::redirect($this->context->link->getPageLink('order-opc', true, null));
        }

        $authorized = false;
        foreach (Module::getPaymentModules() as $module) {
            if ($module['name'] == 'qlopaypal') {
                $authorized = true;
                break;
            }
        }

        if (!$authorized) {
            die($this->module->l('This payment method is not available.', 'payment'));
        }

        if (!Validate::isLoadedObject(new Customer($cart->id_customer))) {
            Tools::redirect($this->context->link->getPageLink('order-opc', true, null));
        }
    }

    public function initContent()
    {
        parent::initContent();

        header('Content-Type: application/json');

        $action = Tools::getValue('action');

        if ($action === 'create') {
            $this->createPaypalOrder();
        } elseif ($action === 'capture') {
            $this->capturePaypalOrder();
        } elseif ($action === 'cancel') {
            QloPaypalHelper::log('payment', 'Payment cancelled by customer, cart ID: '.(int) $this->context->cart->id);
            die(Tools::jsonEncode(array('success' => false, 'redirect' => $this->context->link->getPageLink('order-opc', true))));
        }

        die(Tools::jsonEncode(array('success' => false, 'message' => 'Unknown action')));
    }

    private function createPaypalOrder()
    {
        $cart = $this->context->cart;

        if (!$this->module->checkCurrency($cart) || !$this->module->checkPaypalConfigured()) {
            QloPaypalHelper::log('payment', 'Create order rejected: currency/config check failed');
            die(Tools::jsonEncode(array('success' => false, 'message' => 'PayPal is not available for this cart')));
        }

        $orderData = $this->buildOrderData($cart);

        QloPaypalHelper::log('payment', 'Creating PayPal order for cart ID: '.(int) $cart->id);

        $response = QloPaypalHelper::createOrder($orderData);

        if ($response['success'] && isset($response['data']['id'])) {
            QloPaypalHelper::log('payment', 'PayPal order created: '.$response['data']['id']);
            die(Tools::jsonEncode(array('success' => true, 'orderID' => $response['data']['id'])));
        }

        QloPaypalHelper::log('payment', 'Create order failed: '.$response['message']);
        die(Tools::jsonEncode(array('success' => false, 'message' => $response['message'])));
    }

    private function capturePaypalOrder()
    {
        $cart = $this->context->cart;
        $rawBody = Tools::file_get_contents('php://input');
        $body = Tools::jsonDecode($rawBody, true);

        if (!is_array($body) || empty($body['orderID']) || !is_string($body['orderID'])) {
            die(Tools::jsonEncode(array('success' => false, 'message' => 'Invalid request')));
        }

        $ppOrderId = Tools::substr($body['orderID'], 0, 50);

        // Idempotency: never create a second QloApps order for the same PayPal order.
        $existing = QloPaypalOrder::getByPaypalOrderId($ppOrderId);
        if ($existing && $existing->id_order) {
            QloPaypalHelper::log('payment', 'Capture skipped, order already exists for PayPal order '.$ppOrderId);
            die(Tools::jsonEncode(array(
                'success' => true,
                'redirect' => $this->getConfirmationLink($cart, $existing->id_order),
            )));
        }

        $cartTotal = $this->getCartTotal($cart);

        // Idempotent capture: stable request id per cart + paypal order.
        $response = QloPaypalHelper::captureOrder($ppOrderId, 'qlopaypal-cart-'.$cart->id);

        if (!$response['success']) {
            QloPaypalHelper::log('payment', 'Capture failed for PayPal order '.$ppOrderId.': '.$response['message']);
            die(Tools::jsonEncode(array('success' => false, 'message' => $response['message'])));
        }

        $data = $response['data'];
        $status = isset($data['status']) ? $data['status'] : '';
        $capture = $this->extractCapture($data);

        // Server-side verification of the captured amount and currency.
        if ($status === 'COMPLETED'
            && isset($capture['amount']['value'], $capture['amount']['currency_code'])
        ) {
            if (Tools::strtoupper($capture['amount']['currency_code']) !== 'EUR'
                || (float) $capture['amount']['value'] < $cartTotal - 0.01
            ) {
                QloPaypalHelper::log('payment', 'Capture amount mismatch for PayPal order '.$ppOrderId.', aborting');
                die(Tools::jsonEncode(array('success' => false, 'message' => 'Captured amount does not match the cart total')));
            }
        }

        $this->savePaypalOrder($cart, $ppOrderId, $capture, $status, $data, $cartTotal);

        if ($status !== 'COMPLETED') {
            QloPaypalHelper::log('payment', 'Capture status '.$status.' for PayPal order '.$ppOrderId);
            die(Tools::jsonEncode(array('success' => false, 'message' => 'Payment not completed ('.$status.')')));
        }

        $customer = new Customer($cart->id_customer);
        $orderStatus = $cart->is_advance_payment
            ? Configuration::get('PS_OS_PARTIAL_PAYMENT_ACCEPTED')
            : Configuration::get('PS_OS_PAYMENT_ACCEPTED');

        $this->module->validateOrder(
            (int) $cart->id,
            $orderStatus,
            $cartTotal,
            $this->module->l('PayPal Checkout'),
            null,
            array(),
            (int) $this->context->currency->id,
            false,
            $customer->secure_key
        );

        $idOrder = (int) $this->module->currentOrder;
        $record = QloPaypalOrder::getByPaypalOrderId($ppOrderId);
        if ($record) {
            $record->id_order = $idOrder;
            $record->order_reference = (string) Order::getUniqReferenceOf($idOrder);
            $record->update();
        }

        QloPaypalHelper::log('payment', 'Order '.$idOrder.' created for PayPal order '.$ppOrderId);

        die(Tools::jsonEncode(array(
            'success' => true,
            'redirect' => $this->getConfirmationLink($cart, $idOrder),
        )));
    }

    private function getConfirmationLink($cart, $idOrder)
    {
        $customer = new Customer($cart->id_customer);
        return $this->context->link->getPageLink(
            'order-confirmation',
            true,
            (int) $this->context->language->id,
            array(
                'id_cart' => (int) $cart->id,
                'id_module' => (int) $this->module->id,
                'id_order' => (int) $idOrder,
                'key' => $customer->secure_key,
            )
        );
    }

    private function getCartTotal($cart)
    {
        if ($cart->is_advance_payment) {
            return (float) $cart->getOrderTotal(true, Cart::ADVANCE_PAYMENT);
        }
        return (float) $cart->getOrderTotal(true, Cart::BOTH);
    }

    /**
     * Build the PayPal Orders v2 payload. All amounts recomputed from the cart.
     */
    private function buildOrderData($cart)
    {
        $cartTotalTI = $this->getCartTotal($cart);
        $cartTotalTE = $cart->is_advance_payment
            ? (float) $cart->getOrderTotal(false, Cart::ADVANCE_PAYMENT)
            : (float) $cart->getOrderTotal(false, Cart::BOTH);
        $discountTI = (float) $cart->getOrderTotal(true, Cart::ONLY_DISCOUNTS);
        $discountTE = (float) $cart->getOrderTotal(false, Cart::ONLY_DISCOUNTS);

        $itemTotalTE = $cartTotalTE + $discountTE;
        $taxTotal = $cartTotalTI - $cartTotalTE;

        $customer = new Customer((int) $cart->id_customer);
        $shopName = Configuration::get('PS_SHOP_NAME');

        $orderData = array(
            'intent' => 'CAPTURE',
            'purchase_units' => array(
                array(
                    'reference_id' => 'cart-'.$cart->id,
                    'description' => 'Payment for '.Tools::substr($shopName, 0, 100),
                    'soft_descriptor' => Tools::substr($shopName, 0, 21),
                    'custom_id' => $cart->id,
                    'invoice_id' => 'CART-'.$cart->id.'-'.time(),
                    'amount' => array(
                        'currency_code' => 'EUR',
                        'value' => Tools::ps_round($cartTotalTI, 2),
                        'breakdown' => array(
                            'item_total' => array(
                                'currency_code' => 'EUR',
                                'value' => Tools::ps_round($itemTotalTE, 2),
                            ),
                            'tax_total' => array(
                                'currency_code' => 'EUR',
                                'value' => Tools::ps_round($taxTotal, 2),
                            ),
                            'discount' => array(
                                'currency_code' => 'EUR',
                                'value' => Tools::ps_round($discountTI, 2),
                            ),
                        ),
                    ),
                ),
            ),
            'application_context' => array(
                'brand_name' => Tools::substr($shopName, 0, 127),
                'user_action' => 'PAY_NOW',
                'shipping_preference' => 'NO_SHIPPING',
            ),
        );

        $orderData['purchase_units'][0]['payer'] = array(
            'name' => array(
                'given_name' => $customer->firstname,
                'surname' => $customer->lastname,
            ),
            'email_address' => $customer->email,
        );

        return $orderData;
    }

    private function extractCapture($data)
    {
        if (isset($data['purchase_units'][0]['payments']['captures'][0])) {
            return $data['purchase_units'][0]['payments']['captures'][0];
        }
        return array();
    }

    private function savePaypalOrder($cart, $ppOrderId, $capture, $status, $data, $cartTotal)
    {
        $obj = QloPaypalOrder::getByPaypalOrderId($ppOrderId);
        if (!$obj) {
            $obj = new QloPaypalOrder();
            $obj->date_add = date('Y-m-d H:i:s');
            $obj->id_cart = (int) $cart->id;
            $obj->id_currency = (int) $cart->id_currency;
            $obj->id_customer = (int) $cart->id_customer;
        }

        $obj->environment = Configuration::get('QLOPAYPAL_MODE');
        $obj->order_total = $cartTotal;
        $obj->checkout_currency = 'EUR';
        $obj->pp_order_id = $ppOrderId;
        $obj->pp_capture_id = isset($capture['id']) ? $capture['id'] : '';
        $obj->pp_payment_status = isset($capture['status']) ? $capture['status'] : $status;
        $obj->response = Tools::jsonEncode($data);
        $obj->date_upd = date('Y-m-d H:i:s');
        $obj->save();
    }
}
