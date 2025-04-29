package com.example.model.irrigation;

import java.util.List;
import java.util.Map;

public class SoilMoistureResponse {
    private double latitude;
    private double longitude;
    private double elevation;
    private String timezone;
    private Map<String, String> hourly_units;

    private HourlyData hourly;


    public static class HourlyData {
        private List<String> time;
        private List<Double> soil_moisture_0_to_1cm;
        private List<Double> soil_moisture_1_to_3cm;
        private List<Double> soil_moisture_3_to_9cm;
        private List<Double> soil_moisture_9_to_27cm;
        private List<Double> soil_moisture_27_to_81cm;
        private List<Double> rain;

        // Getters and setters
        public List<String> getTime() {
            return time;
        }

        public void setTime(List<String> time) {
            this.time = time;
        }

        public List<Double> getSoil_moisture_0_to_1cm() {
            return soil_moisture_0_to_1cm;
        }

        public void setSoil_moisture_0_to_1cm(List<Double> soil_moisture_0_to_1cm) {
            this.soil_moisture_0_to_1cm = soil_moisture_0_to_1cm;
        }

        public List<Double> getSoil_moisture_1_to_3cm() {
            return soil_moisture_1_to_3cm;
        }

        public void setSoil_moisture_1_to_3cm(List<Double> soil_moisture_1_to_3cm) {
            this.soil_moisture_1_to_3cm = soil_moisture_1_to_3cm;
        }

        public List<Double> getSoil_moisture_3_to_9cm() {
            return soil_moisture_3_to_9cm;
        }

        public void setSoil_moisture_3_to_9cm(List<Double> soil_moisture_3_to_9cm) {
            this.soil_moisture_3_to_9cm = soil_moisture_3_to_9cm;
        }

        public List<Double> getSoil_moisture_9_to_27cm() {
            return soil_moisture_9_to_27cm;
        }

        public void setSoil_moisture_9_to_27cm(List<Double> soil_moisture_9_to_27cm) {
            this.soil_moisture_9_to_27cm = soil_moisture_9_to_27cm;
        }

        public List<Double> getSoil_moisture_27_to_81cm() {
            return soil_moisture_27_to_81cm;
        }

        public void setSoil_moisture_27_to_81cm(List<Double> soil_moisture_27_to_81cm) {
            this.soil_moisture_27_to_81cm = soil_moisture_27_to_81cm;
        }

        public List<Double> getRain() {
            return rain;
        }

        public void setRain(List<Double> rain) {
            this.rain = rain;
        }
    }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public double getElevation() { return elevation; }
    public void setElevation(double elevation) { this.elevation = elevation; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public Map<String, String> getHourly_units() { return hourly_units; }
    public void setHourly_units(Map<String, String> hourly_units) { this.hourly_units = hourly_units; }

    public HourlyData getHourly() { return hourly; }
    public void setHourly(HourlyData hourly) { this.hourly = hourly; }
}
