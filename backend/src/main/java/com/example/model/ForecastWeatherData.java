package com.example.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
public class ForecastWeatherData {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private double temperature;
    private double precipitation;
    private double radiation;
    private double windSpeed;
    private double windDirection;
    private double cloudCover;
    private String source; // e.g., "Open-Meteo Forecast"

    private double latitude;
    private double longitude;

    private LocalDateTime dateTime;
}
