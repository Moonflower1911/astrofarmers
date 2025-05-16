package com.example.repository;

import com.example.model.ForecastWeatherData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ForecastWeatherDataRepository extends JpaRepository<ForecastWeatherData, UUID> {
    List<ForecastWeatherData> findByLatitudeAndLongitude(double latitude, double longitude);
}
