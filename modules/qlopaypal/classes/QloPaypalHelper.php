<?php
/**
 * PayPal Orders v2 REST client for qlopaypal.
 *
 * Never logs secrets, tokens or full credentials. Amounts passed in are
 * recomputed server-side from the QloApps cart by the controllers.
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class QloPaypalHelper
{
    const SANDBOX_BASE_URL = 'https://api-m.sandbox.paypal.com';
    const LIVE_BASE_URL = 'https://api-m.paypal.com';

    /**
     * @return array array('success' => bool, 'access_token' => string, 'message' => string)
     */
    public static function getAccessToken()
    {
        $module = Module::getInstanceByName('qlopaypal');
        if (!$module) {
            return array('success' => false, 'message' => 'Module qlopaypal not found');
        }

        $clientId = $module->getClientId();
        $clientSecret = $module->getClientSecret();
        if ($clientId === '' || $clientSecret === '') {
            return array('success' => false, 'message' => 'PayPal credentials not configured');
        }

        $ch = curl_init();
        curl_setopt_array($ch, array(
            CURLOPT_URL => self::getBaseUrl().'/v1/oauth2/token',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_USERPWD => $clientId.':'.$clientSecret,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
            CURLOPT_HTTPHEADER => array(
                'Accept: application/json',
                'Accept-Language: en_US',
            ),
        ));

        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            self::log('payment', 'Token request cURL error (details withheld)');
            return array('success' => false, 'message' => 'PayPal connection error');
        }

        $data = Tools::jsonDecode($response, true);
        if (isset($data['access_token']) && $data['access_token']) {
            return array('success' => true, 'access_token' => $data['access_token']);
        }

        $message = isset($data['error_description']) ? $data['error_description'] : 'Authentication failed';
        return array('success' => false, 'message' => $message);
    }

    public static function getBaseUrl()
    {
        $mode = Configuration::get('QLOPAYPAL_MODE');
        return ($mode === 'live') ? self::LIVE_BASE_URL : self::SANDBOX_BASE_URL;
    }

    /**
     * Create a PayPal order (Checkout Orders v2) from server-recomputed cart totals.
     *
     * @param array $orderData full Orders v2 create payload
     * @return array array('success' => bool, 'data' => array, 'message' => string)
     */
    public static function createOrder($orderData)
    {
        return self::apiCall('/v2/checkout/orders', 'POST', $orderData);
    }

    /**
     * Capture an approved PayPal order. Idempotent via PayPal-Request-Id.
     *
     * @param string $ppOrderId
     * @param string $requestId stable id (cart based) for retries
     * @return array array('success' => bool, 'data' => array, 'message' => string)
     */
    public static function captureOrder($ppOrderId, $requestId)
    {
        return self::apiCall(
            '/v2/checkout/orders/'.urlencode($ppOrderId).'/capture',
            'POST',
            array(),
            array('PayPal-Request-Id: '.preg_replace('/[^A-Za-z0-9\-_]/', '', $requestId))
        );
    }

    public static function getOrder($ppOrderId)
    {
        return self::apiCall('/v2/checkout/orders/'.urlencode($ppOrderId), 'GET', array());
    }

    /**
     * Verify a webhook signature using the verify-webhook-signature API.
     *
     * @param string $rawBody raw request body
     * @return bool
     */
    public static function verifyWebhookSignature($rawBody)
    {
        $webhookId = trim(Configuration::get('QLOPAYPAL_WEBHOOK_ID'));
        if ($webhookId === '') {
            self::log('webhook', 'Webhook ID not configured, rejecting webhook');
            return false;
        }

        $headers = array_change_key_case(getallheaders(), CASE_UPPER);
        $required = array(
            'PAYPAL-TRANSMISSION-ID',
            'PAYPAL-TRANSMISSION-TIME',
            'PAYPAL-TRANSMISSION-SIG',
            'PAYPAL-CERT-URL',
            'PAYPAL-AUTH-ALGO',
        );
        foreach ($required as $header) {
            if (empty($headers[$header])) {
                self::log('webhook', 'Missing webhook header: '.$header);
                return false;
            }
        }

        $payload = array(
            'auth_algo' => $headers['PAYPAL-AUTH-ALGO'],
            'cert_url' => $headers['PAYPAL-CERT-URL'],
            'transmission_id' => $headers['PAYPAL-TRANSMISSION-ID'],
            'transmission_sig' => $headers['PAYPAL-TRANSMISSION-SIG'],
            'transmission_time' => $headers['PAYPAL-TRANSMISSION-TIME'],
            'webhook_id' => $webhookId,
            'webhook_event' => Tools::jsonDecode($rawBody, true),
        );

        $result = self::apiCall('/v1/notifications/verify-webhook-signature', 'POST', $payload);

        return isset($result['data']['verification_status'])
            && $result['data']['verification_status'] === 'SUCCESS';
    }

    private static function apiCall($path, $method, $body = array(), $extraHeaders = array())
    {
        $token = self::getAccessToken();
        if (!$token['success']) {
            return array('success' => false, 'data' => array(), 'message' => $token['message']);
        }

        $headers = array(
            'Authorization: Bearer '.$token['access_token'],
            'Content-Type: application/json',
        );
        $headers = array_merge($headers, $extraHeaders);

        $ch = curl_init();
        $opts = array(
            CURLOPT_URL => self::getBaseUrl().$path,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_HTTPHEADER => $headers,
        );
        if ($method === 'POST') {
            $opts[CURLOPT_POST] = true;
            $opts[CURLOPT_POSTFIELDS] = Tools::jsonEncode($body);
        } else {
            $opts[CURLOPT_HTTPGET] = true;
        }
        curl_setopt_array($ch, $opts);

        $response = curl_exec($ch);
        $err = curl_error($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($err) {
            self::log('payment', 'API call cURL error on '.$path.' (details omitted)');
            return array('success' => false, 'data' => array(), 'message' => 'PayPal connection error');
        }

        $data = Tools::jsonDecode($response, true);
        if (!is_array($data)) {
            $data = array();
        }

        if ($httpCode >= 200 && $httpCode < 300) {
            return array('success' => true, 'data' => $data, 'message' => '');
        }

        $message = 'PayPal API error (HTTP '.$httpCode.')';
        if (isset($data['details'][0]['issue'])) {
            $message .= ': '.$data['details'][0]['issue'];
        } elseif (isset($data['message'])) {
            $message .= ': '.$data['message'];
        }

        return array('success' => false, 'data' => $data, 'message' => $message);
    }

    /**
     * Log a message without ever writing secrets/tokens.
     */
    public static function log($type, $message)
    {
        $file = dirname(__FILE__).'/../log/'.$type.'.log';
        $line = date('d-m-Y H:i:s').'  ----  '.$message."\n";
        @file_put_contents($file, $line, FILE_APPEND);
        return true;
    }

    public static function logJson($type, $label, $data)
    {
        // Remove any potentially sensitive fields before logging.
        unset(
            $data['access_token'],
            $data['client_secret'],
            $data['secret']
        );
        self::log($type, $label.': '.Tools::jsonEncode($data));
    }
}
