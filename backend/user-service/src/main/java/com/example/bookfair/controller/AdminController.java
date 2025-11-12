package com.example.bookfair.user.controller;

import com.example.bookfair.user.model.User;
import com.example.bookfair.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    // Helper method to check if user is admin
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) return false;
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.isPresent() && "ADMIN".equals(userOpt.get().getRole());
    }

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        List<User> users = userRepository.findAll();
        List<Map<String, Object>> userList = users.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("email", user.getEmail());
                    userMap.put("role", user.getRole());
                    userMap.put("genres", user.getGenres());
                    userMap.put("createdAt", user.getCreatedAt());
                    // Note: Reservation count would need to be fetched from reservation-service
                    return userMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("users", userList, "total", userList.size()));
    }

    // Update user role
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        String newRole = request.get("role");
        if (newRole == null || (!newRole.equals("USER") && !newRole.equals("ADMIN"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid role. Must be USER or ADMIN."));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        user.setRole(newRole);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User role updated successfully", "user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole()
        )));
    }

    // Delete user
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        
        // Note: Reservations should be deleted via reservation-service API
        // This is a limitation - in a true microservice, we'd need to call reservation-service
        
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of("message", "User deleted successfully. Note: Reservations should be deleted separately via reservation-service."));
    }

    // Get statistics (user-related only)
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        long totalUsers = userRepository.count();
        long adminUsers = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .count();
        long regularUsers = totalUsers - adminUsers;

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "adminUsers", adminUsers,
                "regularUsers", regularUsers,
                "note", "Reservation statistics are available via reservation-service /api/admin/stats"
        ));
    }
}
