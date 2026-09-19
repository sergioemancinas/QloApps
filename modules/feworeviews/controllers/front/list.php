<?php

class FeworeviewsListModuleFrontController extends ModuleFrontController
{
    public $ssl = true;

    public function initContent()
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: public, max-age=600');

        $limit = min(50, max(1, (int) Tools::getValue('limit', 10)));
        $rows = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS(
            'SELECT `author_name`, `rating`, `title`, `body`, `source`, `stay_from`, `stay_to`, `date_add`
             FROM `' . _DB_PREFIX_ . 'fewo_review`
             WHERE `status` = \'approved\'
             ORDER BY `date_add` DESC
             LIMIT ' . $limit
        );

        $reviews = array();
        if (is_array($rows)) {
            foreach ($rows as $r) {
                $reviews[] = array(
                    'author' => $r['author_name'],
                    'rating' => (int) $r['rating'],
                    'title' => $r['title'],
                    'body' => $r['body'],
                    'source' => $r['source'],
                    'stay' => $r['stay_from'] ? substr($r['stay_from'], 0, 10) : null,
                );
            }
        }

        $this->ajaxDie(json_encode(array('reviews' => $reviews)));
    }
}
