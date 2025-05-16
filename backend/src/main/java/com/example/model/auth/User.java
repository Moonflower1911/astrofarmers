package com.example.model.auth;

import jakarta.persistence.*;


@Entity
@Table(name = "agri_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(length = 100,  unique = true)
    private String email;

    @Column(length = 255)
    private String password;

    @ManyToOne
    @JoinColumn(name = "role",  columnDefinition = "SMALLINT")
    private Role role;


    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}

