package com.example.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
public class WeatherAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String type; //The type of the extreme weather condition (e.g.: "Storm")
    private String message; //e.g : "Temperature over 45°"
    private double latitude;
    private double longitude;
    private LocalDateTime timestamp; //when it is expected to occur
}
