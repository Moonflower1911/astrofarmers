package com.example.controller;

import com.example.model.Land;
import com.example.model.auth.User;
import com.example.repository.LandRepository;
import com.example.repository.auth.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import com.example.security.JwtUtils;
import org.springframework.http.HttpStatus;


@RestController
@RequestMapping("/api/lands")
public class LandController {

    private final LandRepository landRepo;
    private final UserRepository userRepo;

    public LandController(LandRepository landRepo, UserRepository userRepo) {
        this.landRepo = landRepo;
        this.userRepo = userRepo;
    }

    // Add a new land for a specific user
    @PostMapping("/add")
    public ResponseEntity<Land> addLand(@RequestParam Long userId, @RequestBody Land land,
                                        @RequestHeader("Authorization") String authorizationHeader
    ) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String token = authorizationHeader.substring(7);
        if (JwtUtils.validateToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Optional<User> user = userRepo.findByUserId(userId);
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        land.setUser(user.get());
        return ResponseEntity.ok(landRepo.save(land));
    }

    // List lands for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Land>> getLandsForUser(@PathVariable Long userId,
                                                      @RequestHeader("Authorization") String authorizationHeader
    ) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String token = authorizationHeader.substring(7);
        if (JwtUtils.validateToken(token) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        Optional<User> user = userRepo.findByUserId(userId);
        return user.map(value -> ResponseEntity.ok(landRepo.findByUser(value)))
                .orElse(ResponseEntity.notFound().build());
    }
}
