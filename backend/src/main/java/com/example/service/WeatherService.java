package com.example.service;

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

    // Fetch historical data for a specific day
    public HistoricalWeatherData getHistoricalData(double lat, double lon, LocalDate date) {
        // Check if data already exists
        Optional<HistoricalWeatherData> existing = historicalRepo.findByLatitudeAndLongitudeAndDate(lat, lon, date);
        if (existing.isPresent()) {
            return existing.get();
        }
        // Otherwise, call the API (example URL, adjust parameters as needed)
        String url = "https://archive-api.open-meteo.com/v1/archive"
                + "?latitude=" + lat
                + "&longitude=" + lon
                + "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,shortwave_radiation_sum,windspeed_10m_max,winddirection_10m_dominant,cloudcover_mean"
                + "&timezone=auto"
                + "&start_date=" + date.toString()
                + "&end_date=" + date.toString();

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        Map<String, Object> body = response.getBody();
        if (body == null || !body.containsKey("daily")) {
            throw new RuntimeException("Missing 'daily' data in historical API response");
        }

        // Parse JSON response (assuming similar structure to forecast example)
        Map<String, Object> daily = (Map<String, Object>) body.get("daily");
        List<String> times = (List<String>) daily.get("time");

        List<Double> tempMax = convertToDoubleList((List<?>) daily.get("temperature_2m_max"));
        List<Double> tempMin = convertToDoubleList((List<?>) daily.get("temperature_2m_min"));
        List<Double> precipitation = convertToDoubleList((List<?>) daily.get("precipitation_sum"));
        List<Double> radiation = convertToDoubleList((List<?>) daily.get("shortwave_radiation_sum"));
        List<Double> windSpeed = convertToDoubleList((List<?>) daily.get("windspeed_10m_max"));
        List<Double> windDirection = convertToDoubleList((List<?>) daily.get("winddirection_10m_dominant"));
        List<Double> cloudCover = convertToDoubleList((List<?>) daily.get("cloudcover_mean"));

        // Assume one entry since start_date=end_date
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

    // Fetch forecast data (hourly) for today plus next 7 days for a given location
    public List<ForecastWeatherData> getForecastData(double lat, double lon) {
        LocalDate today = LocalDate.now();
        // Fetch all forecast entries from the table
        List<ForecastWeatherData> allForecasts = forecastRepo.findAll();

        // Determine if the overall table is outdated
        boolean needGlobalUpdate = false;
        if (!allForecasts.isEmpty()) {
            allForecasts.sort(Comparator.comparing(ForecastWeatherData::getDateTime));
            ForecastWeatherData latest = allForecasts.get(0);
            LocalDate latestDate = latest.getDateTime().toLocalDate();
            System.out.println("Latest forecast date: " + latestDate);
            System.out.println("Today's date: " + today);
            if (!latestDate.isEqual(today)) {
                needGlobalUpdate = true;
            }
        } else {
            needGlobalUpdate = true;
        }

        if (needGlobalUpdate) {
            // The table is outdated, so delete all entries
            forecastRepo.deleteAll();
            // Fetch forecast for the requested location (today + 7 days)
            List<ForecastWeatherData> newForecasts = fetchForecastFromApi(lat, lon, today);
            forecastRepo.saveAll(newForecasts);
            return newForecasts;
        } else {
            // The table is up-to-date overall.
            // Check if forecasts for the requested location exist.
            List<ForecastWeatherData> forecastsForLocation = forecastRepo.findByLatitudeAndLongitude(lat, lon);
            if (forecastsForLocation.isEmpty()) {
                // If not, fetch and add forecasts for this location.
                List<ForecastWeatherData> newForecasts = fetchForecastFromApi(lat, lon, today);
                forecastRepo.saveAll(newForecasts);
                return newForecasts;
            } else {
                return forecastsForLocation;
            }
        }
    }

    // Helper method to fetch forecast data from Open-Meteo API
    private List<ForecastWeatherData> fetchForecastFromApi(double lat, double lon, LocalDate today) {
        String url = "https://api.open-meteo.com/v1/forecast"
                + "?latitude=" + lat
                + "&longitude=" + lon
                + "&hourly=temperature_2m,precipitation,shortwave_radiation,windspeed_10m,winddirection_10m,cloudcover"
                + "&timezone=auto"
                + "&start_date=" + today.toString()
                + "&end_date=" + today.plusDays(7).toString();

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
            // Parse the ISO date-time string into LocalDateTime
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

    private List<Double> convertToDoubleList(List<?> list) {
        return list.stream()
                .map(item -> ((Number) item).doubleValue())
                .collect(Collectors.toList());
    }
}

