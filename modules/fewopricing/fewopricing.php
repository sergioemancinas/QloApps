<?php
/**
 * FeWo Pricing Module
 * Custom pricing rules for Fewo Lauscha
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class FewoPricing extends Module
{
    const RATE_OPTION_STANDARD = 'standard';
    const RATE_OPTION_NONREF = 'nonref';
    const DEFAULT_CHARGEABLE_GUESTS = 2;
    const DEFAULT_UNDER3_GUESTS = 0;
    const MAX_TOTAL_GUESTS = 4;

    public function __construct()
    {
        $this->name = 'fewopricing';
        $this->tab = 'pricing_promotion';
        $this->version = '1.0.0';
        $this->author = 'FeWo Lauscha';
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('FeWo Pricing');
        $this->description = $this->l('Custom pricing rules for Fewo Lauscha based on guests and stay length.');
    }

    public function install()
    {
        return parent::install()
            && $this->registerHook('displayHeader')
            && $this->registerHook('displayRoomTypeBookingFormFieldsBefore')
            && $this->registerHook('actionRoomTypeTotalPriceModifier')
            && Configuration::updateValue('FEWO_PRICING_ROOM_TYPE_ID', 1)
            && Configuration::updateValue('FEWO_PRICING_DEFAULT_RATE', self::RATE_OPTION_STANDARD);
    }

    public function uninstall()
    {
        return Configuration::deleteByName('FEWO_PRICING_ROOM_TYPE_ID')
            && Configuration::deleteByName('FEWO_PRICING_DEFAULT_RATE')
            && parent::uninstall();
    }

    public function hookDisplayHeader($params)
    {
        $guestSelection = $this->getGuestSelection();
        $this->context->controller->addJS($this->_path . 'views/js/fewo-pricing.js');
        $this->context->controller->addCSS($this->_path . 'views/css/fewo-pricing.css');

        Media::addJsDef([
            'fewoPricingDefault' => $this->getSelectedRateOption(),
            'fewoGuestChargeableDefault' => $guestSelection['chargeable'],
            'fewoGuestUnder3Default' => $guestSelection['under3'],
        ]);
    }

    public function hookDisplayRoomTypeBookingFormFieldsBefore($params)
    {
        if (empty($params['id_product'])) {
            return '';
        }

        if (!$this->isApplicableRoomType((int)$params['id_product'])) {
            return '';
        }

        $this->context->smarty->assign([
            'fewo_rate_selected' => $this->getSelectedRateOption(),
            'fewo_guest_chargeable_selected' => $this->getGuestSelectionChargeable(),
            'fewo_guest_under3_selected' => $this->getGuestSelectionUnder3(),
            'lang_iso' => $this->context->language ? $this->context->language->iso_code : 'en',
        ]);

        return $this->display(__FILE__, 'views/templates/hook/rate-selector.tpl');
    }

    public function hookActionRoomTypeTotalPriceModifier($params)
    {
        if (empty($params['id_room_type'])) {
            return;
        }

        $idRoomType = (int) $params['id_room_type'];
        if (!$this->isApplicableRoomType($idRoomType)) {
            return;
        }

        $rateOption = '';
        if (isset($params['rate_plan_code']) && $params['rate_plan_code'] !== '') {
            $rateOption = $this->normalizeRateOption($params['rate_plan_code']);
        }
        if (isset($params['rate_option']) && $params['rate_option'] !== '') {
            $rateOption = $this->normalizeRateOption($params['rate_option']);
        }
        if (!$rateOption) {
            $rateOption = $this->getSelectedRateOption();
        }
        $nights = $this->getNightCount($params['date_from'], $params['date_to']);
        if ($nights < 1) {
            return;
        }

        $quantity = !empty($params['quantity']) ? (int) $params['quantity'] : 1;
        if ($quantity < 1) {
            $quantity = 1;
        }

        $occupancy = isset($params['occupancy']) ? $params['occupancy'] : null;
        $occupancyRows = $this->normalizeOccupancyRows($occupancy);
        if (empty($occupancyRows)) {
            $guestSelection = $this->getGuestSelection();
            $occupancy = $this->buildOccupancyFromSelection(
                $guestSelection['chargeable'],
                $guestSelection['under3'],
                $quantity
            );
        } else {
            $occupancy = $occupancyRows;
        }

        $roomGuestCounts = $this->getChargeableGuestsPerRoom(
            $occupancy,
            $quantity
        );

        $totalTaxInclAllRooms = 0.0;
        foreach ($roomGuestCounts as $roomGuestCount) {
            $tier = ($roomGuestCount <= 2) ? 'two' : 'four';
            $rate = $this->getRateForStay($rateOption, $tier, $nights);
            $totalTaxInclAllRooms += $rate['per_night'] * $nights;
        }

        // Core pricing multiplies by quantity after this hook. Keep per-unit values here.
        $totalTaxIncl = $totalTaxInclAllRooms / $quantity;
        $taxRate = isset($params['tax_rate']) ? (float) $params['tax_rate'] : 0.0;
        $totalTaxExcl = $taxRate > 0 ? ($totalTaxIncl / (1 + ($taxRate / 100))) : $totalTaxIncl;

        $params['total_prices']['total_price_tax_incl'] = Tools::ps_round($totalTaxIncl, _PS_PRICE_COMPUTE_PRECISION_);
        $params['total_prices']['total_price_tax_excl'] = Tools::ps_round($totalTaxExcl, _PS_PRICE_COMPUTE_PRECISION_);
    }

    private function isApplicableRoomType($idRoomType)
    {
        $configuredId = (int) Configuration::get('FEWO_PRICING_ROOM_TYPE_ID');
        if ($configuredId <= 0) {
            return true;
        }
        return (int) $configuredId === (int) $idRoomType;
    }

    private function getSelectedRateOption()
    {
        $rate = Tools::getValue('fewo_rate_option');
        if (!$rate && isset($this->context->cookie->fewo_rate_option)) {
            $rate = $this->context->cookie->fewo_rate_option;
        }
        if (!$rate) {
            $rate = Configuration::get('FEWO_PRICING_DEFAULT_RATE');
        }

        $rate = $this->normalizeRateOption($rate);
        if (isset($this->context->cookie)) {
            $this->context->cookie->fewo_rate_option = $rate;
        }
        return $rate;
    }

    private function normalizeRateOption($rate)
    {
        $rate = Tools::strtolower(trim((string) $rate));

        if (in_array($rate, ['nonref', 'nonrefundable', 'non_refundable', 'non-refundable'], true)) {
            return self::RATE_OPTION_NONREF;
        }

        if (in_array($rate, ['standard', 'refundable', 'flex', 'flexible'], true)) {
            return self::RATE_OPTION_STANDARD;
        }

        return self::RATE_OPTION_STANDARD;
    }

    private function getNightCount($dateFrom, $dateTo)
    {
        try {
            $start = new DateTime($dateFrom);
            $end = new DateTime($dateTo);
        } catch (Exception $e) {
            return 0;
        }

        if ($end <= $start) {
            return 0;
        }

        $diff = $start->diff($end);
        $nights = (int) $diff->days;
        return max(1, $nights);
    }

    private function getGuestSelectionChargeable()
    {
        $selection = $this->getGuestSelection();

        return $selection['chargeable'];
    }

    private function getGuestSelectionUnder3()
    {
        $selection = $this->getGuestSelection();

        return $selection['under3'];
    }

    private function getGuestSelection()
    {
        $selection = null;

        $chargeable = Tools::getValue('fewo_chargeable_guests', null);
        $under3 = Tools::getValue('fewo_under3_guests', null);
        if ($chargeable !== null || $under3 !== null) {
            $selection = $this->normalizeGuestSelection([
                'chargeable' => $this->sanitizeChargeableGuests($chargeable),
                'under3' => $this->sanitizeUnder3Guests($under3),
            ]);
        }

        if ($selection === null) {
            $occupancy = Tools::getValue('occupancy', null);
            if ($occupancy === null && isset($_REQUEST['occupancy'])) {
                $occupancy = $_REQUEST['occupancy'];
            }

            $selection = $this->deriveGuestSelectionFromOccupancy($occupancy);
        }

        if ($selection === null) {
            $cookieChargeable = isset($this->context->cookie->fewo_chargeable_guests)
                ? $this->context->cookie->fewo_chargeable_guests
                : self::DEFAULT_CHARGEABLE_GUESTS;
            $cookieUnder3 = isset($this->context->cookie->fewo_under3_guests)
                ? $this->context->cookie->fewo_under3_guests
                : self::DEFAULT_UNDER3_GUESTS;

            $selection = $this->normalizeGuestSelection([
                'chargeable' => $this->sanitizeChargeableGuests($cookieChargeable),
                'under3' => $this->sanitizeUnder3Guests($cookieUnder3),
            ]);
        }

        if (isset($this->context->cookie)) {
            $this->context->cookie->fewo_chargeable_guests = $selection['chargeable'];
            $this->context->cookie->fewo_under3_guests = $selection['under3'];
        }

        return $selection;
    }

    private function normalizeGuestSelection(array $selection)
    {
        $chargeable = $this->sanitizeChargeableGuests(
            isset($selection['chargeable']) ? $selection['chargeable'] : self::DEFAULT_CHARGEABLE_GUESTS
        );
        $under3 = $this->sanitizeUnder3Guests(
            isset($selection['under3']) ? $selection['under3'] : self::DEFAULT_UNDER3_GUESTS
        );

        $maxUnder3 = max(0, self::MAX_TOTAL_GUESTS - $chargeable);
        if ($under3 > $maxUnder3) {
            $under3 = $maxUnder3;
        }

        return [
            'chargeable' => $chargeable,
            'under3' => $under3,
        ];
    }

    private function deriveGuestSelectionFromOccupancy($occupancy)
    {
        $rooms = $this->normalizeOccupancyRows($occupancy);
        if (empty($rooms)) {
            return null;
        }

        $firstRoom = reset($rooms);
        $adults = isset($firstRoom['adults']) ? max(1, (int) $firstRoom['adults']) : 1;
        $children = isset($firstRoom['children']) ? max(0, (int) $firstRoom['children']) : 0;
        $childAges = isset($firstRoom['child_ages']) ? $this->normalizeChildAges($firstRoom['child_ages']) : [];

        $under3 = 0;
        $chargeableChildren = 0;
        for ($index = 0; $index < $children; $index++) {
            if (array_key_exists($index, $childAges)) {
                if ((int) $childAges[$index] < 3) {
                    $under3++;
                } else {
                    $chargeableChildren++;
                }
            } else {
                // Unknown age is treated as chargeable.
                $chargeableChildren++;
            }
        }

        return $this->normalizeGuestSelection([
            'chargeable' => $this->sanitizeChargeableGuests($adults + $chargeableChildren),
            'under3' => $this->sanitizeUnder3Guests($under3),
        ]);
    }

    private function sanitizeChargeableGuests($value)
    {
        $value = (int) $value;
        if ($value < 1) {
            $value = self::DEFAULT_CHARGEABLE_GUESTS;
        }

        return min(4, $value);
    }

    private function sanitizeUnder3Guests($value)
    {
        $value = (int) $value;
        if ($value < 0) {
            $value = self::DEFAULT_UNDER3_GUESTS;
        }

        return min(4, $value);
    }

    private function buildOccupancyFromSelection($chargeableGuests, $under3Guests, $quantity)
    {
        $quantity = max(1, (int) $quantity);
        $guestSelection = $this->normalizeGuestSelection([
            'chargeable' => $chargeableGuests,
            'under3' => $under3Guests,
        ]);
        $chargeableGuests = $guestSelection['chargeable'];
        $under3Guests = $guestSelection['under3'];
        $childAges = array_fill(0, $under3Guests, 0);

        $occupancies = [];
        for ($index = 0; $index < $quantity; $index++) {
            $occupancies[] = [
                'adults' => $chargeableGuests,
                'children' => $under3Guests,
                'child_ages' => $childAges,
            ];
        }

        return $occupancies;
    }

    private function decodeOccupancyPayload($occupancy)
    {
        if (is_array($occupancy)) {
            return $occupancy;
        }

        if (is_object($occupancy)) {
            return (array) $occupancy;
        }

        if (is_string($occupancy)) {
            $occupancy = trim($occupancy);
            if ($occupancy === '') {
                return [];
            }

            $decoded = json_decode($occupancy, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        return [];
    }

    private function getChargeableGuestsPerRoom($occupancy, $quantity)
    {
        $rooms = $this->normalizeOccupancyRows($occupancy);
        if (empty($rooms)) {
            return array_fill(0, max(1, (int) $quantity), 2);
        }

        $guestCounts = [];
        foreach ($rooms as $room) {
            $adults = isset($room['adults']) ? max(0, (int) $room['adults']) : 0;
            $children = isset($room['children']) ? max(0, (int) $room['children']) : 0;
            $childAges = isset($room['child_ages']) ? $this->normalizeChildAges($room['child_ages']) : [];

            $chargeableChildren = 0;
            for ($index = 0; $index < $children; $index++) {
                if (array_key_exists($index, $childAges)) {
                    $age = (int) $childAges[$index];
                    if ($age >= 3) {
                        $chargeableChildren++;
                    }
                } else {
                    // Unknown age is treated as chargeable.
                    $chargeableChildren++;
                }
            }

            $guestCounts[] = max(1, $adults + $chargeableChildren);
        }

        if (empty($guestCounts)) {
            return array_fill(0, max(1, (int) $quantity), 2);
        }

        $quantity = max(1, (int) $quantity);
        if (count($guestCounts) > $quantity) {
            $guestCounts = array_slice($guestCounts, 0, $quantity);
        } elseif (count($guestCounts) < $quantity) {
            $padValue = end($guestCounts);
            while (count($guestCounts) < $quantity) {
                $guestCounts[] = $padValue;
            }
        }

        return $guestCounts;
    }

    private function normalizeOccupancyRows($occupancy)
    {
        $occupancy = $this->decodeOccupancyPayload($occupancy);
        if (!is_array($occupancy) || empty($occupancy)) {
            return [];
        }

        if (array_key_exists('adults', $occupancy) || array_key_exists('children', $occupancy)) {
            return [$occupancy];
        }

        $rows = [];
        foreach ($occupancy as $room) {
            if (!is_array($room)) {
                continue;
            }
            if (!array_key_exists('adults', $room) && !array_key_exists('children', $room)) {
                continue;
            }
            $rows[] = $room;
        }

        return $rows;
    }

    private function normalizeChildAges($childAges)
    {
        if (is_object($childAges)) {
            $childAges = (array) $childAges;
        }

        if (!is_array($childAges)) {
            return [];
        }

        return array_values($childAges);
    }

    private function getRateForStay($rateOption, $tier, $nights)
    {
        $isWeekly = $nights >= 7;

        $rates = [
            'standard' => [
                'two' => [
                    'daily' => 190.00,
                    'weekly' => 997.50,
                ],
                'four' => [
                    'daily' => 200.00,
                    'weekly' => 1050.00,
                ],
            ],
            'nonref' => [
                'two' => [
                    'daily' => 152.00,
                    'weekly' => 798.00,
                ],
                'four' => [
                    'daily' => 160.00,
                    'weekly' => 840.00,
                ],
            ],
        ];

        $rateOption = in_array($rateOption, [self::RATE_OPTION_STANDARD, self::RATE_OPTION_NONREF], true)
            ? $rateOption
            : self::RATE_OPTION_STANDARD;
        $tier = $tier === 'two' ? 'two' : 'four';

        if ($isWeekly) {
            $perNight = $rates[$rateOption][$tier]['weekly'] / 7;
            return [
                'per_night' => $perNight,
                'label' => 'weekly',
            ];
        }

        return [
            'per_night' => $rates[$rateOption][$tier]['daily'],
            'label' => 'daily',
        ];
    }
}
