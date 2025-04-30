package com.example.controller.irrigation;

import com.example.entity.irrigation.IrrigationSchedule;
import com.example.service.irrigation.IrrigationSchedulingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/irrigation")
public class IrrigationController {

    @Autowired
    private IrrigationSchedulingService irrigationSchedulingService;

    @PostMapping("/schedule")
    public ResponseEntity<List<IrrigationSchedule>> generateSchedule(
            @RequestParam Long cropType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate plantingDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam double latitude,
            @RequestParam double longitude) {

        List<IrrigationSchedule> schedules = irrigationSchedulingService.generateIrrigationSchedule(
                cropType, latitude, longitude, plantingDate, startDate, endDate);

        return ResponseEntity.ok(schedules);
    }
}
