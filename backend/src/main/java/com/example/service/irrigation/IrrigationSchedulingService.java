package com.example.service.irrigation;

import com.example.entity.auth.User;
import com.example.entity.irrigation.*;
import com.example.model.irrigation.MoistureThreshold;
import com.example.repository.irrigation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class IrrigationSchedulingService {

    @Autowired
    private WeatherForecastRepository weatherForecastRepository;
    @Autowired
    private CropTypeRepository cropTypeRepository;
    @Autowired
    private IrrigationScheduleRepository irrigationScheduleRepository;
    @Autowired
    private IrrigationEventRepository irrigationEventRepository;

    public List<IrrigationSchedule> generateIrrigationSchedule(Long cropTypeId, double latitude, double longitude,
                                                               LocalDate plantingDate, LocalDate startDate, LocalDate endDate, User user) {

        List<IrrigationSchedule> generatedSchedules = new ArrayList<>();

        CropType cropType = cropTypeRepository.findById(cropTypeId)
                .orElseThrow(() -> new RuntimeException("Crop not found"));

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            final LocalDate currentDate = date;

            // Get weather forecast (with error handling)
            WeatherForecast forecast = weatherForecastRepository
                    .findByDateAndLocation(currentDate, latitude, longitude)
                    .orElseGet(() -> {
                        System.out.println("No weather data for " + currentDate + ", using defaults");
                        return createDefaultForecast(currentDate, latitude, longitude);
                    });

            // Skip irrigation if temperature is below freezing
            if (forecast.getTemperature() < 0) {
                System.out.println("Skipping irrigation due to freezing temperatures");
                continue;
            }

            double soilMoisture = forecast.getSoilMoisture();
            String growthStage = determineGrowthStage(plantingDate, date, cropType);
            MoistureThreshold threshold = cropType.getMoistureThresholdForStage(growthStage);

            // Check if irrigation is needed
            if (shouldIrrigate(soilMoisture, threshold, forecast)) {
                double irrigationAmount = calculateIrrigationAmount(forecast, threshold, cropType);

                // Create and save irrigation schedule
                IrrigationSchedule schedule = createIrrigationSchedule(date, cropType, forecast, irrigationAmount, user);
                irrigationScheduleRepository.save(schedule);

                // Create irrigation event if needed
                createIrrigationEvent(date, irrigationAmount, schedule);
                generatedSchedules.add(schedule);
            }
        }
        return generatedSchedules;
    }

    private boolean shouldIrrigate(double soilMoisture, MoistureThreshold threshold, WeatherForecast forecast) {
        // Skip if soil moisture is adequate
        if (soilMoisture >= threshold.getMinMoisture()) {
            return false;
        }

        // Skip if heavy rain is forecasted
        if (forecast.getRainfall() > threshold.getMaxMoisture()) {
            System.out.println("Skipping irrigation due to heavy rainfall forecast");
            return false;
        }

        return true;
    }

    private WeatherForecast createDefaultForecast(LocalDate date, double latitude, double longitude) {
        WeatherForecast forecast = new WeatherForecast();
        forecast.setDate(date);
        forecast.setLatitude(latitude);
        forecast.setLongitude(longitude);
        forecast.setTemperature(20.0);  // Default values
        forecast.setHumidity(50.0);
        forecast.setRainfall(0.0);
        forecast.setSoilMoisture(15.0);
        return forecast;
    }

    private IrrigationSchedule createIrrigationSchedule(LocalDate date, CropType cropType,
                                                        WeatherForecast forecast, double amount, User user) {
        IrrigationSchedule schedule = new IrrigationSchedule();
        schedule.setDate(date);
        schedule.setCropType(cropType);
        schedule.setIrrigationAmount(amount);
        schedule.setWeatherForecast(forecast);
        schedule.setUser(user);
        return schedule;
    }

    private void createIrrigationEvent(LocalDate date, double amount, IrrigationSchedule schedule) {
        IrrigationEvent event = new IrrigationEvent();
        event.setEventDate(date);
        event.setIrrigationAmount(amount);
        event.setIrrigationSchedule(schedule);
        irrigationEventRepository.save(event);
    }

    private String determineGrowthStage(LocalDate plantingDate, LocalDate currentDate, CropType cropType) {
        long daysSincePlanting = ChronoUnit.DAYS.between(plantingDate, currentDate);
        Map<String, Integer> stageDays = cropType.getGrowthStageDurations();

        int accumulated = 0;
        for (Map.Entry<String, Integer> entry : stageDays.entrySet()) {
            accumulated += entry.getValue();
            if (daysSincePlanting <= accumulated) {
                return entry.getKey();
            }
        }
        return "Maturity";
    }

    private double calculateIrrigationAmount(WeatherForecast forecast,
                                             MoistureThreshold threshold,
                                             CropType crop) {
        double rainfall = forecast.getRainfall();
        double humidity = forecast.getHumidity();
        double temperature = forecast.getTemperature();
        double windSpeed = forecast.getWindSpeed();

        // Base amount from crop requirements
        double baseAmount = crop.getBaseWaterRequirement();

        // Environmental factors
        double humidityFactor = (humidity < 40) ? 1.2 : (humidity > 80) ? 0.8 : 1.0;
        double tempFactor = (temperature > 30) ? 1.3 : (temperature < 10) ? 0.7 : 1.0;
        double windFactor = (windSpeed > 15) ? 1.2 : 1.0; // High winds increase evaporation
        double soilFactor = crop.getSoilTypeAdjustment().getMultiplier();

        // Rain reduction (cap at 80% of base amount)
        double rainReduction = Math.min(rainfall, baseAmount * 0.8);

        // Calculate final amount with all factors
        double calculatedAmount = (baseAmount * humidityFactor * tempFactor * windFactor * soilFactor) - rainReduction;

        // Apply crop-specific maximum limit
        return Math.min(calculatedAmount, crop.getMaxDailyIrrigation());
    }
}