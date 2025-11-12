package com.example.bookfair.user.controller;

import com.example.bookfair.user.model.User;
import com.example.bookfair.user.model.Stall;
import com.example.bookfair.user.repository.UserRepository;
import com.example.bookfair.user.repository.StallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StallRepository stallRepository;

    @GetMapping("/profile")
    public Map<String, Object> getProfile(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }

        User user = userOpt.get();
        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "username", user.getUsername(),
                "role", user.getRole(),
                "genres", user.getGenres() != null ? user.getGenres() : ""
        );
    }

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

    @PostMapping("/save-stall-genres")
    public Map<String, Object> saveStallGenres(@RequestBody Map<String, List<Map<String, Object>>> request, Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }

        User user = userOpt.get();
        List<Map<String, Object>> stallGenresList = request.get("stallGenres");
        
        if (stallGenresList == null || stallGenresList.isEmpty()) {
            return Map.of("error", "No stall genres provided");
        }

        // Collect all unique genres for the user
        Set<String> allUserGenres = new HashSet<>();
        
        // Update each stall with its genres
        for (Map<String, Object> stallGenreData : stallGenresList) {
            Object stallIdObj = stallGenreData.get("stallId");
            String genresStr = (String) stallGenreData.get("genres");
            
            if (stallIdObj == null || genresStr == null) {
                continue;
            }
            
            Long stallId;
            if (stallIdObj instanceof Integer) {
                stallId = ((Integer) stallIdObj).longValue();
            } else if (stallIdObj instanceof Long) {
                stallId = (Long) stallIdObj;
            } else {
                continue;
            }
            
            Optional<Stall> stallOpt = stallRepository.findById(stallId);
            if (stallOpt.isPresent()) {
                Stall stall = stallOpt.get();
                stall.setGenres(genresStr);
                stallRepository.save(stall);
                
                // Add genres to user's collection
                if (!genresStr.isEmpty()) {
                    String[] genres = genresStr.split(",");
                    for (String genre : genres) {
                        allUserGenres.add(genre.trim());
                    }
                }
            }
        }
        
        // Update user's genres with all unique genres
        String userGenres = String.join(", ", allUserGenres);
        user.setGenres(userGenres);
        userRepository.save(user);

        return Map.of("message", "Genres saved successfully");
    }
}
