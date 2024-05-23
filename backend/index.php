<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'vendor/autoload.php';

if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

$apiKey = getenv('OPEN_CAGE_API_KEY') ?: $_ENV['OPEN_CAGE_API_KEY'];

use GuzzleHttp\Client;

function getCoordinates($city) {
    global $apiKey;
    $client = new Client();
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

function getDaylightData($lat, $lng, $dates) {
    $client = new Client();
    $daylightData = [];

    foreach ($dates as $date) {
        $response = $client->get("https://api.sunrise-sunset.org/json?lat={$lat}&lng={$lng}&date={$date}&formatted=0", [
            'verify' => false
        ]);
        $data = json_decode($response->getBody(), true);

        if ($data['status'] == 'OK') {
            $sunrise = $data['results']['sunrise'];
            $sunset = $data['results']['sunset'];

            $sunriseTime = new DateTime($sunrise);
            $sunsetTime = new DateTime($sunset);
            $dayLength = ($sunsetTime->getTimestamp() - $sunriseTime->getTimestamp()) / 60; // Convert to minutes

            // Check if calculated dayLength is zero or near-zero, which might be erroneous
            if ($dayLength <= 1) { // Consider near-zero condition to handle slight discrepancies
                // Further refine the check based on the date
                $month = date('m', strtotime($date));
                if ($month >= 4 && $month <= 8) {
                    $dayLength = 24 * 60; // Full day of sunlight
                }
            }

            $daylightData[] = ['date' => $date, 'daylight' => $dayLength];
        }
    }

    return $daylightData;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['city']) && isset($input['dates'])) {
        $city = $input['city'];
        $dates = $input['dates'];
        $coordinates = getCoordinates($city);

        if ($coordinates) {
            $daylightData = getDaylightData($coordinates['lat'], $coordinates['lng'], $dates);
            $response = ['daylightData' => $daylightData];
            error_log(print_r($response, true)); // Add this line for logging
            echo json_encode($response);
        } else {
            echo json_encode(['error' => 'Invalid city name']);
        }
    } else {
        echo json_encode(['error' => 'Invalid request']);
    }
} else {
    echo json_encode(['error' => 'Invalid request']);
}
