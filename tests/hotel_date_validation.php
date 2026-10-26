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
