package com.example.controller.irrigation;

import com.example.entity.auth.User;
import com.example.entity.irrigation.IrrigationEvent;
import com.example.repository.auth.UserRepository;
import com.example.security.JwtUtils;
import com.example.service.irrigation.IrrigationEventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/irrigationEvents")
public class IrrigationEventController {

    private final IrrigationEventService irrigationEventService;
    private final UserRepository userRepository;

    public IrrigationEventController(IrrigationEventService irrigationEventService, UserRepository userRepository) {
        this.irrigationEventService = irrigationEventService;
        this.userRepository = userRepository;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<IrrigationEvent>> getEventsByUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authorizationHeader) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String token = authorizationHeader.substring(7);
        if (JwtUtils.validateToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        User user = userRepository.findByUserId(userId).get();
        return ResponseEntity.ok(irrigationEventService.getEventsByUser(user));
    }

    @PostMapping("/{eventId}/done")
    public ResponseEntity<IrrigationEvent> markEventAsDone(
            @PathVariable Long eventId,
            @RequestHeader("Authorization") String authorizationHeader
    ) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String token = authorizationHeader.substring(7);
        if (JwtUtils.validateToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        return ResponseEntity.ok(irrigationEventService.markEventAsDone(eventId));
    }
}
