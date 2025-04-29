package com.example.service.irrigation;

import com.example.entity.irrigation.CropType;
import com.example.entity.irrigation.IrrigationEvent;
import com.example.entity.irrigation.IrrigationSchedule;
import com.example.entity.irrigation.WeatherForecast;
import com.example.model.irrigation.MoistureThreshold;
import com.example.repository.irrigation.CropTypeRepository;
import com.example.repository.irrigation.IrrigationScheduleRepository;
import com.example.repository.irrigation.IrrigationEventRepository;
import com.example.repository.irrigation.WeatherForecastRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Range;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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

    public void generateIrrigationSchedule(Long cropTypeId,double latitude, double longitude, LocalDate plantingDate, LocalDate startDate, LocalDate endDate) {

        CropType cropType = cropTypeRepository.findById(cropTypeId)
                .orElseThrow(() -> new RuntimeException("Crop not found"));

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            System.out.println(date);
            final LocalDate currentDate = date;
            WeatherForecast forecast = weatherForecastRepository
                    .findByDateAndLocation(currentDate, latitude, longitude)
                    .orElseThrow(() -> new RuntimeException(
                            "Weather data not found for date: " + currentDate +
                                    ", location: (" + latitude + ", " + longitude + ")"
                    ));

            double soilMoisture = forecast.getSoilMoisture();

            String growthStage = determineGrowthStage(plantingDate, date, cropType);
            MoistureThreshold threshold = cropType.getMoistureThresholdForStage(growthStage);

            if (soilMoisture < threshold.getMinMoisture()) {

                double irrigationAmount = calculateIrrigationAmount(forecast, threshold);

                IrrigationSchedule schedule = new IrrigationSchedule();
                schedule.setDate(date);
                schedule.setCropType(cropType);
                schedule.setIrrigationAmount(irrigationAmount);
                schedule.setWeatherForecast(forecast);
                irrigationScheduleRepository.save(schedule);

                IrrigationEvent event = new IrrigationEvent();
                event.setEventDate(date);
                event.setIrrigationAmount(irrigationAmount);
                event.setIrrigationSchedule(schedule);
                irrigationEventRepository.save(event);
            }
        }
    }

    private String determineGrowthStage(LocalDate plantingDate, LocalDate currentDate, CropType cropType) {
        long daysSincePlanting = ChronoUnit.DAYS.between(plantingDate, currentDate);

        Map<String, Integer> stageDays = cropType.getGrowthStageDurations(); // e.g. {"Germination":10, "Vegetative":30,...}
        int accumulated = 0;
        for (Map.Entry<String, Integer> entry : stageDays.entrySet()) {
            accumulated += entry.getValue();
            if (daysSincePlanting <= accumulated) {
                return entry.getKey();
            }
        }
        return "Maturity"; // default to last stage
    }

    private double calculateIrrigationAmount(WeatherForecast forecast, MoistureThreshold threshold) {
        double rainfall = forecast.getRainfall();
        double humidity = forecast.getHumidity();
        double temperature = forecast.getTemperature();

        double baseAmount = 20.0; // base mm for dry crops
        double humidityFactor = (humidity < 40) ? 1.2 : 1.0;
        double tempFactor = (temperature > 30) ? 1.3 : 1.0;
        double rainReduction = Math.min(rainfall, baseAmount * 0.6); // Reduce water if it rained recently

        return (baseAmount * humidityFactor * tempFactor) - rainReduction;
    }
}

