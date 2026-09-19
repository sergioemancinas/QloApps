<?php
/**
 * Record of a PayPal order/capture linked to a QloApps cart and order.
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class QloPaypalOrder extends ObjectModel
{
    /** @var string */
    public $environment;

    /** @var int */
    public $id_cart;

    /** @var int */
    public $id_currency;

    /** @var int */
    public $id_customer;

    /** @var float */
    public $order_total;

    /** @var string */
    public $checkout_currency;

    /** @var string PayPal order id */
    public $pp_order_id;

    /** @var string PayPal capture/transaction id */
    public $pp_capture_id;

    /** @var string PayPal payment status (COMPLETED, PENDING, ...) */
    public $pp_payment_status;

    /** @var string QloApps order reference */
    public $order_reference;

    /** @var int */
    public $id_order;

    /** @var string */
    public $response;

    /** @var string */
    public $date_add;

    /** @var string */
    public $date_upd;

    public static $definition = array(
        'table' => 'qlo_paypal_order',
        'primary' => 'id_qlo_paypal_order',
        'fields' => array(
            'environment' => array('type' => self::TYPE_STRING, 'validate' => 'isGenericName', 'size' => 15),
            'id_cart' => array('type' => self::TYPE_INT, 'validate' => 'isUnsignedId', 'required' => true),
            'id_currency' => array('type' => self::TYPE_INT, 'validate' => 'isUnsignedId', 'required' => true),
            'id_customer' => array('type' => self::TYPE_INT, 'validate' => 'isUnsignedId', 'required' => true),
            'order_total' => array('type' => self::TYPE_FLOAT, 'validate' => 'isPrice', 'required' => true),
            'checkout_currency' => array('type' => self::TYPE_STRING, 'validate' => 'isLanguageIsoCode', 'size' => 5),
            'pp_order_id' => array('type' => self::TYPE_STRING, 'validate' => 'isGenericName', 'size' => 50, 'required' => true),
            'pp_capture_id' => array('type' => self::TYPE_STRING, 'validate' => 'isGenericName', 'size' => 50),
            'pp_payment_status' => array('type' => self::TYPE_STRING, 'validate' => 'isGenericName', 'size' => 30),
            'order_reference' => array('type' => self::TYPE_STRING, 'validate' => 'isReference', 'size' => 20),
            'id_order' => array('type' => self::TYPE_INT, 'validate' => 'isUnsignedId'),
            'response' => array('type' => self::TYPE_HTML, 'validate' => 'isCleanHtml'),
            'date_add' => array('type' => self::TYPE_DATE, 'validate' => 'isDate'),
            'date_upd' => array('type' => self::TYPE_DATE, 'validate' => 'isDate'),
        ),
    );

    public static function getByPaypalOrderId($ppOrderId)
    {
        $row = Db::getInstance()->getRow(
            'SELECT * FROM `'._DB_PREFIX_.'qlo_paypal_order`
            WHERE `pp_order_id` = "'.pSQL($ppOrderId).'"'
        );
        return $row ? new self((int) $row['id_qlo_paypal_order']) : false;
    }

    public static function getByCaptureId($captureId)
    {
        $row = Db::getInstance()->getRow(
            'SELECT * FROM `'._DB_PREFIX_.'qlo_paypal_order`
            WHERE `pp_capture_id` = "'.pSQL($captureId).'"'
        );
        return $row ? new self((int) $row['id_qlo_paypal_order']) : false;
    }

    public static function getByCartId($idCart)
    {
        $row = Db::getInstance()->getRow(
            'SELECT * FROM `'._DB_PREFIX_.'qlo_paypal_order`
            WHERE `id_cart` = '.(int) $idCart.'
            ORDER BY `id_qlo_paypal_order` DESC'
        );
        return $row ? new self((int) $row['id_qlo_paypal_order']) : false;
    }
}
