package com.example.config;

import com.example.model.auth.Role;
import com.example.repository.auth.RoleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RoleSeeder {

    @Autowired
    private RoleRepository roleRepository;

    @PostConstruct
    public void seedRoles() {
        if (roleRepository.findByRoleName("USER").isEmpty()) {
            Role userRole = new Role();
            userRole.setNomRole("USER");
            roleRepository.save(userRole);
        }

        if (roleRepository.findByRoleName("ADMIN").isEmpty()) {
            Role adminRole = new Role();
            adminRole.setNomRole("ADMIN");
            roleRepository.save(adminRole);
        }
    }
}
