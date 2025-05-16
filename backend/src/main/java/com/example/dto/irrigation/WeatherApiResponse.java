package com.example.model.irrigation;

import java.util.List;
import java.util.Map;

public class WeatherApiResponse {
    private Hourly hourly;

    public Hourly getHourly() {
        return hourly;
    }

    public static class Hourly {
        private List<String> time;
        private List<Double> temperature_2m;
        private List<Double> soil_moisture_0_to_1cm;
        private List<Double> soil_moisture_1_to_3cm;
        private List<Double> soil_moisture_3_to_9cm;
        private List<Double> wind_speed_10m;
        private List<Double> relative_humidity_2m;
        private List<Double> rain;

        // Getters
        public List<String> getTime() { return time; }
        public List<Double> getTemperature_2m() { return temperature_2m; }
        public List<Double> getSoil_moisture_0_to_1cm() { return soil_moisture_0_to_1cm; }
        public List<Double> getWind_speed_10m() { return wind_speed_10m; }
        public List<Double> getRelative_humidity_2m() { return relative_humidity_2m; }
        public List<Double> getRain() { return rain; }

        public List<Double> getSoil_moisture_1_to_3cm() {
            return soil_moisture_1_to_3cm;
        }

        public List<Double> getSoil_moisture_3_to_9cm() {
            return soil_moisture_3_to_9cm;
        }
    }
}

