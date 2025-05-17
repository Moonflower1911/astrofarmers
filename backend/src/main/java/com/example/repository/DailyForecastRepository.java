package com.example.repository;

import com.example.model.DailyForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DailyForecastRepository extends JpaRepository<DailyForecast, UUID> {
    List<DailyForecast> findByLatitudeAndLongitude(double lat, double lon);
}
