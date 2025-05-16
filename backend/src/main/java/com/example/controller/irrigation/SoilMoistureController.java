package com.example.controller.irrigation;

import com.example.model.irrigation.WeatherForecast;
import com.example.dto.irrigation.SoilMoistureResponse;
import com.example.service.irrigation.SoilMoistureService;
import com.example.service.irrigation.WeatherForecastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/soilMoisture")
public class SoilMoistureController {

    @Autowired
    private SoilMoistureService soilMoistureService;

    @Autowired
    private WeatherForecastService weatherForecastService;

    @GetMapping
    public SoilMoistureResponse getWeatherData(
            @RequestParam(defaultValue = "34.01325") double latitude,
            @RequestParam(defaultValue = "-6.83255") double longitude,
            @RequestParam(required = false) Integer forecastDays,
            @RequestParam(required = false) String startDate, // Format: yyyy-MM-dd
            @RequestParam(required = false) String endDate     // Format: yyyy-MM-dd
    ) {
        return soilMoistureService.fetchWeatherData(latitude, longitude, forecastDays, startDate, endDate);
    }


    @PostMapping
    public List<WeatherForecast> getForecast(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(required = false) Integer forecastDays,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return weatherForecastService.fetchAndStoreForecast(latitude, longitude, forecastDays, startDate, endDate);
    }

    @GetMapping("/general")
    public List<WeatherForecast> getGeneral(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        if (date != null) {
            // Check DB for this date
            Optional<WeatherForecast> existing = weatherForecastService
                    .getByDateAndCoords(date, latitude, longitude);
            if (existing.isPresent()) {
                return List.of(existing.get());
            }

            // Fetch and return only this one day
            return weatherForecastService.fetchAndStoreForecast(latitude, longitude, null, date, date);
        } else if (startDate != null && endDate != null) {
            // Check and return all forecasts for the range
            List<WeatherForecast> results = weatherForecastService
                    .getByDateRangeAndCoords(startDate, endDate, latitude, longitude);

            if (results.size() < (endDate.toEpochDay() - startDate.toEpochDay() + 1)) {
                // Re-fetch missing ones
                weatherForecastService.fetchAndStoreForecast(latitude, longitude, null, startDate, endDate);
                results = weatherForecastService
                        .getByDateRangeAndCoords(startDate, endDate, latitude, longitude);
            }
            return results;
        } else {
            throw new IllegalArgumentException("Either `date` or both `startDate` and `endDate` must be provided.");
        }
    }
}
