package com.example.controller;

import com.example.model.WeatherAlert;
import com.example.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<List<WeatherAlert>> getAlerts(@RequestParam double lat, @RequestParam double lon) {
        List<WeatherAlert> alerts = alertService.generateAlerts(lat, lon);
        return ResponseEntity.ok(alerts);
    }
}
