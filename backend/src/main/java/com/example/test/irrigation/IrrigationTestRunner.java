package com.example.test.irrigation;

import com.example.entity.irrigation.*;
import com.example.model.irrigation.MoistureThreshold;
import com.example.repository.irrigation.*;
import com.example.service.irrigation.IrrigationSchedulingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

//@Configuration
public class IrrigationTestRunner {

    @Bean
    public CommandLineRunner testIrrigationScheduling(
            CropTypeRepository cropTypeRepository,
            WeatherForecastRepository weatherForecastRepository,
            IrrigationSchedulingService irrigationSchedulingService
    ) {
        return args -> {
            // 1. Create and save a CropType
            CropType wheat = new CropType();
            wheat.setName("Wheat");

            Map<String, Integer> stageDurations = new LinkedHashMap<>();
            stageDurations.put("Germination", 10);
            stageDurations.put("Vegetative", 30);
            stageDurations.put("Reproductive", 20);
            stageDurations.put("Maturity", 15);
            wheat.setGrowthStageDurations(stageDurations);

            Map<String, MoistureThreshold> thresholds = new HashMap<>();
            thresholds.put("Germination", new MoistureThreshold(30, 60));
            thresholds.put("Vegetative", new MoistureThreshold(35, 65));
            thresholds.put("Reproductive", new MoistureThreshold(40, 70));
            thresholds.put("Maturity", new MoistureThreshold(25, 50));
            wheat.setMoistureThresholds(thresholds);

            cropTypeRepository.save(wheat);

            // 2. Create and save WeatherForecast data
            double lat = 34.02;
            double lon = -6.83;
            LocalDate start = LocalDate.now();
            LocalDate end = start.plusDays(4);

            for (int i = 0; i <= ChronoUnit.DAYS.between(start, end); i++) {
                LocalDate date = start.plusDays(i);
                WeatherForecast forecast = new WeatherForecast();
                forecast.setDate(date);
                forecast.setLatitude(lat);
                forecast.setLongitude(lon);
                forecast.setSoilMoisture(25.0); // Low moisture to trigger irrigation
                forecast.setTemperature(32.0);  // Hot → higher need
                forecast.setHumidity(35.0);     // Dry → higher need
                forecast.setRainfall(2.0);      // Light rain

                weatherForecastRepository.save(forecast);
            }

            // 3. Trigger schedule generation
            LocalDate plantingDate = LocalDate.now().minusDays(15);
            irrigationSchedulingService.generateIrrigationSchedule(
                    wheat.getId(),
                    lat,
                    lon,
                    plantingDate,
                    start,
                    end
            );

            System.out.println("✅ Test schedule generated for crop: Wheat");
        };
    }
}
