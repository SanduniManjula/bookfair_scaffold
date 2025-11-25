package com.example.bookfair.user.controller;

import com.example.bookfair.user.model.User;
import com.example.bookfair.user.repository.UserRepository;
import com.example.bookfair.user.security.JwtUtil;
import com.example.bookfair.util.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    // REGISTER
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {

        String email = user.getEmail().toLowerCase();
        user.setEmail(email);

        if (userRepository.findByEmail(email).isPresent()) {
            return Map.of("error", "Email already registered");
        }

        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            return Map.of("error", "Password cannot be empty");
        }

        // Encode password
        user.setPassword(encoder.encode(user.getPassword()));
        userRepository.save(user);

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        return Map.of("message", "Registered successfully");
    }


    // LOGIN
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            return Map.of("error", "Email and password are required");
        }

        email = email.toLowerCase();

        Optional<User> userOpt = userRepository.findByEmail(email);

        // For security, use a generic error message
        if (userOpt.isEmpty() || !encoder.matches(password, userOpt.get().getPassword())) {
            return Map.of("error", "Invalid email or password");
        }

        User user = userOpt.get();

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

        // Login success
        return Map.of(
                "message", "Login successful",
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "username", user.getUsername(),
                        "role", user.getRole()
                )
        );
    }
}
