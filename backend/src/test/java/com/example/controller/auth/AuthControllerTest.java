package com.example.controller.auth;

import com.example.dto.LoginRequestDTO;
import com.example.dto.UserDTO;
import com.example.model.auth.User;
import com.example.repository.auth.UserRepository;
import com.example.security.JwtUtils;
import com.example.security.PasswordUtils;
import com.example.service.auth.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthController authController;

    private UserDTO testUserDto;
    private User testUser;
    private LoginRequestDTO loginRequest;

    @BeforeEach
    void setUp() {
        testUserDto = new UserDTO();
        testUserDto.setUsername("testuser");
        testUserDto.setEmail("test@example.com");
        testUserDto.setPassword("password123");
        testUserDto.setRole("USER");

        testUser = new User();
        testUser.setUserId(1L); // Auto-generated ID
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(PasswordUtils.hashPassword("password123"));

        loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Test
    void registerUser_Success() {
        when(authService.registerUser(any(UserDTO.class))).thenReturn(testUser);
        when(jwtUtils.generateToken(anyString(), anyString())).thenReturn("testtoken");

        ResponseEntity<?> response = authController.registerUser(testUserDto);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        @SuppressWarnings("unchecked")
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertNotNull(responseBody);
        assertEquals("/role/user", responseBody.get("redirectUrl"));
        assertEquals("1", responseBody.get("idUtilisateur")); // Verify auto-generated ID
        assertEquals("testtoken", responseBody.get("token"));
    }

    @Test
    void login_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(jwtUtils.generateToken(anyString(), anyString())).thenReturn("testtoken");

        ResponseEntity<Map<String, String>> response = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, String> responseBody = response.getBody();
        assertNotNull(responseBody);
        assertEquals("testtoken", responseBody.get("token"));
        assertEquals("1", responseBody.get("idUtilisateur")); // Verify auto-generated ID
    }

    @Test
    void login_InvalidCredentials() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        ResponseEntity<Map<String, String>> response = authController.login(loginRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid credentials", response.getBody().get("error"));
    }

    @Test
    void login_WrongPassword() {
        User userWithWrongPassword = new User();
        userWithWrongPassword.setEmail("test@example.com");
        userWithWrongPassword.setPassword(PasswordUtils.hashPassword("wrongpassword"));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(userWithWrongPassword));

        ResponseEntity<Map<String, String>> response = authController.login(loginRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid credentials", response.getBody().get("error"));
    }
}