<?php

class FeworeviewsFeedbackModuleFrontController extends ModuleFrontController
{
    public $ssl = true;
    public $php_self = 'module-feworeviews-feedback';

    public function initContent()
    {
        parent::initContent();

        $method = $_SERVER['REQUEST_METHOD'];
        if ($method === 'POST') {
            $this->handleSubmit();
            return;
        }

        $token = trim((string) Tools::getValue('t'));
        $stay = null;
        if ($token !== '') {
            $stay = Db::getInstance(_PS_USE_SQL_SLAVE_)->getRow(
                'SELECT `id_review`, `id_order`, `author_email`, `stay_from`, `stay_to`
                 FROM `' . _DB_PREFIX_ . 'fewo_review`
                 WHERE `access_token` = \'' . pSQL($token) . '\'
                   AND (`token_expires` IS NULL OR `token_expires` > NOW())'
            );
        }

        $this->context->smarty->assign(array(
            'fewo_token' => $token !== '' ? $token : '',
            'fewo_token_valid' => (bool) $stay,
            'fewo_stay' => $stay,
            'fewo_source' => $stay ? 'direct' : 'qr',
            'fewo_submitted' => false,
            'fewo_error' => '',
        ));

        $this->setTemplate('module:feworeviews/views/templates/front/feedback.tpl');
    }

    protected function handleSubmit()
    {
        $errors = array();

        // Honeypot: bots fill hidden fields.
        if (trim((string) Tools::getValue('website')) !== '') {
            $this->successRedirect();
            return;
        }

        $name = trim((string) Tools::getValue('author_name'));
        $email = trim((string) Tools::getValue('author_email'));
        $body = trim((string) Tools::getValue('body'));
        $title = trim((string) Tools::getValue('title'));
        $rating = (int) Tools::getValue('rating');
        $token = trim((string) Tools::getValue('token'));
        $lang = $this->context->language->iso_code ? strtolower($this->context->language->iso_code) : 'de';

        if (!Validate::isGenericName($name) || Tools::strlen($name) < 2) {
            $errors[] = $this->trans('Please enter your name.', array(), 'Modules.Feworeviews.Shop');
        }
        if ($email !== '' && !Validate::isEmail($email)) {
            $errors[] = $this->trans('Please enter a valid email address (or leave it empty).', array(), 'Modules.Feworeviews.Shop');
        }
        if ($rating < 1 || $rating > 5) {
            $errors[] = $this->trans('Please choose a rating between 1 and 5 stars.', array(), 'Modules.Feworeviews.Shop');
        }
        if (Tools::strlen($body) < 10) {
            $errors[] = $this->trans('Please tell us a little more (at least 10 characters).', array(), 'Modules.Feworeviews.Shop');
        }

        $stay = null;
        $source = 'qr';
        if ($token !== '') {
            $stay = Db::getInstance()->getRow(
                'SELECT `id_review`, `id_order`, `author_email`, `stay_from`, `stay_to`
                 FROM `' . _DB_PREFIX_ . 'fewo_review`
                 WHERE `access_token` = \'' . pSQL($token) . '\'
                   AND (`token_expires` IS NULL OR `token_expires` > NOW())'
            );
            if (!$stay) {
                $errors[] = $this->trans('This feedback link is no longer valid.', array(), 'Modules.Feworeviews.Shop');
            } else {
                $source = 'direct';
            }
        }

        if ($errors) {
            $this->context->smarty->assign(array(
                'fewo_token' => $token,
                'fewo_token_valid' => (bool) $stay,
                'fewo_stay' => $stay,
                'fewo_source' => $source,
                'fewo_submitted' => false,
                'fewo_error' => implode(' ', $errors),
                'fewo_form' => array(
                    'author_name' => $name,
                    'author_email' => $email,
                    'title' => $title,
                    'body' => $body,
                    'rating' => $rating,
                ),
            ));
            $this->setTemplate('module:feworeviews/views/templates/front/feedback.tpl');
            return;
        }

        if ($stay) {
            // Update the tokenised row in place.
            Db::getInstance()->execute(
                'UPDATE `' . _DB_PREFIX_ . 'fewo_review`
                 SET `author_name` = \'' . pSQL($name) . '\',
                     `author_email` = \'' . pSQL($email !== '' ? $email : $stay['author_email']) . '\',
                     `rating` = ' . (int) $rating . ',
                     `title` = \'' . pSQL($title) . '\',
                     `body` = \'' . pSQL($body) . '\',
                     `stay_from` = ' . ($stay['stay_from'] ? '\'' . pSQL($stay['stay_from']) . '\'' : 'NULL') . ',
                     `stay_to` = ' . ($stay['stay_to'] ? '\'' . pSQL($stay['stay_to']) . '\'' : 'NULL') . ',
                     `language` = \'' . pSQL($lang) . '\',
                     `source` = \'direct\',
                     `date_upd` = NOW()
                 WHERE `id_review` = ' . (int) $stay['id_review']
            );
        } else {
            Db::getInstance()->execute(
                'INSERT INTO `' . _DB_PREFIX_ . 'fewo_review`
                    (`source`, `author_name`, `author_email`, `rating`, `title`, `body`, `language`, `date_add`, `date_upd`, `status`)
                 VALUES (\'qr\', \'' . pSQL($name) . '\', \'' . pSQL($email) . '\', ' . (int) $rating . ', \'' . pSQL($title) . '\', \'' . pSQL($body) . '\', \'' . pSQL($lang) . '\', NOW(), NOW(), \'pending\')'
            );
        }

        $this->successRedirect();
    }

    protected function successRedirect()
    {
        $this->context->smarty->assign(array(
            'fewo_token' => '',
            'fewo_token_valid' => false,
            'fewo_stay' => null,
            'fewo_source' => '',
            'fewo_submitted' => true,
            'fewo_error' => '',
        ));
        $this->setTemplate('module:feworeviews/views/templates/front/feedback.tpl');
    }

    protected function trans($id, array $parameters = array(), $domain = null, $locale = null)
    {
        return Context::getContext()->getTranslator()->trans($id, $parameters, $domain, $locale);
    }
}
