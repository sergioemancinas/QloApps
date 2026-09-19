<?php
/**
 * QloApps PayPal Checkout (Smart Buttons + server-side capture).
 *
 * PayPal REST API Checkout Orders v2. Client-side approve via PayPal JS SDK
 * buttons, server-side create + capture, webhook signature verification.
 * Amounts are always recomputed server-side from the QloApps cart.
 * No card data ever touches the server.
 *
 * @license https://opensource.org/license/osl-3-0-php Open Software License version 3.0
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

require_once dirname(__FILE__).'/classes/QloPaypalClassInclude.php';

class QloPaypal extends PaymentModule
{
    private $html = '';
    private $postErrors = array();

    public $ppMode;
    public $sandboxClientId;
    public $sandboxSecret;
    public $liveClientId;
    public $liveSecret;
    public $webhookId;

    public function __construct()
    {
        $this->name = 'qlopaypal';
        $this->tab = 'payments_gateways';
        $this->version = '1.0.0';
        $this->author = 'fewo-lauscha';
        $this->bootstrap = true;
        $this->ps_versions_compliancy = array('min' => '1.6', 'max' => '1.6');

        $this->displayName = $this->l('PayPal Checkout');
        $this->description = $this->l(
            'PayPal Smart Buttons on the booking checkout. Server-side order creation and capture via PayPal Orders v2 REST API.'
        );

        $config = Configuration::getMultiple(array(
            'QLOPAYPAL_MODE',
            'QLOPAYPAL_SANDBOX_CLIENT_ID',
            'QLOPAYPAL_SANDBOX_SECRET',
            'QLOPAYPAL_LIVE_CLIENT_ID',
            'QLOPAYPAL_LIVE_SECRET',
            'QLOPAYPAL_WEBHOOK_ID',
        ));

        $this->ppMode = isset($config['QLOPAYPAL_MODE']) ? $config['QLOPAYPAL_MODE'] : 'sandbox';
        $this->sandboxClientId = isset($config['QLOPAYPAL_SANDBOX_CLIENT_ID']) ? $config['QLOPAYPAL_SANDBOX_CLIENT_ID'] : '';
        $this->sandboxSecret = isset($config['QLOPAYPAL_SANDBOX_SECRET']) ? $config['QLOPAYPAL_SANDBOX_SECRET'] : '';
        $this->liveClientId = isset($config['QLOPAYPAL_LIVE_CLIENT_ID']) ? $config['QLOPAYPAL_LIVE_CLIENT_ID'] : '';
        $this->liveSecret = isset($config['QLOPAYPAL_LIVE_SECRET']) ? $config['QLOPAYPAL_LIVE_SECRET'] : '';
        $this->webhookId = isset($config['QLOPAYPAL_WEBHOOK_ID']) ? $config['QLOPAYPAL_WEBHOOK_ID'] : '';

        parent::__construct();

        $this->payment_type = OrderPayment::PAYMENT_TYPE_ONLINE;
    }

    public function install()
    {
        $objDb = new QloPaypalDb();
        if (!parent::install()
            || !$objDb->createTables()
            || !$this->registerModuleHooks()
            || !Configuration::updateValue('QLOPAYPAL_MODE', 'sandbox')
        ) {
            return false;
        }
        return true;
    }

    public function uninstall()
    {
        $objDb = new QloPaypalDb();
        if (!parent::uninstall()
            || !$objDb->deleteConfigVars()
            || !$objDb->dropTables()
        ) {
            return false;
        }
        return true;
    }

    public function registerModuleHooks()
    {
        return $this->registerHook(array(
            'displayPayment',
            'paymentReturn',
            'actionFrontControllerSetMedia',
        ));
    }

    public function getContent()
    {
        if (!$this->checkPaypalConfigured()) {
            $this->context->controller->warnings[] = $this->l(
                'PayPal is not fully configured: select a mode and fill in the matching Client ID and Secret.'
            );
        }

        if (Tools::isSubmit('submit_qlopaypal')) {
            $this->postValidation();
            if (!count($this->postErrors)) {
                $this->postProcess();
            } else {
                $this->html .= $this->displayError($this->postErrors);
            }
        }

        $this->html .= $this->renderForm();

        return $this->html;
    }

    public function renderForm()
    {
        $fieldsForm = array();
        $fieldsForm['form'] = array(
            'legend' => array(
                'icon' => 'icon-cog',
                'title' => $this->l('PayPal Checkout Configuration'),
            ),
            'input' => array(
                array(
                    'type' => 'select',
                    'required' => true,
                    'label' => $this->l('Mode'),
                    'name' => 'QLOPAYPAL_MODE',
                    'options' => array(
                        'query' => array(
                            array('id' => 'sandbox', 'name' => $this->l('Sandbox')),
                            array('id' => 'live', 'name' => $this->l('Live')),
                        ),
                        'id' => 'id',
                        'name' => 'name',
                    ),
                    'hint' => $this->l('Sandbox-first: only switch to Live after sandbox testing passed.'),
                ),
                array(
                    'label' => $this->l('Sandbox Client ID'),
                    'name' => 'QLOPAYPAL_SANDBOX_CLIENT_ID',
                    'size' => 100,
                    'type' => 'text',
                    'hint' => $this->l('Client ID of your PayPal sandbox REST app.'),
                ),
                array(
                    'label' => $this->l('Sandbox Secret'),
                    'name' => 'QLOPAYPAL_SANDBOX_SECRET',
                    'size' => 100,
                    'type' => 'password',
                    'hint' => $this->l('Secret of your PayPal sandbox REST app. Stored in qlo_configuration, never logged.'),
                ),
                array(
                    'label' => $this->l('Live Client ID'),
                    'name' => 'QLOPAYPAL_LIVE_CLIENT_ID',
                    'size' => 100,
                    'type' => 'text',
                    'hint' => $this->l('Client ID of your PayPal live REST app.'),
                ),
                array(
                    'label' => $this->l('Live Secret'),
                    'name' => 'QLOPAYPAL_LIVE_SECRET',
                    'size' => 100,
                    'type' => 'password',
                    'hint' => $this->l('Secret of your PayPal live REST app. Stored in qlo_configuration, never logged.'),
                ),
                array(
                    'label' => $this->l('Webhook ID'),
                    'name' => 'QLOPAYPAL_WEBHOOK_ID',
                    'size' => 100,
                    'type' => 'text',
                    'hint' => $this->l('Webhook ID for the webhook endpoint of this mode. Required for webhook signature verification.'),
                ),
            ),
            'submit' => array(
                'title' => $this->l('Save'),
                'name' => 'submit_qlopaypal',
            ),
        );

        $helper = new HelperForm();
        $helper->show_toolbar = false;
        $helper->table = $this->table;
        $lang = new Language((int) Configuration::get('PS_LANG_DEFAULT'));
        $helper->default_form_language = $lang->id;
        $helper->identifier = $this->identifier;
        $helper->submit_action = 'submitQloPaypal';
        $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false)
            .'&configure='.$this->name.'&module_name='.$this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->tpl_vars = array(
            'fields_value' => QloPaypalDb::getConfigFieldsValues(),
            'languages' => $this->context->controller->getLanguages(),
            'id_language' => $this->context->language->id,
        );

        return $helper->generateForm(array($fieldsForm));
    }

    private function postValidation()
    {
        $mode = Tools::getValue('QLOPAYPAL_MODE');
        if (!in_array($mode, array('sandbox', 'live'))) {
            $this->postErrors[] = $this->l('Please choose a valid mode (sandbox or live).');
        }

        $sandboxClientId = trim(Tools::getValue('QLOPAYPAL_SANDBOX_CLIENT_ID'));
        $sandboxSecret = trim(Tools::getValue('QLOPAYPAL_SANDBOX_SECRET'));
        if ($sandboxClientId !== '' && $sandboxSecret === '') {
            $this->postErrors[] = $this->l('Sandbox Client ID set but Sandbox Secret is empty.');
        }
        if ($sandboxClientId === '' && $sandboxSecret !== '') {
            $this->postErrors[] = $this->l('Sandbox Secret set but Sandbox Client ID is empty.');
        }

        $liveClientId = trim(Tools::getValue('QLOPAYPAL_LIVE_CLIENT_ID'));
        $liveSecret = trim(Tools::getValue('QLOPAYPAL_LIVE_SECRET'));
        if ($liveClientId !== '' && $liveSecret === '') {
            $this->postErrors[] = $this->l('Live Client ID set but Live Secret is empty.');
        }
        if ($liveClientId === '' && $liveSecret !== '') {
            $this->postErrors[] = $this->l('Live Secret set but Live Client ID is empty.');
        }

        if ($mode === 'sandbox' && $sandboxClientId === '') {
            $this->postErrors[] = $this->l('Sandbox mode selected but sandbox credentials are missing.');
        }
        if ($mode === 'live' && $liveClientId === '') {
            $this->postErrors[] = $this->l('Live mode selected but live credentials are missing.');
        }

        if (!count($this->postErrors)) {
            $this->validatePaypalCredentials();
        }
    }

    private function validatePaypalCredentials()
    {
        $token = QloPaypalHelper::getAccessToken();
        if (!$token['success']) {
            $this->postErrors[] = $this->l('PayPal credentials check failed: ').$token['message'];
        }
    }

    public function postProcess()
    {
        if (Tools::isSubmit('submit_qlopaypal')) {
            foreach (array(
                'QLOPAYPAL_MODE',
                'QLOPAYPAL_SANDBOX_CLIENT_ID',
                'QLOPAYPAL_SANDBOX_SECRET',
                'QLOPAYPAL_LIVE_CLIENT_ID',
                'QLOPAYPAL_LIVE_SECRET',
                'QLOPAYPAL_WEBHOOK_ID',
            ) as $key) {
                Configuration::updateValue($key, trim(Tools::getValue($key)));
            }

            Tools::redirectAdmin(
                $this->context->link->getAdminLink('AdminModules')
                .'&configure='.$this->name.'&tab_module='.$this->tab.'&module_name='.$this->name.'&conf=4'
            );
        }
    }

    public function hookActionFrontControllerSetMedia($params)
    {
        if ('order' !== $this->context->controller->php_self
            && 'order-opc' !== $this->context->controller->php_self
        ) {
            return;
        }

        if (!$this->checkPaypalAvailability()) {
            return;
        }

        $clientId = $this->getClientId();
        if (!$clientId) {
            return;
        }

        Media::addJsDef(array(
            'qlopaypal_create_order' => $this->context->link->getModuleLink(
                $this->name,
                'payment',
                array('action' => 'create'),
                true
            ),
            'qlopaypal_capture_order' => $this->context->link->getModuleLink(
                $this->name,
                'payment',
                array('action' => 'capture'),
                true
            ),
            'qlopaypal_cancel_order' => $this->context->link->getPageLink('order-opc', true),
            'qlopaypal_error_url' => $this->context->link->getModuleLink($this->name, 'errorpayment'),
            'qlopaypal_environment' => $this->ppMode,
        ));

        $this->context->controller->addJS(
            'https://www.paypal.com/sdk/js?client-id='.urlencode($clientId)
            .'&currency=EUR&intent=capture&commit=false&components=buttons'
        );
    }

    public function hookDisplayPayment($params)
    {
        if (!$this->checkPaypalAvailability()) {
            return;
        }

        return $this->display(__FILE__, 'payment.tpl');
    }

    public function hookPaymentReturn($params)
    {
        if (!$this->active) {
            return;
        }
        $objOrder = $params['objOrder'];
        $objOrderState = new OrderState($objOrder->getCurrentState());
        if ($objOrderState->logable) {
            if ($objOrder->is_advance_payment) {
                $orderTotal = $objOrder->advance_paid_amount;
            } else {
                $orderTotal = $objOrder->total_paid;
            }
            $this->smarty->assign(array(
                'total_to_pay' => Tools::displayPrice($orderTotal, $params['currencyObj'], false),
                'status' => 1,
                'id_order' => $objOrder->id,
            ));
        } else {
            $this->smarty->assign('status', 0);
        }

        return $this->display(__FILE__, 'payment_return.tpl');
    }

    public function checkPaypalAvailability()
    {
        if (!$this->active
            || !$this->checkCurrency($this->context->cart)
            || !$this->checkPaypalConfigured()
        ) {
            return false;
        }
        return true;
    }

    public function checkCurrency($cart)
    {
        if (!Validate::isLoadedObject($cart)) {
            return false;
        }
        $currency = new Currency((int) $cart->id_currency);
        return Tools::strtoupper($currency->iso_code) === 'EUR';
    }

    public function checkPaypalConfigured()
    {
        $clientId = $this->getClientId();
        $secret = $this->getClientSecret();
        return $clientId !== '' && $secret !== '' && in_array($this->ppMode, array('sandbox', 'live'));
    }

    public function getClientId()
    {
        return ($this->ppMode === 'live') ? $this->liveClientId : $this->sandboxClientId;
    }

    public function getClientSecret()
    {
        return ($this->ppMode === 'live') ? $this->liveSecret : $this->sandboxSecret;
    }
}
