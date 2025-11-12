package com.example.bookfair.service;

import com.example.bookfair.dto.UpdateGenresRequest;
import com.example.bookfair.dto.UserResponse;
import com.example.bookfair.exception.BadRequestException;
import com.example.bookfair.exception.ResourceNotFoundException;
import com.example.bookfair.user.model.User;
import com.example.bookfair.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for user profile business logic
 */
@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    /**
     * Get user profile
     */
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getGenres() != null ? user.getGenres() : ""
        );
    }

    /**
     * Update user genres
     */
    @Transactional
    public void updateGenres(UpdateGenresRequest request, String authenticatedEmail) {
        // Verify the request email matches authenticated user
        if (!authenticatedEmail.equalsIgnoreCase(request.getEmail())) {
            throw new BadRequestException("Email mismatch. You can only update your own genres.");
        }

        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setGenres(request.getGenres());
        userRepository.save(user);
        
        logger.info("Updated genres for user: {}", authenticatedEmail);
    }

    /**
     * Get user by ID (for cross-service communication)
     */
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getGenres() != null ? user.getGenres() : ""
        );
    }

    /**
     * Get user by email (for cross-service communication)
     */
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getGenres() != null ? user.getGenres() : ""
        );
    }
}

