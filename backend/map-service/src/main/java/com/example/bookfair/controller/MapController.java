package com.example.bookfair.mapservice.controller;

import com.example.bookfair.mapservice.model.MapLayout;
import com.example.bookfair.stallservice.model.Stall;
import com.example.bookfair.user.model.User;
import com.example.bookfair.mapservice.repository.MapLayoutRepository;
import com.example.bookfair.stallservice.repository.StallRepository;
import com.example.bookfair.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/map")
@CrossOrigin(origins = "http://localhost:3000")
public class MapController {

    @Autowired
    private MapLayoutRepository mapLayoutRepository;

    @Autowired
    private StallRepository stallRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;


    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) return false;
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.isPresent() && "ADMIN".equals(userOpt.get().getRole());
    }


    @GetMapping("/layout")
    public ResponseEntity<?> getMapLayout(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        Optional<MapLayout> layoutOpt = mapLayoutRepository.findTopByOrderByIdDesc();
        if (layoutOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("halls", new ArrayList<>()));
        }

        try {
            MapLayout layout = layoutOpt.get();
            Map<String, Object> layoutData = objectMapper.readValue(layout.getLayoutData(), Map.class);
            return ResponseEntity.ok(layoutData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to parse map layout: " + e.getMessage()));
        }
    }

    @PostMapping("/layout")
    public ResponseEntity<?> saveMapLayout(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        try {
            // Validate halls
            if (!request.containsKey("halls") || !(request.get("halls") instanceof List)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid request: 'halls' array is required"));
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> halls = (List<Map<String, Object>>) request.get("halls");

            int createdStalls = 0, updatedStalls = 0, errorStalls = 0;

            for (Map<String, Object> hall : halls) {
                Object stallsObj = hall.get("stalls");
                if (stallsObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> stalls = (List<Map<String, Object>>) stallsObj;

                    for (Map<String, Object> stallData : stalls) {
                        try {
                            String stallId = (String) stallData.get("stallId");
                            if (stallId == null || stallId.isEmpty())
                                stallId = (String) stallData.get("id");
                            if (stallId == null || stallId.isEmpty()) continue;

                            final String finalStallId = stallId;
                            Optional<Stall> existing = stallRepository.findAll().stream()
                                    .filter(s -> finalStallId.equals(s.getName()))
                                    .findFirst();

                            Stall stall = existing.orElseGet(Stall::new);
                            stall.setName(stallId);
                            stall.setSize(((String) stallData.getOrDefault("size", "SMALL")).toUpperCase());
                            stall.setX(((Number) stallData.getOrDefault("x", 0)).intValue());
                            stall.setY(((Number) stallData.getOrDefault("y", 0)).intValue());
                            if (existing.isEmpty()) stall.setReserved(false);
                            stallRepository.save(stall);

                            if (existing.isPresent()) updatedStalls++; else createdStalls++;
                        } catch (Exception e) {
                            errorStalls++;
                        }
                    }
                }
            }


            String layoutJson = objectMapper.writeValueAsString(request);
            MapLayout layout = new MapLayout();
            layout.setLayoutData(layoutJson);
            MapLayout saved = mapLayoutRepository.save(layout);

            return ResponseEntity.ok(Map.of(
                    "message", "Map layout saved successfully",
                    "layoutId", saved.getId(),
                    "createdStalls", createdStalls,
                    "updatedStalls", updatedStalls,
                    "errorStalls", errorStalls
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save map layout: " + e.getMessage()));
        }
    }


    @DeleteMapping("/layout")
    public ResponseEntity<?> deleteAllMapLayouts(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        try {
            long count = mapLayoutRepository.count();
            mapLayoutRepository.deleteAll();
            return ResponseEntity.ok(Map.of(
                    "message", "All map layouts deleted successfully",
                    "deletedCount", count
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete map layouts: " + e.getMessage()));
        }
    }
}
