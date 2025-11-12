package com.example.bookfair.user.controller;

import com.example.bookfair.dto.UpdateGenresRequest;
import com.example.bookfair.dto.UserResponse;
import com.example.bookfair.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        UserResponse response = userService.getProfile(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/genres")
    public ResponseEntity<Map<String, Object>> updateGenres(@Valid @RequestBody UpdateGenresRequest request, Authentication authentication) {
        String email = authentication.getName();
        userService.updateGenres(request, email);
        return ResponseEntity.ok(Map.of("message", "Genres updated"));
    }

    // Endpoint for cross-service communication (used by reservation-service)
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    // Endpoint for cross-service communication (used by reservation-service)
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(response);
    }
}
