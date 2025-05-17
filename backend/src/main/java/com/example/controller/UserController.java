package com.example.controller;
import com.example.model.WeatherAlert;
import com.example.model.auth.User;
import com.example.repository.auth.UserRepository;
import com.example.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // or your frontend
public class UserController {

    private final UserRepository userRepo;

    public UserController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // 🔹 GET user info by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserInfo(@PathVariable Long id) {
        return userRepo.findByUserId(id)
                .map(user -> {
                    user.setPassword(null); // Don't expose password
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 PUT to update user info
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepo.findByUserId(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    user.setEmail(updatedUser.getEmail());

                    return ResponseEntity.ok(userRepo.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

