package com.example.repository;

import com.example.model.ForecastWeatherData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface ForecastWeatherDataRepository extends JpaRepository<ForecastWeatherData, UUID> {

    List<ForecastWeatherData> findByLatitudeAndLongitude(double latitude, double longitude);

    @Transactional
    @Modifying
    @Query("DELETE FROM ForecastWeatherData f WHERE f.latitude = :latitude AND f.longitude = :longitude")
    void deleteByLatitudeAndLongitude(double latitude, double longitude);
}
