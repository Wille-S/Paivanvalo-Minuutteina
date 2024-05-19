<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'vendor/autoload.php';

use GuzzleHttp\Client;

function getCoordinates($city) {
    $client = new Client();
    $apiKey = 'd7b090cb522d4e1ab0acc8ae20157398';
    try {
        $response = $client->get("https://api.opencagedata.com/geocode/v1/json?q={$city}&key={$apiKey}", [
            'verify' => false
        ]);
        $data = json_decode($response->getBody(), true);

        if (isset($data['results'][0])) {
            $geometry = $data['results'][0]['geometry'];
            return ['lat' => $geometry['lat'], 'lng' => $geometry['lng']];
        } else {
            return null;
        }
    } catch (Exception $e) {
        echo 'Request failed: ' . $e->getMessage();
        return null;
    }
}

function getDaylightData($lat, $lng, $date) {
    $client = new Client();
    $response = $client->get("https://api.sunrise-sunset.org/json?lat={$lat}&lng={$lng}&date={$date}&formatted=0", [
        'verify' => false
    ]);
    $data = json_decode($response->getBody(), true);

    if ($data['status'] == 'OK') {
        $sunrise = $data['results']['sunrise'];
        $sunset = $data['results']['sunset'];

        $sunriseTime = new DateTime($sunrise);
        $sunsetTime = new DateTime($sunset);
        $dayLength = ($sunsetTime->getTimestamp() - $sunriseTime->getTimestamp()) / 60;

        // Check if calculated dayLength is zero or near-zero, which might be erroneous
        if ($dayLength <= 1) { // Consider near-zero condition to handle slight discrepancies
            // Further refine the check based on the date and latitude
            $month = date('m', strtotime($date));
            if ($lat >= 66.5) { // Arctic Circle latitude
                if ($month >= 5 && $month <= 7) {
                    return 24 * 60; // Full day of sunlight
                }
            }
        }

        return $dayLength;
    } else {
        return null;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['city']) && isset($_GET['date'])) {
    $city = $_GET['city'];
    $date = $_GET['date'];
    $coordinates = getCoordinates($city);

    if ($coordinates) {
        $daylight = getDaylightData($coordinates['lat'], $coordinates['lng'], $date);
        echo json_encode(['daylight' => $daylight]);
    } else {
        echo json_encode(['error' => 'Invalid city name']);
    }
} else {
    echo json_encode(['error' => 'Invalid request']);
}
