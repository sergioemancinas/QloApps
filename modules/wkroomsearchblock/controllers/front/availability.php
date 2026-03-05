<?php
/**
* NOTICE OF LICENSE
*
* This source file is subject to the Open Software License version 3.0
* that is bundled with this package in the file LICENSE.md
* It is also available through the world-wide-web at this URL:
* https://opensource.org/license/osl-3-0-php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to support@qloapps.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade this module to a newer
* versions in the future. If you wish to customize this module for your needs
* please refer to https://store.webkul.com/customisation-guidelines for more information.
*
* @author Webkul IN
* @copyright Since 2010 Webkul
* @license https://opensource.org/license/osl-3-0-php Open Software License version 3.0
*/

class WkRoomSearchBlockAvailabilityModuleFrontController extends ModuleFrontController
{
    public function initContent()
    {
        $this->display_column_left = false;
        $this->display_column_right = false;

        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            header('Pragma: no-cache');
        }

        $result = array(
            'status' => false,
            'unavailable_dates' => array(),
        );

        $requestMethod = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : '';
        if ('POST' !== $requestMethod) {
            $result['error'] = 'Invalid method.';
            $this->ajaxDie(json_encode($result));
        }

        $idHotel = (int) Tools::getValue('id_hotel');
        $hotelCatId = (int) Tools::getValue('hotel_cat_id');
        if (!$idHotel && $hotelCatId) {
            $idHotel = (int) HotelBranchInformation::getHotelIdByIdCategory($hotelCatId);
        }

        if ($idHotel && $hotelCatId) {
            $mappedHotelId = (int) HotelBranchInformation::getHotelIdByIdCategory($hotelCatId);
            if ($mappedHotelId && $mappedHotelId !== $idHotel) {
                $result['error'] = 'Invalid hotel selection.';
                $this->ajaxDie(json_encode($result));
            }
        }

        if (!$idHotel) {
            $result['error'] = 'Missing hotel.';
            $this->ajaxDie(json_encode($result));
        }

        $dateFrom = Tools::getValue('date_from');
        $dateTo = Tools::getValue('date_to');

        if (!Validate::isDate($dateFrom)) {
            $dateFrom = date('Y-m-d');
        }

        if (!Validate::isDate($dateTo)) {
            $dateTo = date('Y-m-d', strtotime($dateFrom . ' +365 day'));
        }

        if (strtotime($dateTo) <= strtotime($dateFrom)) {
            $dateTo = date('Y-m-d', strtotime($dateFrom . ' +365 day'));
        }

        // Keep request bounded for performance and abuse resistance.
        if ((strtotime($dateTo) - strtotime($dateFrom)) > (365 * 86400)) {
            $dateTo = date('Y-m-d', strtotime($dateFrom . ' +365 day'));
        }

        $totalRooms = (int) Db::getInstance()->getValue(
            'SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'htl_room_information`
             WHERE `id_hotel` = ' . (int) $idHotel . '
               AND `id_status` != ' . (int) HotelRoomInformation::STATUS_INACTIVE
        );

        if ($totalRooms < 1) {
            $result['status'] = true;
            $this->ajaxDie(json_encode($result));
        }

        $dateRoomUsage = array();
        $this->appendBookedRooms($dateRoomUsage, $idHotel, $dateFrom, $dateTo);
        $this->appendTemporarilyInactiveRooms($dateRoomUsage, $idHotel, $dateFrom, $dateTo);

        $unavailableDates = array();
        foreach ($dateRoomUsage as $dateKey => $usedRooms) {
            if (count($usedRooms) >= $totalRooms) {
                $unavailableDates[] = $dateKey;
            }
        }
        sort($unavailableDates);

        $result['status'] = true;
        $result['unavailable_dates'] = $unavailableDates;
        $result['date_from'] = $dateFrom;
        $result['date_to'] = $dateTo;
        $result['total_rooms'] = $totalRooms;
        $this->ajaxDie(json_encode($result));
    }

    protected function appendBookedRooms(&$dateRoomUsage, $idHotel, $dateFrom, $dateTo)
    {
        $effectiveEndExpr = 'IF(`id_status` = ' . (int) HotelBookingDetail::STATUS_CHECKED_OUT . ', `check_out`, `date_to`)';
        $rows = Db::getInstance()->executeS(
            'SELECT `id_room`, `date_from`, ' . $effectiveEndExpr . ' AS `date_to`
             FROM `' . _DB_PREFIX_ . 'htl_booking_detail`
             WHERE `id_hotel` = ' . (int) $idHotel . '
               AND `is_back_order` = 0
               AND `is_refunded` = 0
               AND `date_from` < \'' . pSQL($dateTo) . '\'
               AND ' . $effectiveEndExpr . ' > \'' . pSQL($dateFrom) . '\''
        );

        if (!$rows) {
            return;
        }

        foreach ($rows as $row) {
            $this->addRoomRangeUsage(
                $dateRoomUsage,
                (int) $row['id_room'],
                $row['date_from'],
                $row['date_to'],
                $dateFrom,
                $dateTo
            );
        }
    }

    protected function appendTemporarilyInactiveRooms(&$dateRoomUsage, $idHotel, $dateFrom, $dateTo)
    {
        $rows = Db::getInstance()->executeS(
            'SELECT hrdd.`id_room`, hrdd.`date_from`, hrdd.`date_to`
             FROM `' . _DB_PREFIX_ . 'htl_room_disable_dates` hrdd
             INNER JOIN `' . _DB_PREFIX_ . 'htl_room_information` hri
                 ON (hri.`id` = hrdd.`id_room` AND hri.`id_product` = hrdd.`id_room_type`)
             WHERE hri.`id_hotel` = ' . (int) $idHotel . '
               AND hri.`id_status` = ' . (int) HotelRoomInformation::STATUS_TEMPORARY_INACTIVE . '
               AND hrdd.`date_from` < \'' . pSQL($dateTo) . '\'
               AND hrdd.`date_to` > \'' . pSQL($dateFrom) . '\''
        );

        if (!$rows) {
            return;
        }

        foreach ($rows as $row) {
            $this->addRoomRangeUsage(
                $dateRoomUsage,
                (int) $row['id_room'],
                $row['date_from'],
                $row['date_to'],
                $dateFrom,
                $dateTo
            );
        }
    }

    protected function addRoomRangeUsage(&$dateRoomUsage, $idRoom, $rangeFrom, $rangeTo, $searchFrom, $searchTo)
    {
        $rangeFromTs = strtotime($rangeFrom);
        $rangeToTs = strtotime($rangeTo);
        $searchFromTs = strtotime($searchFrom);
        $searchToTs = strtotime($searchTo);

        if (!$idRoom || !$rangeFromTs || !$rangeToTs || !$searchFromTs || !$searchToTs) {
            return;
        }

        $start = max($rangeFromTs, $searchFromTs);
        $end = min($rangeToTs, $searchToTs);

        if ($end <= $start) {
            return;
        }

        for ($day = $start; $day < $end; $day = strtotime('+1 day', $day)) {
            $dateKey = date('Y-m-d', $day);
            if (!isset($dateRoomUsage[$dateKey])) {
                $dateRoomUsage[$dateKey] = array();
            }
            $dateRoomUsage[$dateKey][$idRoom] = true;
        }
    }
}
