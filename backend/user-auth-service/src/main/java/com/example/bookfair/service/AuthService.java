package com.example.bookfair.service;

import com.example.bookfair.dto.*;
import com.example.bookfair.exception.BadRequestException;
import com.example.bookfair.user.model.User;
import com.example.bookfair.user.repository.UserRepository;
import com.example.bookfair.user.security.JwtUtil;
import com.example.bookfair.util.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

/**
 * Service for authentication and user registration business logic
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    /**
     * Register a new user
     */
    @Transactional
    public Map<String, Object> register(UserRegistrationRequest request) {
        String email = request.getEmail().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("Email already registered");
        }

        // Create user entity from DTO
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(email);
        user.setPassword(encoder.encode(request.getPassword()));
        user.setGenres(request.getGenres());
        user.setRole("USER");

        userRepository.save(user);

        // Send welcome email (non-blocking)
        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception e) {
            logger.warn("Failed to send welcome email for {}: {}", user.getEmail(), e.getMessage());
        }

        return Map.of("message", "Registered successfully");
    }

    /**
     * Authenticate user and generate JWT token
     */
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase();
        String password = request.getPassword();

        Optional<User> userOpt = userRepository.findByEmail(email);

        // For security, use a generic error message
        if (userOpt.isEmpty() || !encoder.matches(password, userOpt.get().getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        User user = userOpt.get();

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

        // Create user response DTO
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getGenres()
        );

        // Create login response
        return new LoginResponse("Login successful", token, userResponse);
    }
}

