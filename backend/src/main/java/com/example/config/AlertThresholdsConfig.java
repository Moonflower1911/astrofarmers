package com.example.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "alert.thresholds")
public class AlertThresholdsConfig {
    private double temperature;
    private double windSpeed;
    private double precipitation;
    private double radiation;
    private double cloudCover;
}
