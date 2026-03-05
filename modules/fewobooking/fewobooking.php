<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class FewoBooking extends Module
{
    const CONFIG_ENABLED = 'FEWO_BOOKING_CONFIRM_ENABLED';
    const CONFIG_SUBJECT = 'FEWO_BOOKING_CONFIRM_SUBJECT';
    const CONFIG_INSTRUCTIONS = 'FEWO_BOOKING_INSTRUCTIONS';
    const CONFIG_SLACK_ENABLED = 'FEWO_BOOKING_SLACK_ENABLED';
    const CONFIG_SLACK_WEBHOOK = 'FEWO_BOOKING_SLACK_WEBHOOK';

    public function __construct()
    {
        $this->name = 'fewobooking';
        $this->tab = 'administration';
        $this->version = '1.0.0';
        $this->author = 'FeWo Lauscha';
        $this->need_instance = 0;
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('FeWo Booking Confirmations');
        $this->description = $this->l('Send booking confirmations with house instructions and calendar invite.');
    }

    public function install()
    {
        $languages = Language::getLanguages(false);
        $subjectDefaults = $this->getDefaultSubjectByLang($languages);
        $instructionDefaults = $this->getDefaultInstructionsByLang($languages);

        return parent::install()
            && $this->registerHook('paymentConfirm')
            && Configuration::updateValue(self::CONFIG_ENABLED, 1)
            && Configuration::updateValue(self::CONFIG_SUBJECT, $subjectDefaults)
            && Configuration::updateValue(self::CONFIG_INSTRUCTIONS, $instructionDefaults, true)
            && Configuration::updateValue(self::CONFIG_SLACK_ENABLED, 0)
            && Configuration::updateValue(self::CONFIG_SLACK_WEBHOOK, '');
    }

    public function uninstall()
    {
        Configuration::deleteByName(self::CONFIG_ENABLED);
        Configuration::deleteByName(self::CONFIG_SUBJECT);
        Configuration::deleteByName(self::CONFIG_INSTRUCTIONS);
        Configuration::deleteByName(self::CONFIG_SLACK_ENABLED);
        Configuration::deleteByName(self::CONFIG_SLACK_WEBHOOK);

        return parent::uninstall();
    }

    public function getContent()
    {
        if (Tools::isSubmit('submitFewoBooking')) {
            $enabled = (int) Tools::getValue(self::CONFIG_ENABLED);
            $slackEnabled = (int) Tools::getValue(self::CONFIG_SLACK_ENABLED);
            $slackWebhook = trim((string) Tools::getValue(self::CONFIG_SLACK_WEBHOOK));
            $languages = Language::getLanguages(false);
            $defaultLang = (int) Configuration::get('PS_LANG_DEFAULT');
            $subjectValues = array();
            $instructionValues = array();

            foreach ($languages as $lang) {
                $langId = (int) $lang['id_lang'];
                $subjectValues[$langId] = trim((string) Tools::getValue(self::CONFIG_SUBJECT . '_' . $langId));
                $instructionValues[$langId] = trim((string) Tools::getValue(self::CONFIG_INSTRUCTIONS . '_' . $langId));
            }

            if ($subjectValues[$defaultLang] === '') {
                $this->_html .= $this->displayError($this->l('Email subject is required for the default language.'));
            } else {
                Configuration::updateValue(self::CONFIG_ENABLED, $enabled);
                Configuration::updateValue(self::CONFIG_SUBJECT, $subjectValues);
                Configuration::updateValue(self::CONFIG_INSTRUCTIONS, $instructionValues, true);
                Configuration::updateValue(self::CONFIG_SLACK_ENABLED, $slackEnabled);
                Configuration::updateValue(self::CONFIG_SLACK_WEBHOOK, $slackWebhook);
                $this->_html .= $this->displayConfirmation($this->l('Settings updated.'));
            }
        }

        return $this->_html . $this->renderForm();
    }

    protected function renderForm()
    {
        $defaultLang = (int) Configuration::get('PS_LANG_DEFAULT');

        $fieldsForm = array(
            'form' => array(
                'legend' => array(
                    'title' => $this->l('Booking confirmation email'),
                    'icon' => 'icon-envelope'
                ),
                'input' => array(
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Enable confirmation email'),
                        'name' => self::CONFIG_ENABLED,
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'enabled_on',
                                'value' => 1,
                                'label' => $this->l('Enabled')
                            ),
                            array(
                                'id' => 'enabled_off',
                                'value' => 0,
                                'label' => $this->l('Disabled')
                            )
                        ),
                    ),
                    array(
                        'type' => 'text',
                        'label' => $this->l('Email subject'),
                        'name' => self::CONFIG_SUBJECT,
                        'lang' => true,
                        'required' => true,
                    ),
                    array(
                        'type' => 'textarea',
                        'label' => $this->l('House instructions (PDF)'),
                        'name' => self::CONFIG_INSTRUCTIONS,
                        'lang' => true,
                        'autoload_rte' => false,
                        'rows' => 12,
                        'cols' => 60,
                        'desc' => $this->l('This text is included in the PDF attached to the booking confirmation email.'),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Enable Slack notifications'),
                        'name' => self::CONFIG_SLACK_ENABLED,
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'slack_on',
                                'value' => 1,
                                'label' => $this->l('Enabled')
                            ),
                            array(
                                'id' => 'slack_off',
                                'value' => 0,
                                'label' => $this->l('Disabled')
                            )
                        ),
                    ),
                    array(
                        'type' => 'text',
                        'label' => $this->l('Slack webhook URL'),
                        'name' => self::CONFIG_SLACK_WEBHOOK,
                        'required' => false,
                        'desc' => $this->l('Prefer setting FEWO_BOOKING_SLACK_WEBHOOK_URL at runtime; this value is used as fallback.'),
                    ),
                ),
                'submit' => array(
                    'title' => $this->l('Save'),
                )
            ),
        );

        $helper = new HelperForm();
        $helper->module = $this;
        $helper->name_controller = $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = AdminController::$currentIndex . '&configure=' . $this->name;
        $helper->default_form_language = $defaultLang;
        $helper->allow_employee_form_lang = $defaultLang;
        $helper->submit_action = 'submitFewoBooking';
        $helper->fields_value = $this->getConfigFieldsValues();

        return $helper->generateForm(array($fieldsForm));
    }

    protected function getConfigFieldsValues()
    {
        $languages = Language::getLanguages(false);
        $values = array(
            self::CONFIG_ENABLED => (int) Configuration::get(self::CONFIG_ENABLED),
            self::CONFIG_SLACK_ENABLED => (int) Configuration::get(self::CONFIG_SLACK_ENABLED),
            self::CONFIG_SLACK_WEBHOOK => (string) Configuration::get(self::CONFIG_SLACK_WEBHOOK),
        );

        foreach ($languages as $lang) {
            $langId = (int) $lang['id_lang'];
            $values[self::CONFIG_SUBJECT . '_' . $langId] = Tools::getValue(
                self::CONFIG_SUBJECT . '_' . $langId,
                Configuration::get(self::CONFIG_SUBJECT, $langId)
            );
            $values[self::CONFIG_INSTRUCTIONS . '_' . $langId] = Tools::getValue(
                self::CONFIG_INSTRUCTIONS . '_' . $langId,
                Configuration::get(self::CONFIG_INSTRUCTIONS, $langId)
            );
        }

        return $values;
    }

    protected function getDefaultSubjectByLang($languages)
    {
        $defaults = array(
            'en' => 'Your booking is confirmed',
            'de' => 'Ihre Buchung ist bestaetigt',
        );

        $values = array();
        foreach ($languages as $lang) {
            $iso = $lang['iso_code'];
            $values[(int) $lang['id_lang']] = isset($defaults[$iso]) ? $defaults[$iso] : $defaults['en'];
        }

        return $values;
    }

    protected function getDefaultInstructionsByLang($languages)
    {
        $defaults = array(
            'en' => "Welcome to Fewo Lauscha!\n\nHouse instructions:\n- Check-in and check-out times are included in your booking details.\n- Please keep quiet hours after 22:00.\n- Wood-fired outdoor sauna: use dry wood only and never leave it unattended.\n- Kitchen: please switch off stove/oven and close windows before leaving.\n- Waste separation: paper, plastics, and glass in separate bins.\n\nNeed help? Contact us anytime.",
            'de' => "Willkommen in der Fewo Lauscha!\n\nHausregeln:\n- Check-in- und Check-out-Zeiten finden Sie in Ihren Buchungsdetails.\n- Bitte beachten Sie die Ruhezeiten ab 22:00 Uhr.\n- Holzbefeuerte Aussensauna: nur trockenes Holz verwenden und nie unbeaufsichtigt lassen.\n- Kueche: Herd/Ofen ausschalten und Fenster schliessen.\n- Muelltrennung: Papier, Plastik und Glas getrennt entsorgen.\n\nBei Fragen helfen wir gerne.",
        );

        $values = array();
        foreach ($languages as $lang) {
            $iso = $lang['iso_code'];
            $values[(int) $lang['id_lang']] = isset($defaults[$iso]) ? $defaults[$iso] : $defaults['en'];
        }

        return $values;
    }

    public function hookPaymentConfirm($params)
    {
        if (!Configuration::get(self::CONFIG_ENABLED)) {
            return;
        }

        if (empty($params['id_order'])) {
            return;
        }

        $order = new Order((int) $params['id_order']);
        if (!Validate::isLoadedObject($order)) {
            return;
        }

        $customer = new Customer((int) $order->id_customer);
        if (!Validate::isLoadedObject($customer) || !Validate::isEmail($customer->email)) {
            return;
        }

        $bookingData = $this->getBookingData((int) $order->id);
        if (!$bookingData) {
            return;
        }

        $stay = $this->getStayRange($bookingData);
        $checkInTime = $this->getBookingTime($bookingData, 'check_in_time');
        $checkOutTime = $this->getBookingTime($bookingData, 'check_out_time');

        $hotelInfo = $this->getHotelInfo($bookingData, (int) $order->id_lang);
        $hotelName = $hotelInfo['name'];
        $hotelAddress = $hotelInfo['address'];
        $checkInTime = $checkInTime ?: $hotelInfo['check_in'];
        $checkOutTime = $checkOutTime ?: $hotelInfo['check_out'];

        $dateFrom = $stay['from'];
        $dateTo = $stay['to'];

        $formattedFrom = $dateFrom ? Tools::displayDate($dateFrom, (int) $order->id_lang) : '';
        $formattedTo = $dateTo ? Tools::displayDate($dateTo, (int) $order->id_lang) : '';

        if ($checkInTime === '') {
            $checkInTime = $this->l('See booking details');
        }
        if ($checkOutTime === '') {
            $checkOutTime = $this->l('See booking details');
        }

        $context = Context::getContext();
        $previousLang = isset($context->language) ? $context->language : null;
        $context->language = new Language((int) $order->id_lang);

        $attachments = array();
        $pdfContent = $this->generateInstructionsPdf(
            $order,
            $customer,
            $formattedFrom,
            $formattedTo,
            $checkInTime,
            $checkOutTime,
            $hotelName,
            $hotelAddress
        );
        if ($pdfContent) {
            $attachments[] = array(
                'content' => $pdfContent,
                'name' => 'house-instructions.pdf',
                'mime' => 'application/pdf',
            );
        }

        $icsContent = $this->generateIcs(
            $order,
            $customer,
            $dateFrom,
            $dateTo,
            $hotelName,
            $hotelAddress,
            $checkInTime,
            $checkOutTime
        );
        if ($icsContent) {
            $attachments[] = array(
                'content' => $icsContent,
                'name' => 'fewo-booking.ics',
                'mime' => 'text/calendar; charset=utf-8; method=PUBLISH',
            );
        }

        $subject = Configuration::get(self::CONFIG_SUBJECT, (int) $order->id_lang);
        if (!$subject) {
            $subject = $this->l('Your booking is confirmed');
        }

        $templateVars = array(
            '{firstname}' => $customer->firstname,
            '{lastname}' => $customer->lastname,
            '{order_reference}' => $order->reference,
            '{date_from}' => $formattedFrom,
            '{date_to}' => $formattedTo,
            '{hotel_name}' => $hotelName,
            '{check_in_time}' => $checkInTime,
            '{check_out_time}' => $checkOutTime,
        );

        Mail::Send(
            (int) $order->id_lang,
            'fewo_booking_confirm',
            $subject,
            $templateVars,
            $customer->email,
            trim($customer->firstname . ' ' . $customer->lastname),
            null,
            null,
            $attachments,
            null,
            _PS_MODULE_DIR_ . 'fewobooking/mails/'
        );

        if ($previousLang) {
            $context->language = $previousLang;
        }

        $this->sendSlackOrderNotification($order, $customer, $bookingData, $hotelInfo, 'booking_created');
        $this->sendSlackOrderNotification($order, $customer, $bookingData, $hotelInfo, 'payment_confirmed');
    }

    protected function getBookingData($orderId)
    {
        $path = _PS_MODULE_DIR_ . 'hotelreservationsystem/classes/HotelBookingDetail.php';
        if (file_exists($path)) {
            require_once $path;
        }

        $booking = new HotelBookingDetail();
        return $booking->getBookingDataByOrderId((int) $orderId);
    }

    protected function getStayRange($bookingData)
    {
        $from = null;
        $to = null;
        foreach ($bookingData as $row) {
            $rowFrom = $row['date_from'];
            $rowTo = $row['date_to'];
            if ($rowFrom && (!$from || strtotime($rowFrom) < strtotime($from))) {
                $from = $rowFrom;
            }
            if ($rowTo && (!$to || strtotime($rowTo) > strtotime($to))) {
                $to = $rowTo;
            }
        }

        return array('from' => $from, 'to' => $to);
    }

    protected function getBookingTime($bookingData, $field)
    {
        foreach ($bookingData as $row) {
            if (!empty($row[$field])) {
                return $row[$field];
            }
        }
        return '';
    }

    protected function getHotelInfo($bookingData, $idLang)
    {
        $hotelName = '';
        $addressText = '';
        $checkIn = '';
        $checkOut = '';

        $idHotel = 0;
        if (!empty($bookingData[0]['id_hotel'])) {
            $idHotel = (int) $bookingData[0]['id_hotel'];
        }

        $path = _PS_MODULE_DIR_ . 'hotelreservationsystem/classes/HotelBranchInformation.php';
        if ($idHotel && file_exists($path)) {
            require_once $path;
            $hotel = new HotelBranchInformation($idHotel, (int) $idLang);
            if (Validate::isLoadedObject($hotel)) {
                $hotelName = (string) $hotel->hotel_name;
                $checkIn = (string) $hotel->check_in;
                $checkOut = (string) $hotel->check_out;
                $address = HotelBranchInformation::getAddress($idHotel, (int) $idLang);
                if ($address) {
                    $parts = array();
                    if (!empty($address['address1'])) {
                        $parts[] = $address['address1'];
                    }
                    $cityParts = array();
                    if (!empty($address['postcode'])) {
                        $cityParts[] = $address['postcode'];
                    }
                    if (!empty($address['city'])) {
                        $cityParts[] = $address['city'];
                    }
                    if ($cityParts) {
                        $parts[] = implode(' ', $cityParts);
                    }
                    if (!empty($address['country'])) {
                        $parts[] = $address['country'];
                    }
                    $addressText = implode(', ', $parts);
                }
            }
        }

        if (!$hotelName && !empty($bookingData[0]['hotel_name'])) {
            $hotelName = $bookingData[0]['hotel_name'];
        }

        if (!$addressText && !empty($bookingData[0]['city'])) {
            $addressText = trim($bookingData[0]['city'] . ' ' . $bookingData[0]['zipcode']);
        }

        return array(
            'name' => $hotelName,
            'address' => $addressText,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
        );
    }

    protected function sendSlackOrderNotification($order, $customer, $bookingData, $hotelInfo, $eventType)
    {
        if (!(int) Configuration::get(self::CONFIG_SLACK_ENABLED)) {
            return;
        }

        $webhookUrl = trim((string) getenv('FEWO_BOOKING_SLACK_WEBHOOK_URL'));
        if ($webhookUrl === '') {
            $webhookUrl = trim((string) Configuration::get(self::CONFIG_SLACK_WEBHOOK));
        }
        if ($webhookUrl === '') {
            return;
        }

        $stay = $this->getStayRange($bookingData);
        $dateFrom = $stay['from'] ? $stay['from'] : '-';
        $dateTo = $stay['to'] ? $stay['to'] : '-';
        $guestSummary = $this->getGuestSummary($bookingData);

        $currencyCode = 'EUR';
        $currency = new Currency((int) $order->id_currency);
        if (Validate::isLoadedObject($currency) && !empty($currency->iso_code)) {
            $currencyCode = $currency->iso_code;
        }

        $hotelName = !empty($hotelInfo['name']) ? $hotelInfo['name'] : 'Fewo Lauscha';
        $customerName = trim($customer->firstname . ' ' . $customer->lastname);
        $orderRef = !empty($order->reference) ? $order->reference : ('#' . (int) $order->id);

        $eventLabel = ($eventType === 'payment_confirmed') ? 'Payment confirmed' : 'Booking created';
        $totalPaid = number_format((float) $order->total_paid, 2, '.', '');

        $text = sprintf(
            "*%s*\nOrder: `%s`\nCustomer: %s <%s>\nStay: %s -> %s\nGuests: %s\nTotal: %s %s\nProperty: %s",
            $eventLabel,
            $orderRef,
            $customerName,
            $customer->email,
            $dateFrom,
            $dateTo,
            $guestSummary,
            $totalPaid,
            $currencyCode,
            $hotelName
        );

        $payload = array(
            'text' => $text,
        );

        $result = $this->postSlackPayload($webhookUrl, $payload);
        if (!$result['ok']) {
            PrestaShopLogger::addLog(
                sprintf('[fewobooking] Slack webhook failed (%s): %s', $eventType, $result['error']),
                2
            );
        }
    }

    protected function getGuestSummary($bookingData)
    {
        $adults = 0;
        $children = 0;

        foreach ($bookingData as $row) {
            if (isset($row['adults'])) {
                $adults += (int) $row['adults'];
            }
            if (isset($row['children'])) {
                $children += (int) $row['children'];
            }
        }

        if ($adults === 0 && $children === 0) {
            return 'N/A';
        }

        return sprintf('%d adults, %d children', $adults, $children);
    }

    protected function postSlackPayload($webhookUrl, $payload)
    {
        $json = json_encode($payload);
        if ($json === false) {
            return array('ok' => false, 'error' => 'Failed to encode Slack payload');
        }

        if (function_exists('curl_init')) {
            $ch = curl_init($webhookUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $body = curl_exec($ch);
            $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($body === false || $httpCode < 200 || $httpCode >= 300) {
                $error = $curlError ? $curlError : ('HTTP ' . $httpCode . ' response: ' . (string) $body);
                return array('ok' => false, 'error' => $error);
            }

            return array('ok' => true, 'error' => '');
        }

        $context = stream_context_create(array(
            'http' => array(
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => $json,
                'timeout' => 10,
            )
        ));
        $body = @file_get_contents($webhookUrl, false, $context);
        if ($body === false) {
            return array('ok' => false, 'error' => 'file_get_contents failed');
        }

        return array('ok' => true, 'error' => '');
    }

    protected function generateInstructionsPdf($order, $customer, $dateFrom, $dateTo, $checkInTime, $checkOutTime, $hotelName, $hotelAddress)
    {
        $instructions = Configuration::get(self::CONFIG_INSTRUCTIONS, (int) $order->id_lang);
        if (!$instructions) {
            $instructions = '';
        }

        $safeInstructions = nl2br(Tools::safeOutput($instructions));
        $safeHotel = Tools::safeOutput($hotelName);
        $safeAddress = Tools::safeOutput($hotelAddress);

        $html = '<h1 style="font-size:20px;">' . Tools::safeOutput($this->l('House instructions')) . '</h1>';
        if ($safeHotel) {
            $html .= '<p><strong>' . Tools::safeOutput($this->l('Property')) . ':</strong> ' . $safeHotel . '</p>';
        }
        if ($dateFrom || $dateTo) {
            $html .= '<p><strong>' . Tools::safeOutput($this->l('Stay')) . ':</strong> ' . Tools::safeOutput($dateFrom) . ' - ' . Tools::safeOutput($dateTo) . '</p>';
        }
        if ($checkInTime || $checkOutTime) {
            $html .= '<p><strong>' . Tools::safeOutput($this->l('Check-in')) . ':</strong> ' . Tools::safeOutput($checkInTime) . ' &nbsp; <strong>' . Tools::safeOutput($this->l('Check-out')) . ':</strong> ' . Tools::safeOutput($checkOutTime) . '</p>';
        }
        if ($safeAddress) {
            $html .= '<p><strong>' . Tools::safeOutput($this->l('Address')) . ':</strong> ' . $safeAddress . '</p>';
        }
        if ($safeInstructions !== '') {
            $html .= '<hr><div style="font-size:12px; line-height:1.5;">' . $safeInstructions . '</div>';
        }

        require_once _PS_ROOT_DIR_ . '/classes/pdf/PDFGenerator.php';
        $pdf = new PDFGenerator(true, 'P');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetCreator('Fewo Lauscha');
        $pdf->SetAuthor('Fewo Lauscha');
        $pdf->SetTitle('House instructions');
        $pdf->SetFont('dejavusans', '', 11);
        $pdf->AddPage();
        $pdf->writeHTML($html, true, false, true, false, '');

        return $pdf->Output('house-instructions.pdf', 'S');
    }

    protected function generateIcs($order, $customer, $dateFrom, $dateTo, $hotelName, $hotelAddress, $checkInTime, $checkOutTime)
    {
        if (!$dateFrom || !$dateTo) {
            return '';
        }

        $uid = $order->reference . '@fewo-lauscha';
        $dtStamp = gmdate('Ymd\THis\Z');
        $startDate = date('Ymd', strtotime($dateFrom));
        $endDate = date('Ymd', strtotime($dateTo));

        $summary = $hotelName ? $hotelName . ' stay' : 'Fewo Lauscha stay';
        $description = 'Booking ' . $order->reference;
        if ($checkInTime || $checkOutTime) {
            $description .= "\nCheck-in: {$checkInTime} | Check-out: {$checkOutTime}";
        }
        if ($hotelAddress) {
            $description .= "\nAddress: {$hotelAddress}";
        }

        $ics = array(
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Fewo Lauscha//Booking//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:' . $this->escapeIcs($uid),
            'DTSTAMP:' . $dtStamp,
            'DTSTART;VALUE=DATE:' . $startDate,
            'DTEND;VALUE=DATE:' . $endDate,
            'SUMMARY:' . $this->escapeIcs($summary),
            'DESCRIPTION:' . $this->escapeIcs($description),
        );

        if ($hotelAddress) {
            $ics[] = 'LOCATION:' . $this->escapeIcs($hotelAddress);
        }

        $ics[] = 'END:VEVENT';
        $ics[] = 'END:VCALENDAR';

        return implode("\r\n", $ics) . "\r\n";
    }

    protected function escapeIcs($value)
    {
        $value = str_replace('\\', '\\\\', $value);
        $value = str_replace(';', '\\;', $value);
        $value = str_replace(',', '\\,', $value);
        $value = str_replace("\r\n", "\\n", $value);
        $value = str_replace("\n", "\\n", $value);
        return $value;
    }
}
