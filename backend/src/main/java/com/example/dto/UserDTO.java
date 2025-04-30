package com.example.dto;

public class UserDTO {
    private Long userId;
    private String email;
    private String password;
    private String role;

    public UserDTO(){

    }
    // Constructor
    public UserDTO(Long userId,  String email, String password,
                          String role) {
        this.userId = userId;

        this.email = email;
        this.password = password;

        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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



    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
