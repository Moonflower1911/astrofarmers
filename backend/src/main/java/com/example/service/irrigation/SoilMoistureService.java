package com.example.service.irrigation;

import com.example.dto.irrigation.SoilMoistureResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class SoilMoistureService {

    private final RestTemplate restTemplate = new RestTemplate();

    public SoilMoistureResponse fetchWeatherData(double latitude, double longitude,
                                                 Integer forecastDays, String startDate, String endDate) {

        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl("https://api.open-meteo.com/v1/forecast")
                .queryParam("latitude", latitude)
                .queryParam("longitude", longitude)
                .queryParam("hourly", "soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm,rain");

        // Apply either forecast_days or start_date & end_date
        if (forecastDays != null) {
            builder.queryParam("forecast_days", forecastDays);
        } else if (startDate != null && endDate != null) {
            builder.queryParam("start_date", startDate)
                    .queryParam("end_date", endDate);
        } else {
            // Default to 1 day forecast
            builder.queryParam("forecast_days", 1);
        }

        String url = builder.toUriString();
        return restTemplate.getForObject(url, SoilMoistureResponse.class);
    }
}
