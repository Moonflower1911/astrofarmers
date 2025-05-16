package com.example.controller;

import com.example.model.Land;
import com.example.model.User;
import com.example.repository.LandRepository;
import com.example.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
    public ResponseEntity<Land> addLand(@RequestParam UUID userId, @RequestBody Land land) {
        Optional<User> user = userRepo.findById(userId);
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        land.setUser(user.get());
        return ResponseEntity.ok(landRepo.save(land));
    }

    // List lands for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Land>> getLandsForUser(@PathVariable UUID userId) {
        Optional<User> user = userRepo.findById(userId);
        return user.map(value -> ResponseEntity.ok(landRepo.findByUser(value)))
                .orElse(ResponseEntity.notFound().build());
    }
}
