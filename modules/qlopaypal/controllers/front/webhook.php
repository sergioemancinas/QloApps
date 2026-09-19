<?php
/**
 * Webhook front controller.
 *
 * Signature verification via PayPal verify-webhook-signature API is mandatory.
 * Handles PAYMENT.CAPTURE.COMPLETED and CHECKOUT.ORDER.APPROVED, idempotent.
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class QloPaypalWebhookModuleFrontController extends ModuleFrontController
{
    public function initContent()
    {
        parent::initContent();

        $rawBody = Tools::file_get_contents('php://input');
        $event = Tools::jsonDecode($rawBody, true);

        if (!is_array($event) || empty($event['event_type'])) {
            $this->respond();
        }

        QloPaypalHelper::log(
            'webhook',
            'Webhook received, event type: '.$event['event_type'].', id: '.(isset($event['id']) ? $event['id'] : 'n/a')
        );

        if (!QloPaypalHelper::verifyWebhookSignature($rawBody)) {
            QloPaypalHelper::log('webhook', 'Webhook signature verification FAILED, ignoring event');
            $this->respond();
        }

        switch ($event['event_type']) {
            case 'PAYMENT.CAPTURE.COMPLETED':
                $this->handleCaptureCompleted($event);
                break;
            case 'CHECKOUT.ORDER.APPROVED':
                $this->handleOrderApproved($event);
                break;
            default:
                QloPaypalHelper::log('webhook', 'Unhandled event type: '.$event['event_type']);
                break;
        }

        $this->respond();
    }

    private function respond()
    {
        header('HTTP/1.1 200 OK');
        die;
    }

    /**
     * Mark the payment as completed in QloApps. Idempotent: processed only
     * once per capture id and only if the order exists and is not yet paid.
     */
    private function handleCaptureCompleted($event)
    {
        $resource = isset($event['resource']) ? $event['resource'] : array();
        $captureId = isset($resource['id']) ? $resource['id'] : '';
        if ($captureId === '') {
            QloPaypalHelper::log('webhook', 'PAYMENT.CAPTURE.COMPLETED without resource id');
            return;
        }

        $obj = QloPaypalOrder::getByCaptureId($captureId);
        if (!$obj) {
            $ppOrderId = isset($resource['supplementary_data']['related_ids']['order_id'])
                ? $resource['supplementary_data']['related_ids']['order_id']
                : '';
            if ($ppOrderId !== '') {
                $obj = QloPaypalOrder::getByPaypalOrderId($ppOrderId);
            }
        }

        if (!$obj) {
            QloPaypalHelper::log('webhook', 'No local record for capture '.$captureId.', skipping');
            return;
        }

        // Idempotency: only complete once.
        if ($obj->pp_payment_status === 'COMPLETED' && $obj->id_order) {
            QloPaypalHelper::log('webhook', 'Capture '.$captureId.' already processed, skipping');
            return;
        }

        $obj->pp_capture_id = $captureId;
        $obj->pp_payment_status = 'COMPLETED';
        $obj->date_upd = date('Y-m-d H:i:s');
        $obj->save();

        if (!$obj->id_order) {
            // Customer capture response still pending; webhook-only capture.
            QloPaypalHelper::log('webhook', 'Capture '.$captureId.' completed but no QloApps order yet, awaiting capture flow');
            return;
        }

        $order = new Order((int) $obj->id_order);
        if (!Validate::isLoadedObject($order)) {
            QloPaypalHelper::log('webhook', 'Order '.$obj->id_order.' not found for capture '.$captureId);
            return;
        }

        $currentStatus = (int) $order->getCurrentState();
        $paidStatus = $order->is_advance_payment
            ? (int) Configuration::get('PS_OS_PARTIAL_PAYMENT_ACCEPTED')
            : (int) Configuration::get('PS_OS_PAYMENT_ACCEPTED');

        if ($currentStatus !== $paidStatus) {
            $history = new OrderHistory();
            $history->id_order = (int) $order->id;
            $history->changeIdOrderState($paidStatus, (int) $order->id, true);
            if (!$history->addWithemail(true)) {
                QloPaypalHelper::log('webhook', 'Failed to update order state for order '.$order->id);
            } else {
                QloPaypalHelper::log('webhook', 'Order '.$order->id.' marked paid via webhook');
            }
        }
    }

    /**
     * Record the approval (buyer approved in the popup). The order is only
     * created after server-side capture succeeds, so this is informational
     * and idempotent.
     */
    private function handleOrderApproved($event)
    {
        $resource = isset($event['resource']) ? $event['resource'] : array();
        $ppOrderId = isset($resource['id']) ? $resource['id'] : '';

        if ($ppOrderId === '') {
            QloPaypalHelper::log('webhook', 'CHECKOUT.ORDER.APPROVED without resource id');
            return;
        }

        $obj = QloPaypalOrder::getByPaypalOrderId($ppOrderId);
        if ($obj && $obj->pp_payment_status === 'COMPLETED') {
            QloPaypalHelper::log('webhook', 'PayPal order '.$ppOrderId.' already completed, skipping approval event');
            return;
        }

        QloPaypalHelper::log('webhook', 'PayPal order '.$ppOrderId.' approved by buyer');
    }
}
