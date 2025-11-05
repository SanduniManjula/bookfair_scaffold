package com.example.bookfair.user.controller;

import com.example.bookfair.user.model.User;
import com.example.bookfair.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/genres")
    public Map<String, Object> updateGenres(@RequestBody Map<String, String> request, Authentication authentication) {
        String email = authentication.getName();
        String genres = request.get("genres");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }

        User user = userOpt.get();
        user.setGenres(genres);
        userRepository.save(user);

        return Map.of("message", "Genres updated");
    }
}
