package com.example.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class PasswordUtils {

    // Custom hash function using SHA-256
    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    // Check if the provided password matches the hashed password
    public static boolean checkPassword(String plainPassword, String hashedPassword) {
        // Hash the input plain password
        String hashedInputPassword = hashPassword(plainPassword);

        // Compare the hashed input password with the stored hashed password
        return hashedInputPassword.equals(hashedPassword);
    }
}
