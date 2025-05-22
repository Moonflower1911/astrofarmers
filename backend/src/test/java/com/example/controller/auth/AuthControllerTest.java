package com.example.controller.auth;

import com.example.dto.LoginRequestDTO;
import com.example.dto.UserDTO;
import com.example.model.auth.Role;
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
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthController authController;

    private UserDTO testUserDto;
    private User testUser;
    private LoginRequestDTO loginRequest;

    @BeforeEach
    void setUp() {
        // Initialize test data
        testUserDto = new UserDTO();
        testUserDto.setUsername("testuser");
        testUserDto.setEmail("test@example.com");
        testUserDto.setPassword("password123");
        testUserDto.setRole("USER");

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(PasswordUtils.hashPassword("password123"));

        Role role = new Role();
        role.setRoleId(1L);
        role.setNomRole("USER");

        testUser.setRole(role);

        loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Test
    void registerUser_Success() {
        Role role = new Role();
        role.setRoleId(1L);
        role.setNomRole("USER");

        when(authService.registerUser(any(UserDTO.class))).thenAnswer(invocation -> {
            UserDTO dto = invocation.getArgument(0);
            User user = new User();
            user.setUserId(1L);
            user.setEmail(dto.getEmail());
            user.setRole(role);
            return user;
        });

        // Mock static method JwtUtils.generateToken
        try (MockedStatic<JwtUtils> jwtUtilsStatic = mockStatic(JwtUtils.class)) {
            jwtUtilsStatic.when(() -> JwtUtils.generateToken(testUserDto.getEmail(), testUserDto.getRole()))
                    .thenReturn("testtoken");

            ResponseEntity<?> response = authController.registerUser(testUserDto);

            assertEquals(HttpStatus.OK, response.getStatusCode());

            @SuppressWarnings("unchecked")
            Map<String, String> responseBody = (Map<String, String>) response.getBody();
            assertNotNull(responseBody);
            assertEquals("/role/user", responseBody.get("redirectUrl"));
            assertEquals("1", responseBody.get("idUtilisateur"));
            assertEquals("testtoken", responseBody.get("token"));

            verify(authService).registerUser(any(UserDTO.class));
            jwtUtilsStatic.verify(() -> JwtUtils.generateToken(testUserDto.getEmail(), testUserDto.getRole()));
        }
    }

    @Test
    void login_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        try (MockedStatic<JwtUtils> jwtUtilsMockedStatic = mockStatic(JwtUtils.class)) {
            jwtUtilsMockedStatic.when(() -> JwtUtils.generateToken("test@example.com", "USER"))
                    .thenReturn("testtoken");

            ResponseEntity<Map<String, String>> response = authController.login(loginRequest);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            Map<String, String> responseBody = response.getBody();
            assertNotNull(responseBody);
            assertEquals("testtoken", responseBody.get("token"));
            assertEquals("1", responseBody.get("idUtilisateur"));

            verify(userRepository).findByEmail("test@example.com");
            jwtUtilsMockedStatic.verify(() -> JwtUtils.generateToken("test@example.com", "USER"));
        }
    }

    @Test
    void login_InvalidCredentials() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        ResponseEntity<Map<String, String>> response = authController.login(loginRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid credentials", response.getBody().get("error"));
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void login_WrongPassword() {
        User userWithWrongPassword = new User();
        userWithWrongPassword.setEmail("test@example.com");
        userWithWrongPassword.setPassword(PasswordUtils.hashPassword("wrongpassword"));

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(userWithWrongPassword));

        ResponseEntity<Map<String, String>> response = authController.login(loginRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid credentials", response.getBody().get("error"));
        verify(userRepository).findByEmail("test@example.com");
    }
}
