package com.example.model.irrigation;

import com.example.model.auth.User;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class IrrigationSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate date;
    private double irrigationAmount; // Amount of water to be used (in mm or liters)

    @ManyToOne
    private CropType cropType;

    @ManyToOne
    private WeatherForecast weatherForecast; // Weather data for the day

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public double getIrrigationAmount() {
        return irrigationAmount;
    }

    public void setIrrigationAmount(double irrigationAmount) {
        this.irrigationAmount = irrigationAmount;
    }

    public CropType getCropType() {
        return cropType;
    }

    public void setCropType(CropType cropType) {
        this.cropType = cropType;
    }

    public WeatherForecast getWeatherForecast() {
        return weatherForecast;
    }

    public void setWeatherForecast(WeatherForecast weatherForecast) {
        this.weatherForecast = weatherForecast;
    }
}

