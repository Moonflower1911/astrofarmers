package com.example.controller;

import com.example.model.User;
import com.example.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepo;

    public UserController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // Endpoint to register a new user (farmer)
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        // Optionally: hash password here before saving
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().build(); // email already exists
        }
        return ResponseEntity.ok(userRepo.save(user));
    }

    // Optional: Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable UUID id) {
        return userRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
