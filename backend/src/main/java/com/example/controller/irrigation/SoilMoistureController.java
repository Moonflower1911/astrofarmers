package com.example.controller.irrigation;

import com.example.model.irrigation.SoilMoistureResponse;
import com.example.service.irrigation.SoilMoistureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/soilMoisture")
public class SoilMoistureController {

    @Autowired
    private SoilMoistureService soilMoistureService;

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
}
