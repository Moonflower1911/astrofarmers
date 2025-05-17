package com.example.service;

import com.example.model.DailyForecast;
import com.example.model.HistoricalWeatherData;
import com.example.model.ForecastWeatherData;
import com.example.repository.HistoricalWeatherDataRepository;
import com.example.repository.ForecastWeatherDataRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WeatherService {

    private final HistoricalWeatherDataRepository historicalRepo;
    private final ForecastWeatherDataRepository forecastRepo;
    private final RestTemplate restTemplate;

    public WeatherService(HistoricalWeatherDataRepository historicalRepo,
                          ForecastWeatherDataRepository forecastRepo) {
        this.historicalRepo = historicalRepo;
        this.forecastRepo = forecastRepo;
        this.restTemplate = new RestTemplate();
    }

    // Always fetch fresh forecast data and save it
    public List<ForecastWeatherData> getForecastData(double lat, double lon) {
        LocalDate today = LocalDate.now();

        // Always fetch new data from Open-Meteo
        List<ForecastWeatherData> newForecasts = fetchForecastFromApi(lat, lon, today);

        // Delete existing forecast data for this location
        forecastRepo.deleteByLatitudeAndLongitude(lat, lon);

        // Save and return new data
        forecastRepo.saveAll(newForecasts);
        return newForecasts;
    }

    // Fetch historical data (unchanged)
    public HistoricalWeatherData getHistoricalData(double lat, double lon, LocalDate date) {
        Optional<HistoricalWeatherData> existing = historicalRepo.findByLatitudeAndLongitudeAndDate(lat, lon, date);
        if (existing.isPresent()) {
            return existing.get();
        }

        String url = "https://archive-api.open-meteo.com/v1/archive"
                + "?latitude=" + lat
                + "&longitude=" + lon
                + "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,shortwave_radiation_sum,windspeed_10m_max,winddirection_10m_dominant,cloudcover_mean"
                + "&timezone=auto"
                + "&start_date=" + date
                + "&end_date=" + date;

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        Map<String, Object> body = response.getBody();
        if (body == null || !body.containsKey("daily")) {
            throw new RuntimeException("Missing 'daily' data in historical API response");
        }

        Map<String, Object> daily = (Map<String, Object>) body.get("daily");
        List<String> times = (List<String>) daily.get("time");

        List<Double> tempMax = convertToDoubleList((List<?>) daily.get("temperature_2m_max"));
        List<Double> tempMin = convertToDoubleList((List<?>) daily.get("temperature_2m_min"));
        List<Double> precipitation = convertToDoubleList((List<?>) daily.get("precipitation_sum"));
        List<Double> radiation = convertToDoubleList((List<?>) daily.get("shortwave_radiation_sum"));
        List<Double> windSpeed = convertToDoubleList((List<?>) daily.get("windspeed_10m_max"));
        List<Double> windDirection = convertToDoubleList((List<?>) daily.get("winddirection_10m_dominant"));
        List<Double> cloudCover = convertToDoubleList((List<?>) daily.get("cloudcover_mean"));

        HistoricalWeatherData data = new HistoricalWeatherData();
        data.setDate(LocalDate.parse(times.get(0)));
        data.setLatitude(lat);
        data.setLongitude(lon);
        data.setTemperatureMax(tempMax.get(0));
        data.setTemperatureMin(tempMin.get(0));
        data.setPrecipitation(precipitation.get(0));
        data.setRadiation(radiation.get(0));
        data.setWindSpeed(windSpeed.get(0));
        data.setWindDirection(windDirection.get(0));
        data.setCloudCover(cloudCover.get(0));
        data.setSource("Open-Meteo Historical");

        return historicalRepo.save(data);
    }

    private List<ForecastWeatherData> fetchForecastFromApi(double lat, double lon, LocalDate today) {
        String url = "https://api.open-meteo.com/v1/forecast"
                + "?latitude=" + lat
                + "&longitude=" + lon
                + "&hourly=temperature_2m,precipitation,shortwave_radiation,windspeed_10m,winddirection_10m,cloudcover"
                + "&timezone=auto"
                + "&start_date=" + today
                + "&end_date=" + today.plusDays(7);

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        Map<String, Object> body = response.getBody();
        if (body == null || !body.containsKey("hourly")) {
            throw new RuntimeException("Missing 'hourly' data in forecast API response");
        }

        Map<String, Object> hourly = (Map<String, Object>) body.get("hourly");
        List<String> times = (List<String>) hourly.get("time");

        List<Double> temperatures = convertToDoubleList((List<?>) hourly.get("temperature_2m"));
        List<Double> precipitations = convertToDoubleList((List<?>) hourly.get("precipitation"));
        List<Double> radiations = convertToDoubleList((List<?>) hourly.get("shortwave_radiation"));
        List<Double> windSpeeds = convertToDoubleList((List<?>) hourly.get("windspeed_10m"));
        List<Double> windDirections = convertToDoubleList((List<?>) hourly.get("winddirection_10m"));
        List<Double> cloudCovers = convertToDoubleList((List<?>) hourly.get("cloudcover"));

        List<ForecastWeatherData> newForecasts = new ArrayList<>();
        for (int i = 0; i < times.size(); i++) {
            ForecastWeatherData forecast = new ForecastWeatherData();
            forecast.setDateTime(LocalDateTime.parse(times.get(i)));
            forecast.setLatitude(lat);
            forecast.setLongitude(lon);
            forecast.setTemperature(temperatures.get(i));
            forecast.setPrecipitation(precipitations.get(i));
            forecast.setRadiation(radiations.get(i));
            forecast.setWindSpeed(windSpeeds.get(i));
            forecast.setWindDirection(windDirections.get(i));
            forecast.setCloudCover(cloudCovers.get(i));
            forecast.setSource("Open-Meteo Forecast");
            newForecasts.add(forecast);
        }

        return newForecasts;
    }

    public List<DailyForecast> fetchDailyForecast(double lat, double lon) {
        String url = "https://api.open-meteo.com/v1/forecast"+ "?latitude=" + lat
                + "&longitude=" + lon
                + "&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,uv_index_max,wind_speed_10m_max,shortwave_radiation_sum&timezone=auto&forecast_days=1";

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        Map<String, List<Object>> dailyData = (Map<String, List<Object>>) response.get("daily");

        if (dailyData == null) return List.of();

        List<DailyForecast> results = new ArrayList<>();

        List<Object> rawDates = dailyData.get("time");
        List<String> dates = rawDates.stream()
                .map(Object::toString)
                .collect(Collectors.toList());

        for (int i = 0; i < dates.size(); i++) {
            results.add(DailyForecast.builder()
                    .latitude(lat)
                    .longitude(lon)
                    .date(LocalDate.parse(dates.get(i)))
                    .temperatureMax(asDouble(dailyData.get("temperature_2m_max").get(i)))
                    .temperatureMin(asDouble(dailyData.get("temperature_2m_min").get(i)))
                    .sunrise((String) dailyData.get("sunrise").get(i))
                    .sunset((String) dailyData.get("sunset").get(i))
                    .precipitationSum(asDouble(dailyData.get("precipitation_sum").get(i)))
                    .uvIndexMax(asDouble(dailyData.get("uv_index_max").get(i)))
                    .windSpeedMax(asDouble(dailyData.get("wind_speed_10m_max").get(i)))
                    .radiationSum(asDouble(dailyData.get("shortwave_radiation_sum").get(i)))
                    .build());
        }

        return results;
    }

    private double asDouble(Object obj) {
        return obj instanceof Number ? ((Number) obj).doubleValue() : 0.0;
    }


    private List<Double> convertToDoubleList(List<?> list) {
        return list.stream()
                .map(item -> ((Number) item).doubleValue())
                .collect(Collectors.toList());
    }
}
