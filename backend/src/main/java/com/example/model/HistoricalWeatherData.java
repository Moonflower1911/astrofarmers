package com.example.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity
public class HistoricalWeatherData {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private double temperatureMax;
    private double temperatureMin;
    private double precipitation;
    private double radiation;
    private double windSpeed;
    private double windDirection;
    private double cloudCover;
    private String source; // e.g., "Open-Meteo Historical"

    private double latitude;
    private double longitude;

    private LocalDate date;
}
