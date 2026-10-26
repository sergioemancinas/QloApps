<?php
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
$root = isset($argv[1]) ? rtrim($argv[1], '/') : dirname(__DIR__);
require $root.'/classes/Validate.php';
class Validate extends ValidateCore {}
class HotelOrderRestrictDate
{
    public static $offset = 0;
    public static function getMinimumBookingOffset($hotel) { return self::$offset; }
    public static function getMaxOrderDate($hotel) { return date('Y-m-d', strtotime('+3 years')); }
}
class Hook
{
    public static function exec($name, $params) {}
}
require $root.'/modules/hotelreservationsystem/classes/HotelHelper.php';
$checks = 0;
$check = function ($passed, $label) use (&$checks) {
    if (!$passed) { throw new RuntimeException($label); }
    ++$checks;
};
$original = date_default_timezone_get();
try {
    foreach (['Europe/Berlin', 'Europe/Paris', 'UTC'] as $timezone) {
        date_default_timezone_set($timezone);
        $from = date('Y-m-d', strtotime('+14 days'));
        $to = date('Y-m-d', strtotime('+15 days'));
        foreach ([[], [$from], ['value' => $from], true, 123, new stdClass(), '2030-02-30', 'tomorrow', 'nonsense'] as $bad) {
            $check(HotelHelper::validateDateRangeForHotel($bad, $to, 1) === false, 'Invalid arrival was not rejected: '.$timezone);
            $check(HotelHelper::validateDateRangeForHotel($from, $bad, 1) === false, 'Invalid checkout was not rejected: '.$timezone);
        }
        foreach ([[false, false], ['', ''], [$from, false], [false, $to], [$from, $to], [$from.' 00:00:00', $to.' 00:00:00']] as $pair) {
            $check(HotelHelper::validateDateRangeForHotel($pair[0], $pair[1], 1) === true, 'Valid/default dates rejected: '.$timezone);
        }
        $today = date('Y-m-d');
        $tomorrow = date('Y-m-d', strtotime('+1 day'));
        $check(HotelHelper::validateDateRangeForHotel(false, $today, 1) === false, 'Missing arrival allowed zero-night checkout');
        $check(HotelHelper::validateDateRangeForHotel(false, $tomorrow, 1) === true, 'Missing arrival rejected tomorrow checkout');
        $filter = file_get_contents($root.'/modules/wkhotelfilterblock/wkhotelfilterblock.php');
        if (!preg_match('/\$date_from = (date\([^;\n]+\));/', $filter, $default)) {
            throw new RuntimeException('Room-filter arrival default missing');
        }
        $filterFrom = eval('return '.$default[1].';');
        $check(HotelHelper::getNumberOfDays($filterFrom, $tomorrow) === 1, 'Room-filter default made zero-night partial stay');
        $check(HotelHelper::validateDateRangeForHotel($from.' 16:00:00', $to.' 10:00:00', 1) === false, 'Sub-day overnight stay accepted');
        $check(HotelHelper::validateDateRangeForHotel(false, $today.' 12:00:00', 1) === false, 'Sub-day checkout-only stay accepted');
        $check(HotelHelper::validateDateRangeForHotel($from.' 16:00:00', false, 1) === false, 'Sub-day arrival-only default accepted');
        $check(HotelHelper::validateDateRangeForHotel($from.' 16:00:00', $to.' 16:00:00', 1) === true, 'Full-day datetime stay rejected');
        $check(HotelHelper::validateDateRangeForHotel($from.' 99:00:00', $to, 1) === false, 'Invalid arrival time accepted');
        $check(HotelHelper::validateDateRangeForHotel($from, $to.' 99:00:00', 1) === false, 'Invalid departure time accepted');
        $spring = date('Y-m-d', strtotime('last sunday of march '.((int) date('Y') + 1)));
        $check(HotelHelper::validateDateRangeForHotel($spring.' 00:00:00', date('Y-m-d', strtotime($spring.' +1 day')).' 00:00:00', 1) === true, 'Spring DST calendar night rejected');
        $check(HotelHelper::validateDateRangeForHotel($to, $from, 1) === false, 'Reversed stay accepted');
        $check(HotelHelper::validateDateRangeForHotel($from, $from, 1) === false, 'Zero-night stay accepted');
        $check(HotelHelper::validateDateRangeForHotel(date('Y-m-d', strtotime('-1 day')), $to, 1) === false, 'Past arrival accepted');
        HotelOrderRestrictDate::$offset = 2;
        $check(HotelHelper::validateDateRangeForHotel(date('Y-m-d'), $to, 1) === false, 'Minimum booking offset ignored');
        HotelOrderRestrictDate::$offset = 0;
    }
} finally {
    date_default_timezone_set($original);
}
echo 'Hotel date input validation: '.$checks." checks passed\n";
