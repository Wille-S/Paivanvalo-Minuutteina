<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'vendor/autoload.php';

use GuzzleHttp\Client;

function getCoordinates($city) {
    $client = new Client();
    $apiKey = 'd7b090cb522d4e1ab0acc8ae20157398'; // Replace with your actual API key
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
        // Get the day_length in seconds
        $dayLength = $data['results']['day_length'];

        // Handle edge cases
        if ($dayLength == 0) {
            $sunrise = $data['results']['sunrise'];
            $sunset = $data['results']['sunset'];

            if (is_null($sunrise) && is_null($sunset)) {
                // If both sunrise and sunset are null, determine if it's polar night or midnight sun
                $solarNoon = new DateTime($data['results']['solar_noon']);
                if ($solarNoon->format('H') == '00') {
                    // Polar night (sun never rises)
                    return 0;
                } elseif ($solarNoon->format('H') == '12') {
                    // Midnight sun (sun never sets)
                    return 24 * 60;
                }
            }
        }

        // Normal case
        return $dayLength / 60; // Return day length in minutes
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
