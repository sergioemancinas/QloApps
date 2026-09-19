<?php

if (!defined('_PS_VERSION_')) {
    exit;
}

class FewoReviews extends Module
{
    const CONFIG_MODERATION_EMAIL = 'FEWO_REVIEWS_MODERATION_EMAIL';

    public function __construct()
    {
        $this->name = 'feworeviews';
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'FeWo Lauscha';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = array('min' => '1.6', 'max' => _PS_VERSION_);
        $this->bootstrap = false;

        parent::__construct();

        $this->displayName = $this->l('FeWo Guest Reviews');
        $this->description = $this->l('Collects guest reviews after completed stays and via in-property QR code; aggregates Airbnb, Booking.com and direct-booking feedback.');
        $this->confirmUninstall = $this->l('Delete all reviews?');
    }

    public function install()
    {
        return parent::install()
            && $this->installDb()
            && $this->registerHook('displayHome')
            && $this->registerHook('displayHeader');
    }

    public function uninstall()
    {
        return parent::uninstall();
    }

    protected function installDb()
    {
        $sql = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'fewo_review` (
            `id_review` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `id_customer` INT UNSIGNED DEFAULT NULL,
            `id_order` INT UNSIGNED DEFAULT NULL,
            `source` ENUM(\'direct\',\'airbnb\',\'booking\',\'qr\') NOT NULL DEFAULT \'direct\',
            `author_name` VARCHAR(96) NOT NULL,
            `author_email` VARCHAR(128) DEFAULT NULL,
            `rating` TINYINT UNSIGNED NOT NULL,
            `title` VARCHAR(128) DEFAULT NULL,
            `body` TEXT NOT NULL,
            `stay_from` DATE DEFAULT NULL,
            `stay_to` DATE DEFAULT NULL,
            `language` VARCHAR(5) NOT NULL DEFAULT \'de\',
            `access_token` CHAR(32) DEFAULT NULL,
            `token_expires` DATETIME DEFAULT NULL,
            `date_add` DATETIME NOT NULL,
            `date_upd` DATETIME NOT NULL,
            `status` ENUM(\'pending\',\'approved\',\'rejected\') NOT NULL DEFAULT \'pending\',
            PRIMARY KEY (`id_review`),
            KEY `idx_status` (`status`),
            KEY `idx_order` (`id_order`),
            KEY `idx_token` (`access_token`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4;';

        return Db::getInstance()->execute($sql);
    }

    /**
     * Issue a review token for a completed stay (called post-checkout or by admin import).
     */
    public static function issueStayToken($idOrder, $idCustomer, $email, $langIso = 'de')
    {
        $token = bin2hex(random_bytes(16));
        $now = new DateTime('now', new DateTimeZone('UTC'));
        $expires = $now->add(new DateInterval('P60D'));

        Db::getInstance()->execute(
            'INSERT INTO `' . _DB_PREFIX_ . 'fewo_review`
                (`id_customer`, `id_order`, `source`, `author_name`, `author_email`, `rating`, `body`, `language`, `access_token`, `token_expires`, `date_add`, `date_upd`, `status`)
             VALUES (
                ' . (int) $idCustomer . ', ' . (int) $idOrder . ', \'direct\', \'\', \'' . pSQL($email) . '\', 0, \'\', \'' . pSQL($langIso) . '\',
                \'' . pSQL($token) . '\', \'' . pSQL($expires->format('Y-m-d H:i:s')) . '\', NOW(), NOW(), \'pending\')'
        );

        return $token;
    }

    public function hookDisplayHome($params)
    {
        $reviews = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS(
            'SELECT `author_name`, `rating`, `title`, `body`, `source`, `stay_to`
             FROM `' . _DB_PREFIX_ . 'fewo_review`
             WHERE `status` = \'approved\'
             ORDER BY `date_add` DESC
             LIMIT 3'
        );

        if (!$reviews) {
            return '';
        }

        $this->context->smarty->assign(array(
            'fewo_reviews' => $reviews,
            'fewo_reviews_url' => $this->context->link->getModuleLink($this->name, 'feedback'),
        ));

        return $this->display(__FILE__, 'views/templates/hook/home-reviews.tpl');
    }

    public function hookDisplayHeader($params)
    {
        // nothing yet; reserved for review structured data
        return '';
    }
}
