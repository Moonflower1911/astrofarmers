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

        userRole = new Role();
        userRole.setRoleId(1L);
        userRole.setNomRole("USER");

        savedUser = new User();
        savedUser.setUserId(1L);
        savedUser.setUsername("testuser");
        savedUser.setEmail("test@example.com");
        savedUser.setPassword(PasswordUtils.hashPassword("password123"));
        savedUser.setRole(userRole);
    }

    @Test
    void registerUser_Success() {
        when(userRepository.existsByEmail(testUserDto.getEmail())).thenReturn(false);
        when(roleRepository.findByRoleName("USER")).thenReturn(Optional.of(userRole));
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.registerUser(testUserDto);

        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("USER", result.getRole().getNomRole());

        verify(userRepository).existsByEmail(testUserDto.getEmail());
        verify(roleRepository).findByRoleName("USER");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUser_EmailExists_ThrowsException() {
        when(userRepository.existsByEmail(testUserDto.getEmail())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.registerUser(testUserDto);
        });

        assertEquals("Email already exists!", exception.getMessage());
        verify(userRepository).existsByEmail(testUserDto.getEmail());
        verify(roleRepository, never()).findByRoleName(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerUser_RoleNotFound_ThrowsException() {
        when(userRepository.existsByEmail(testUserDto.getEmail())).thenReturn(false);
        when(roleRepository.findByRoleName("USER")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.registerUser(testUserDto);
        });

        assertEquals("Role not found", exception.getMessage());
        verify(userRepository).existsByEmail(testUserDto.getEmail());
        verify(roleRepository).findByRoleName("USER");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginUser_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(savedUser));

        String result = authService.loginUser("test@example.com", "password123");

        assertEquals("Login successful!", result);
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void loginUser_InvalidPassword_ThrowsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(savedUser));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.loginUser("test@example.com", "wrongpassword");
        });

        assertEquals("Invalid credentials!", exception.getMessage());
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void loginUser_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.loginUser("nonexistent@example.com", "password123");
        });

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findByEmail("nonexistent@example.com");
    }
}