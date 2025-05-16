package com.example.controller.irrigation;

import com.example.model.auth.User;
import com.example.model.irrigation.IrrigationSchedule;
import com.example.repository.auth.UserRepository;
import com.example.security.JwtUtils;
import com.example.service.irrigation.IrrigationSchedulingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/user/irrigation/")
public class IrrigationController {

    @Autowired
    private IrrigationSchedulingService irrigationSchedulingService;

    @Autowired
    private UserRepository userRepository;


    @PostMapping("{id}/schedule")
    public ResponseEntity<List<IrrigationSchedule>> generateSchedule(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam Long cropType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate plantingDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam double latitude,
            @RequestParam double longitude,
            @PathVariable Long id) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String token = authorizationHeader.substring(7);
        if (JwtUtils.validateToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        User user = userRepository.findByUserId(id).get();

        List<IrrigationSchedule> schedules = irrigationSchedulingService.generateIrrigationSchedule(
                cropType, latitude, longitude, plantingDate, startDate, endDate, user);

        return ResponseEntity.ok(schedules);
    }






}
