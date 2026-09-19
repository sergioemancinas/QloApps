<?php
/**
 * Install/uninstall SQL and configuration helpers for qlopaypal.
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class QloPaypalDb
{
    public static function getConfigFieldsValues()
    {
        return array(
            'QLOPAYPAL_MODE' => Tools::getValue(
                'QLOPAYPAL_MODE',
                Configuration::get('QLOPAYPAL_MODE')
            ),
            'QLOPAYPAL_SANDBOX_CLIENT_ID' => Tools::getValue(
                'QLOPAYPAL_SANDBOX_CLIENT_ID',
                Configuration::get('QLOPAYPAL_SANDBOX_CLIENT_ID')
            ),
            'QLOPAYPAL_SANDBOX_SECRET' => Tools::getValue(
                'QLOPAYPAL_SANDBOX_SECRET',
                Configuration::get('QLOPAYPAL_SANDBOX_SECRET')
            ),
            'QLOPAYPAL_LIVE_CLIENT_ID' => Tools::getValue(
                'QLOPAYPAL_LIVE_CLIENT_ID',
                Configuration::get('QLOPAYPAL_LIVE_CLIENT_ID')
            ),
            'QLOPAYPAL_LIVE_SECRET' => Tools::getValue(
                'QLOPAYPAL_LIVE_SECRET',
                Configuration::get('QLOPAYPAL_LIVE_SECRET')
            ),
            'QLOPAYPAL_WEBHOOK_ID' => Tools::getValue(
                'QLOPAYPAL_WEBHOOK_ID',
                Configuration::get('QLOPAYPAL_WEBHOOK_ID')
            ),
        );
    }

    public function getModuleSql()
    {
        return array(
            'CREATE TABLE IF NOT EXISTS `'._DB_PREFIX_.'qlo_paypal_order` (
                `id_qlo_paypal_order` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
                `environment` VARCHAR(15) NOT NULL,
                `id_cart` INT(10) UNSIGNED NOT NULL,
                `id_currency` INT(10) UNSIGNED NOT NULL,
                `id_customer` INT(10) UNSIGNED NOT NULL,
                `order_total` DECIMAL(10,5) NOT NULL,
                `checkout_currency` VARCHAR(5) NOT NULL,
                `pp_order_id` VARCHAR(50) NOT NULL,
                `pp_capture_id` VARCHAR(50) NOT NULL DEFAULT \'\',
                `pp_payment_status` VARCHAR(30) NOT NULL DEFAULT \'\',
                `order_reference` VARCHAR(20) NOT NULL DEFAULT \'\',
                `id_order` INT(10) UNSIGNED NOT NULL DEFAULT 0,
                `response` TEXT NOT NULL,
                `date_add` DATETIME NOT NULL,
                `date_upd` DATETIME NOT NULL,
                PRIMARY KEY (`id_qlo_paypal_order`),
                KEY `pp_order_id` (`pp_order_id`),
                KEY `pp_capture_id` (`pp_capture_id`),
                KEY `id_cart` (`id_cart`)
            ) ENGINE='._MYSQL_ENGINE_.' DEFAULT CHARSET=utf8;',
        );
    }

    public function createTables()
    {
        if ($sql = $this->getModuleSql()) {
            foreach ($sql as $query) {
                if ($query && !Db::getInstance()->execute(trim($query))) {
                    return false;
                }
            }
        }
        return true;
    }

    public function dropTables()
    {
        return Db::getInstance()->execute(
            'DROP TABLE IF EXISTS `'._DB_PREFIX_.'qlo_paypal_order`'
        );
    }

    public function deleteConfigVars()
    {
        foreach (array(
            'QLOPAYPAL_MODE',
            'QLOPAYPAL_SANDBOX_CLIENT_ID',
            'QLOPAYPAL_SANDBOX_SECRET',
            'QLOPAYPAL_LIVE_CLIENT_ID',
            'QLOPAYPAL_LIVE_SECRET',
            'QLOPAYPAL_WEBHOOK_ID',
        ) as $key) {
            if (!Configuration::deleteByName($key)) {
                return false;
            }
        }
        return true;
    }
}
