package com.example.service;

import com.example.model.ForecastWeatherData;
import com.example.model.WeatherAlert;
import com.example.repository.ForecastWeatherDataRepository;
import com.example.repository.WeatherAlertRepository;
import com.example.config.AlertThresholdsConfig;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AlertService {

    private final ForecastWeatherDataRepository forecastRepo;
    private final WeatherAlertRepository alertRepo;
    private final AlertThresholdsConfig thresholds;

    public AlertService(ForecastWeatherDataRepository forecastRepo,
                        WeatherAlertRepository alertRepo,
                        AlertThresholdsConfig thresholds) {
        this.forecastRepo = forecastRepo;
        this.alertRepo = alertRepo;
        this.thresholds = thresholds;
    }


    public List<WeatherAlert> generateAlerts(double lat, double lon) {
        List<ForecastWeatherData> forecasts = forecastRepo.findByLatitudeAndLongitude(lat, lon);
        List<WeatherAlert> alerts = new ArrayList<>();

        for (ForecastWeatherData data : forecasts) {
            if (data.getTemperature() <= 0) {
                alerts.add(createAlert("Cold Wave", "Temperature below 0°C", data));
            }
            if (data.getTemperature() > thresholds.getTemperature()) {
                alerts.add(createAlert("Heatwave", "Temperature exceeds " + thresholds.getTemperature() + "°C", data));
            }
            if (data.getPrecipitation() > thresholds.getPrecipitation()) {
                alerts.add(createAlert("Heavy Rain", "Precipitation exceeds " + thresholds.getPrecipitation() + "mm", data));
            }
            if (data.getWindSpeed() > thresholds.getWindSpeed()) {
                alerts.add(createAlert("Storm", "Wind speed exceeds " + thresholds.getWindSpeed() + " km/h", data));
            }
            if (data.getRadiation() > thresholds.getRadiation()) {
                alerts.add(createAlert("Radiation Alert", "Radiation exceeds " + thresholds.getRadiation() + " MJ/m²", data));
            }
            if (data.getCloudCover() > thresholds.getCloudCover()) {
                alerts.add(createAlert("Cloud Cover Alert", "Cloud cover exceeds " + thresholds.getCloudCover() + "%", data));
            }
            if (data.getCloudCover() > 90 && data.getRadiation() < 10) { // Simulate fog
                alerts.add(createAlert("Fog Alert", "Low visibility conditions — possible fog", data));
            }
        }



        return alertRepo.saveAll(alerts);
    }

    private WeatherAlert createAlert(String type, String message, ForecastWeatherData data) {
        WeatherAlert alert = new WeatherAlert();
        alert.setType(type);
        alert.setMessage(message);
        alert.setLatitude(data.getLatitude());
        alert.setLongitude(data.getLongitude());
        alert.setTimestamp(data.getDateTime());
        return alert;
    }
}
