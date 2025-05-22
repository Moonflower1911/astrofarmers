package com.example.service.auth;

import com.example.dto.UserDTO;
import com.example.model.auth.Role;
import com.example.model.auth.User;
import com.example.repository.auth.RoleRepository;
import com.example.repository.auth.UserRepository;
import com.example.security.PasswordUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private AuthService authService;

    private UserDTO testUserDto;
    private Role userRole;
    private User savedUser;

    @BeforeEach
    void setUp() {
        testUserDto = new UserDTO();
        testUserDto.setUsername("testuser");
        testUserDto.setEmail("test@example.com");
        testUserDto.setPassword("password123");
        testUserDto.setRole("USER");

        //userRole = new Role();
        //userRole.setNomRole("USER");

        savedUser = new User();
        savedUser.setUsername("testuser");
        savedUser.setEmail("test@example.com");
        savedUser.setPassword(PasswordUtils.hashPassword("password123"));
        savedUser.setRole(userRole);
    }

    @Test
    void registerUser_Success() {
        when(userRepository.existsByEmail(testUserDto.getEmail())).thenReturn(false);
        when(roleRepository.findByRoleName("USER")).thenReturn(Optional.of(userRole));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            // Simulate auto-generated ID
            User userWithId = new User();
            userWithId.setUserId(1L); // Simulated auto-generated ID
            userWithId.setUsername(user.getUsername());
            userWithId.setEmail(user.getEmail());
            userWithId.setPassword(user.getPassword());
            userWithId.setRole(user.getRole());
            return userWithId;
        });

        User result = authService.registerUser(testUserDto);

        assertNotNull(result);
        assertNotNull(result.getUserId()); // Verify ID was generated
        assertEquals("test@example.com", result.getEmail());
        assertEquals("USER", result.getRole().getNomRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_EmailExists_ThrowsException() {
        when(userRepository.existsByEmail(testUserDto.getEmail())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.registerUser(testUserDto);
        });

        assertEquals("Email already exists!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginUser_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(savedUser));

        String result = authService.loginUser("test@example.com", "password123");

        assertEquals("Login successful!", result);
    }

    @Test
    void loginUser_InvalidPassword_ThrowsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(savedUser));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.loginUser("test@example.com", "wrongpassword");
        });

        assertEquals("Invalid credentials!", exception.getMessage());
    }
}