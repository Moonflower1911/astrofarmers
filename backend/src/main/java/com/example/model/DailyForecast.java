package com.example.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyForecast {
    @Id
    @GeneratedValue
    private UUID id;

    private double latitude;
    private double longitude;
    private LocalDate date;

    private double temperatureMax;
    private double temperatureMin;
    private String sunrise;
    private String sunset;
    private double precipitationSum;
    private double uvIndexMax;
    private double windSpeedMax;
    private double radiationSum;
}
