<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class QloPaypalErrorpaymentModuleFrontController extends ModuleFrontController
{
    public function initContent()
    {
        parent::initContent();

        $errName = Tools::getValue('err_name');
        $errMsg = Tools::getValue('err_msg');

        $this->context->smarty->assign(array(
            'err_name' => is_string($errName) ? Tools::htmlentitiesUTF8($errName) : '',
            'err_msg' => is_string($errMsg) ? Tools::htmlentitiesUTF8($errMsg) : '',
        ));

        $this->setTemplate('paypal_error.tpl');
    }
}
