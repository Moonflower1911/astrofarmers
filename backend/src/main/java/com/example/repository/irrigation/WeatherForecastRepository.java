package com.example.repository.irrigation;

import com.example.model.irrigation.WeatherForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeatherForecastRepository extends JpaRepository<WeatherForecast, Long> {


    @Query("SELECT wf FROM WeatherForecast wf " +
            "WHERE wf.date = :date " +
            "AND ABS(wf.latitude - :lat) < 0.0001 " +
            "AND ABS(wf.longitude - :lon) < 0.0001")
    Optional<WeatherForecast> findByDateAndLocation(
            @Param("date") LocalDate date,
            @Param("lat") double latitude,
            @Param("lon") double longitude
    );

    @Query("SELECT wf FROM WeatherForecast wf WHERE wf.date = :date AND wf.latitude = :latitude AND wf.longitude = :longitude")
    Optional<WeatherForecast> findByDateAndLatitudeAndLongitude(LocalDate date, double latitude, double longitude);



    @Query("SELECT wf FROM WeatherForecast wf WHERE wf.date BETWEEN :startDate AND :endDate AND wf.latitude = :latitude AND wf.longitude = :longitude")
    List<WeatherForecast> findByDateBetweenAndLatitudeAndLongitude(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("latitude") double latitude,
            @Param("longitude") double longitude
    );

}
