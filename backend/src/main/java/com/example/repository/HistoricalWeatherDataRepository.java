package com.example.repository;

import com.example.model.HistoricalWeatherData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HistoricalWeatherDataRepository extends JpaRepository<HistoricalWeatherData, UUID> {
    Optional<HistoricalWeatherData> findByLatitudeAndLongitudeAndDate(double latitude, double longitude, LocalDate date);
}
