<?php
$uid = $_GET['uid'];
$zone = $_GET['zone'];

// URL OG GamingX (endpoint form mereka)
$url = "https://oggamingx.com/en-en/check-ml";

// Data dikirim via POST
$data = [
    'user_id' => $uid,
    'zone_id' => $zone
];

// Kirim request ke OG GamingX
$context = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => http_build_query($data)
    ]
]);

$result = file_get_contents($url, false, $context);

// Kembalikan hasil HTML mereka
echo $result;
?>