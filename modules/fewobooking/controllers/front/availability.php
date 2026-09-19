<?php


class FewobookingAvailabilityModuleFrontController extends ModuleFrontController
{
    public function initContent()
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: public, max-age=300');

        $today = date('Y-m-d');
        $sql = 'SELECT date_from, date_to
            FROM `' . _DB_PREFIX_ . 'htl_booking_detail`
            WHERE `is_back_order` = 0 AND `is_refunded` = 0
              AND `date_to` >= \'' . pSQL($today) . '\'
              AND `date_from` <= \'' . pSQL(date('Y-m-d', strtotime('+18 months'))) . '\'
            ORDER BY `date_from` ASC';

        $rows = Db::getInstance(_PS_USE_SQL_SLAVE_)->executeS($sql);
        $events = array();
        if (is_array($rows)) {
            foreach ($rows as $row) {
                $events[] = array(
                    'start' => $row['date_from'],
                    'end' => date('Y-m-d', strtotime($row['date_to'] . ' +1 day')),
                    'display' => 'background',
                    'backgroundColor' => '#B9C9C2',
                );
            }
        }

        $this->ajaxDie(json_encode(array('events' => $events)));
    }
}
