package com.example.service.irrigation;

import com.example.entity.irrigation.WeatherForecast;
import com.example.model.irrigation.WeatherApiResponse;
import com.example.repository.irrigation.WeatherForecastRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.*;

@Service
public class WeatherForecastService {

    @Autowired
    private WeatherForecastRepository weatherForecastRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<WeatherForecast> fetchAndStoreForecast(
            double latitude,
            double longitude,
            Integer forecastDays, // optional if date range is used
            LocalDate startDate,  // optional
            LocalDate endDate     // optional
    ) {
        // Build the base URL
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl("https://api.open-meteo.com/v1/forecast")
                .queryParam("latitude", latitude)
                .queryParam("longitude", longitude)
                .queryParam("hourly", String.join(",",
                        "soil_moisture_0_to_1cm",
                        "soil_moisture_1_to_3cm",
                        "soil_moisture_3_to_9cm",
                        "rain",
                        "temperature_2m",
                        "wind_speed_10m",
                        "relative_humidity_2m"
                ));

        // Determine whether to use forecastDays or start/end dates
        if (forecastDays != null) {
            builder.queryParam("forecast_days", forecastDays); // Use forecast_days
        } else if (startDate != null && endDate != null) {
            builder.queryParam("start_date", startDate)
                    .queryParam("end_date", endDate); // Use start_date and end_date
        } else {
            throw new IllegalArgumentException("Either forecastDays or both startDate and endDate must be provided.");
        }

        String url = builder.toUriString();

        // Fetch data from API
        WeatherApiResponse response = restTemplate.getForObject(url, WeatherApiResponse.class);
        WeatherApiResponse.Hourly hourly = response.getHourly();
        List<String> times = hourly.getTime();

        Map<LocalDate, List<Integer>> indicesByDate = new HashMap<>();

        // Group hourly indices by day
        for (int i = 0; i < times.size(); i++) {
            LocalDate date = LocalDate.parse(times.get(i).substring(0, 10));
            if (!indicesByDate.containsKey(date)) {
                indicesByDate.put(date, new ArrayList<>());
            }
            indicesByDate.get(date).add(i);
        }

        List<WeatherForecast> results = new ArrayList<>();

        LocalDate today = LocalDate.now();
        LocalDate startDate1 = (startDate != null) ? startDate : today;
        LocalDate endDate1 = (endDate != null) ? endDate : today.plusDays(forecastDays);

        // Process and save forecast data
        for (LocalDate date = startDate1; !date.isAfter(endDate1); date = date.plusDays(1)) {
            if (weatherForecastRepository.findByDateAndLatitudeAndLongitude(date, latitude, longitude).isPresent()) {
                continue;
            }

            List<Integer> indices = indicesByDate.getOrDefault(date, new ArrayList<>());
            if (indices.isEmpty()) continue;

            List<Double> soilMoisture = new ArrayList<>();
            List<Double> temp = new ArrayList<>();
            List<Double> humidity = new ArrayList<>();
            List<Double> rain = new ArrayList<>();
            List<Double> windSpeed = new ArrayList<>();

            for (int i : indices) {
                if (hourly.getSoil_moisture_0_to_1cm().size() > i) soilMoisture.add(hourly.getSoil_moisture_0_to_1cm().get(i));
                if (hourly.getSoil_moisture_1_to_3cm().size() > i) soilMoisture.add(hourly.getSoil_moisture_1_to_3cm().get(i));
                if (hourly.getSoil_moisture_3_to_9cm().size() > i) soilMoisture.add(hourly.getSoil_moisture_3_to_9cm().get(i));
                if (hourly.getTemperature_2m().size() > i) temp.add(hourly.getTemperature_2m().get(i));
                if (hourly.getRelative_humidity_2m().size() > i) humidity.add(hourly.getRelative_humidity_2m().get(i));
                if (hourly.getRain().size() > i) rain.add(hourly.getRain().get(i));
                if (hourly.getWind_speed_10m().size() > i) windSpeed.add(hourly.getWind_speed_10m().get(i));
            }

            WeatherForecast forecast = new WeatherForecast();
            forecast.setDate(date);
            forecast.setLatitude(latitude);
            forecast.setLongitude(longitude);
            forecast.setSoilMoisture(avg(soilMoisture));
            forecast.setTemperature(avg(temp));
            forecast.setHumidity(avg(humidity));
            forecast.setRainfall(sum(rain));
            forecast.setWindSpeed(avg(windSpeed));

            results.add(weatherForecastRepository.save(forecast));
        }

        return results;
    }

    private double avg(List<Double> values) {
        if (values == null || values.isEmpty()) {
            return -1.0;
        }
        return values.stream()
                .filter(Objects::nonNull) // Filter out null values
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0);
    }

    private double sum(List<Double> values) {
        if (values == null || values.isEmpty()) {
            return -1.0;
        }
        return values.stream()
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
    }
    public Optional<WeatherForecast> getByDateAndCoords(LocalDate date, double latitude, double longitude) {
        return weatherForecastRepository.findByDateAndLatitudeAndLongitude(date, latitude, longitude);
    }

    public List<WeatherForecast> getByDateRangeAndCoords(LocalDate start, LocalDate end, double latitude, double longitude) {
        return weatherForecastRepository.findByDateBetweenAndLatitudeAndLongitude(start, end, latitude, longitude);
    }

}
