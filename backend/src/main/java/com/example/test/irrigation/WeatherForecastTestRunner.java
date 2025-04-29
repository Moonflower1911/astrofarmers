package com.example.test.irrigation;

import com.example.entity.irrigation.WeatherForecast;
import com.example.repository.irrigation.WeatherForecastRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

//@Component
public class WeatherForecastTestRunner implements CommandLineRunner {

    private final WeatherForecastRepository weatherForecastRepository;

    public WeatherForecastTestRunner(WeatherForecastRepository weatherForecastRepository) {
        this.weatherForecastRepository = weatherForecastRepository;
    }

    @Override
    public void run(String... args) {
        List<WeatherForecast> forecasts = weatherForecastRepository.findAll();

        if (forecasts.isEmpty()) {
            System.out.println("No weather forecast data found.");
        } else {
            System.out.println("Weather forecast data:");
            for (WeatherForecast wf : forecasts) {
                System.out.printf("ID: %d, Date: %s, Lat: %.4f, Lon: %.4f, Temp: %.2f°C, Humidity: %.2f%%%n",
                        wf.getId(),
                        wf.getDate(),
                        wf.getLatitude(),
                        wf.getLongitude(),
                        wf.getTemperature(),     // assuming these fields exist
                        wf.getHumidity());       // adjust field names as needed
            }
        }
        Optional<WeatherForecast> specificForecast = weatherForecastRepository
                .findByDateAndLocation(LocalDate.of(2025, 4, 30),34.02, -6.83);
        System.out.println("Specific forecast exists: " + specificForecast.isPresent());
    }
}

