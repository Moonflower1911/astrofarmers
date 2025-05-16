package com.example.controller.auth;


import com.example.dto.LoginRequestDTO;
import com.example.dto.UserDTO;
import com.example.model.auth.User;
import com.example.repository.auth.UserRepository;
import com.example.security.JwtUtils;
import com.example.security.PasswordUtils;
import com.example.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody UserDTO userDTO) {
        try {
            User registeredUser = authService.registerUser(userDTO);
            return ResponseEntity.ok("User registered successfully with ID: " + registeredUser.getUserId());
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body("Registration failed: " + ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequestDTO loginRequest) {
        Optional<User> optionalUser = userRepository.findByEmail(loginRequest.getEmail());

        if (optionalUser.isEmpty() ||
                !PasswordUtils.checkPassword(loginRequest.getPassword(), optionalUser.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        User user = optionalUser.get();
        String role = user.getRole().getNomRole(); // Either "USER" or "ADMIN"
        String token = JwtUtils.generateToken(user.getEmail(), role);
        String redirectUrl = "/" + role.toLowerCase() + "/" + user.getUserId();

        return ResponseEntity.ok(Map.of(
                "token", token,
                "redirectUrl", redirectUrl,
                "idUtilisateur", "" + user.getUserId(),
                "role", role
        ));
    }

}

