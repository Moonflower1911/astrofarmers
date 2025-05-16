package com.example.service.auth;


import com.example.dto.UserDTO;
import com.example.model.auth.Role;
import com.example.model.auth.User;
import com.example.repository.auth.RoleRepository;
import com.example.repository.auth.UserRepository;
import com.example.security.PasswordUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;


    public User registerUser(UserDTO utilisateurDTO) {
        if (userRepository.existsByEmail(utilisateurDTO.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }



        // Map role
        Role role = roleRepository.findByRoleName(utilisateurDTO.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        // Hash the password using the custom hash function
        String hashedPassword = PasswordUtils.hashPassword(utilisateurDTO.getPassword());

        // Create a new user
        User utilisateur = new User();
        utilisateur.setUsername(utilisateurDTO.getUsername());
        utilisateur.setEmail(utilisateurDTO.getEmail());
        utilisateur.setPassword(hashedPassword);
        utilisateur.setRole(role);

        // Save the user
        return userRepository.save(utilisateur);
    }


    public String loginUser(String email, String password) {
        User utilisateur = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Hash the input password and compare
        String hashedPassword = PasswordUtils.hashPassword(password);
        if (!hashedPassword.equals(utilisateur.getPassword())) {
            throw new RuntimeException("Invalid credentials!");
        }

        // Return a success message or token (if needed)
        return "Login successful!";
    }

}

