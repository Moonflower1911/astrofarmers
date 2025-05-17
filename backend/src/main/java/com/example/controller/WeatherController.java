package com.example.controller;

import com.example.model.DailyForecast;
import com.example.model.HistoricalWeatherData;
import com.example.model.ForecastWeatherData;
import com.example.service.WeatherService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService service;

    public WeatherController(WeatherService service) {
        this.service = service;
    }

    /**
     * Endpoint for historical weather data.
     * Retrieves data for a specific date and location.
     * If the data exists in the database, it is returned; otherwise, the API is called and the data stored.
     *
     * Example:
     * GET /api/weather/historical?lat=34&lon=6&date=2023-01-01
     */
    @GetMapping("/historical")
    public ResponseEntity<HistoricalWeatherData> getHistorical(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        HistoricalWeatherData data = service.getHistoricalData(lat, lon, date);
        return ResponseEntity.ok(data);
    }

    /**
     * Endpoint for forecast weather data.
     * Retrieves hourly forecast data for today plus the next 7 days for a specific location.
     * Checks if the stored data is current (i.e. the latest entry is from today).
     * If not, it clears old data and fetches new forecast data.
     *
     * Example:
     * GET /api/weather/forecast?lat=34&lon=6
     */
    @GetMapping("/forecast")
    public ResponseEntity<List<ForecastWeatherData>> getForecast(
            @RequestParam double lat,
            @RequestParam double lon) {

        List<ForecastWeatherData> data = service.getForecastData(lat, lon);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/daily")
    public ResponseEntity<List<DailyForecast>> getDailyForecast(
            @RequestParam double lat,
            @RequestParam double lon) {
        List<DailyForecast> forecast = service.fetchDailyForecast(lat, lon);
        return ResponseEntity.ok(forecast);
    }

}
