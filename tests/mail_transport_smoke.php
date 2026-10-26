<?php
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
$root = isset($argv[1]) ? rtrim($argv[1], '/') : dirname(__DIR__);
require $root.'/tools/mailer/autoload.php';

$email = (new Symfony\Component\Mime\Email())
    ->from('sender@example.invalid')
    ->to('recipient@example.invalid')
    ->subject('FeWo mailer compatibility')
    ->text('Local compatibility check')
    ->html('<p>Local compatibility check</p>')
    ->attach('Local attachment', 'check.txt', 'text/plain');

// NullTransport exercises message preparation without opening a network connection.
$sent = (new Symfony\Component\Mailer\Transport\NullTransport())->send($email);
if (!$sent || strpos($sent->toString(), 'multipart/mixed') === false) {
    throw new RuntimeException('Mailer did not prepare the multipart message');
}
echo "Mailer MIME/attachment/null-transport smoke passed; no email sent\n";
