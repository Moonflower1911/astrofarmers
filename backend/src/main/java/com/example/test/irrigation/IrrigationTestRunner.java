package com.example.test.irrigation;


import com.example.model.irrigation.SoilType;
import com.example.entity.irrigation.*;
import com.example.model.irrigation.MoistureThreshold;
import com.example.repository.irrigation.*;
import com.example.service.irrigation.IrrigationSchedulingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
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
            // 1. Create and save CropTypes with different characteristics
            CropType wheat = createCropType("Wheat", 5.0, 15.0, SoilType.LOAMY);
            CropType rice = createCropType("Rice", 10.0, 25.0, SoilType.CLAY);
            CropType corn = createCropType("Corn", 7.0, 20.0, SoilType.SANDY);

            cropTypeRepository.saveAll(List.of(wheat, rice, corn));

            // 2. Create test weather scenarios
            double lat = 34.02;
            double lon = -6.83;
            LocalDate today = LocalDate.now();

            // Scenario 1: Normal irrigation needed (hot, dry, windy)
            createWeatherForecast(weatherForecastRepository, lat, lon, today,
                    32.0, 35.0, 2.0, 18.0, 25.0, "Normal irrigation expected");

            // Scenario 2: Heavy rain - no irrigation needed
            createWeatherForecast(weatherForecastRepository, lat, lon, today.plusDays(1),
                    25.0, 70.0, 15.0, 5.0, 40.0, "No irrigation - heavy rain");

            // Scenario 3: Freezing temperatures - no irrigation
            createWeatherForecast(weatherForecastRepository, lat, lon, today.plusDays(2),
                    -2.0, 80.0, 0.0, 10.0, 20.0, "No irrigation - freezing");

            // Scenario 4: High winds increase evaporation
            createWeatherForecast(weatherForecastRepository, lat, lon, today.plusDays(3),
                    30.0, 30.0, 0.0, 25.0, 15.0, "Increased irrigation - windy");

            // Scenario 5: Sandy soil needs more water
            createWeatherForecast(weatherForecastRepository, lat, lon, today.plusDays(4),
                    28.0, 40.0, 1.0, 12.0, 20.0, "Sandy soil adjustment");

            // 3. Test irrigation for each crop type
            LocalDate plantingDate = today.minusDays(15);
            LocalDate endDate = today.plusDays(4);

            for (CropType crop : List.of(wheat, rice, corn)) {
                irrigationSchedulingService.generateIrrigationSchedule(
                        crop.getId(),
                        lat,
                        lon,
                        plantingDate,
                        today,
                        endDate
                );
                System.out.printf("✅ Irrigation test completed for %s (Soil: %s)%n",
                        crop.getName(), crop.getSoilTypeAdjustment());
            }
        };
    }

    private CropType createCropType(String name, double baseWater, double maxWater, SoilType soilType) {
        CropType crop = new CropType();
        crop.setName(name);
        crop.setBaseWaterRequirement(baseWater);
        crop.setMaxDailyIrrigation(maxWater);
        crop.setSoilTypeAdjustment(soilType);

        // Standard growth stages
        Map<String, Integer> stages = new LinkedHashMap<>();
        stages.put("Germination", 10);
        stages.put("Vegetative", 30);
        stages.put("Reproductive", 20);
        stages.put("Maturity", 15);
        crop.setGrowthStageDurations(stages);

        // Moisture thresholds
        Map<String, MoistureThreshold> thresholds = new HashMap<>();
        thresholds.put("Germination", new MoistureThreshold(30, 60));
        thresholds.put("Vegetative", new MoistureThreshold(35, 65));
        thresholds.put("Reproductive", new MoistureThreshold(40, 70));
        thresholds.put("Maturity", new MoistureThreshold(25, 50));
        crop.setMoistureThresholds(thresholds);

        return crop;
    }

    private void createWeatherForecast(WeatherForecastRepository repository,
                                       double lat, double lon, LocalDate date,
                                       double temp, double humidity, double rainfall,
                                       double windSpeed, double soilMoisture,
                                       String note) {
        WeatherForecast forecast = new WeatherForecast();
        forecast.setDate(date);
        forecast.setLatitude(lat);
        forecast.setLongitude(lon);
        forecast.setTemperature(temp);
        forecast.setHumidity(humidity);
        forecast.setRainfall(rainfall);
        forecast.setWindSpeed(windSpeed);
        forecast.setSoilMoisture(soilMoisture);
        repository.save(forecast);

        System.out.printf("🌦️ Created weather scenario for %s: %s%n", date, note);
        System.out.printf("   Temp: %.1f°C | Hum: %.1f%% | Rain: %.1fmm | Wind: %.1fkm/h | Soil: %.1f%%%n",
                temp, humidity, rainfall, windSpeed, soilMoisture);
    }
}