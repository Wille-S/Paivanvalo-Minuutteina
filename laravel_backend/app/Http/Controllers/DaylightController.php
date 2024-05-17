<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DaylightController extends Controller
{
    public function getDayLength($city)
    {
        $geocodeUrl = 'https://api.opencagedata.com/geocode/v1/json';
        $sunriseSunsetUrl = 'https://api.sunrise-sunset.org/json';

        // Get latitude and longitude for the city
        $geocodeResponse = Http::get($geocodeUrl, [
            'key' => env('OPENCAGE_API_KEY'),
            'q' => $city,
            'pretty' => 1,
            'no_annotations' => 1
        ]);

        $coordinates = $geocodeResponse->json()['results'][0]['geometry'];
        $lat = $coordinates['lat'];
        $lng = $coordinates['lng'];

        // Get daylight data for each day of the year
        $dayLengths = [];
        for ($day = 1; $day <= 365; $day++) {
            $date = date('Y-m-d', strtotime("2022-01-01 +{$day} days"));
            $sunriseSunsetResponse = Http::get($sunriseSunsetUrl, [
                'lat' => $lat,
                'lng' => $lng,
                'date' => $date,
                'formatted' => 0,
            ]);

            $sunriseSunsetData = $sunriseSunsetResponse->json()['results'];
            $dayLength = (strtotime($sunriseSunsetData['sunset']) - strtotime($sunriseSunsetData['sunrise'])) / 60;
            $dayLengths[] = [
                'date' => $date,
                'dayLength' => $dayLength
            ];
        }

        return response()->json($dayLengths);
    }
}
