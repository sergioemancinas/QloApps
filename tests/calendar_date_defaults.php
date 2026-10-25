<?php
// Exercise the real date defaults without booting the database-backed controllers.
$root = isset($argv[1]) ? rtrim($argv[1], '/') : dirname(__DIR__);
$files = array(
    'modules/wkhotelroom/wkhotelroom.php' => 1,
    'modules/hotelreservationsystem/controllers/admin/AdminHotelFeaturePricesSettings.php' => 1,
    'controllers/front/CategoryController.php' => 3,
    'modules/wkhotelfilterblock/wkhotelfilterblock.php' => 2,
);
$cases = array(
    '2026-10-25' => '2026-10-26',
    '2026-03-29' => '2026-03-30',
    '2027-10-31' => '2027-11-01',
    '2027-03-28' => '2027-03-29',
    '2026-10-24' => '2026-10-25',
    '2026-12-31' => '2027-01-01',
    '2028-02-28' => '2028-02-29',
    '2028-02-29' => '2028-03-01',
);
// Only schema constants are needed; the date-range method makes no DB calls with dlt_date=0.
class ObjectModel
{
    const TYPE_INT = 1;
    const TYPE_STRING = 2;
    const TYPE_DATE = 3;
    const TYPE_FLOAT = 4;
}
require $root.'/modules/hotelreservationsystem/classes/HotelBookingDetail.php';
$booking = (new ReflectionClass('HotelBookingDetail'))->newInstanceWithoutConstructor();
$originalTimezone = date_default_timezone_get();
$checks = 0;
try {
    foreach ($files as $file => $expectedExpressions) {
        $source = file_get_contents($root.'/'.$file);
        $pattern = '/\$(?:dateTo|date_to) = (date\(\'Y-m-d(?: H:i:s)?\', [^;\n]+\));/';
        preg_match_all($pattern, $source, $matches);
        $expressions = array_filter($matches[1], function ($expression) {
            return strpos($expression, '$dateFrom') !== false || strpos($expression, '$date_from') !== false;
        });
        if (count($expressions) !== $expectedExpressions) {
            throw new RuntimeException('Unexpected date-default coverage in '.$file);
        }
        foreach (array('Europe/Berlin', 'Europe/Paris', 'UTC') as $timezone) {
            date_default_timezone_set($timezone);
            foreach ($cases as $dateFrom => $expected) {
                $date_from = $dateFrom;
                foreach ($expressions as $expression) {
                    // The expression is trusted repository code, not request input.
                    $dateTo = eval('return '.$expression.';');
                    $nights = (new DateTime($dateFrom))->diff(new DateTime($dateTo))->days;
                    if (substr($dateTo, 0, 10) !== $expected || $nights !== 1) {
                        throw new RuntimeException($file.': '.$timezone.' '.$dateFrom.' -> '.$dateTo);
                    }
                    ++$checks;
                }
            }
        }
    }
    foreach (array('Europe/Berlin', 'Europe/Paris', 'UTC') as $timezone) {
        date_default_timezone_set($timezone);
        foreach ($cases as $dateFrom => $dateTo) {
            $first = (new DateTime($dateFrom))->format('Y-M-d');
            $last = (new DateTime($dateTo))->format('Y-M-d');
            foreach (array(0, 1) as $excludeCheckout) {
                $expected = $excludeCheckout ? array($first) : array($first, $last);
                $actual = $booking->createDateRangeArray($dateFrom, $dateTo, $excludeCheckout, 0, 0);
                if ($actual !== $expected) {
                    throw new RuntimeException('Date range: '.$timezone.' '.$dateFrom.' -> '.$dateTo);
                }
                ++$checks;
            }
        }
    }
} finally {
    date_default_timezone_set($originalTimezone);
}
echo 'Calendar dates and booking ranges: '.$checks." checks passed\n";
