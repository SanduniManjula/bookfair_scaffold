package com.example.bookfair.user.controller;

import com.example.bookfair.user.model.Reservation;
import com.example.bookfair.user.model.User;
import com.example.bookfair.user.model.MapLayout;
import com.example.bookfair.user.repository.ReservationRepository;
import com.example.bookfair.user.repository.UserRepository;
import com.example.bookfair.user.repository.StallRepository;
import com.example.bookfair.user.repository.MapLayoutRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private StallRepository stallRepository;

    @Autowired
    private MapLayoutRepository mapLayoutRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private ObjectMapper objectMapper;

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
                    // Count reservations for each user
                    long reservationCount = reservationRepository.countByUserId(user.getId());
                    userMap.put("reservationCount", reservationCount);
                    return userMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("users", userList, "total", userList.size()));
    }

    // Get all reservations
    @GetMapping("/reservations")
    public ResponseEntity<?> getAllReservations(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        List<Reservation> reservations = reservationRepository.findAll();
        List<Map<String, Object>> reservationList = reservations.stream()
                .map(reservation -> {
                    Map<String, Object> resMap = new HashMap<>();
                    resMap.put("id", reservation.getId());
                    resMap.put("userId", reservation.getUser().getId());
                    resMap.put("userEmail", reservation.getUser().getEmail());
                    resMap.put("username", reservation.getUser().getUsername());
                    resMap.put("stallId", reservation.getStall().getId());
                    resMap.put("stallName", reservation.getStall().getName());
                    resMap.put("stallSize", reservation.getStall().getSize());
                    resMap.put("createdAt", reservation.getCreatedAt());
                    resMap.put("qrCodeFilename", reservation.getQrCodeFilename());
                    return resMap;
                })
                .sorted((a, b) -> {
                    // Sort by created date, newest first
                    LocalDateTime dateA = (LocalDateTime) a.get("createdAt");
                    LocalDateTime dateB = (LocalDateTime) b.get("createdAt");
                    return dateB.compareTo(dateA);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("reservations", reservationList, "total", reservationList.size()));
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
        
        // Delete all reservations for this user first
        List<Reservation> userReservations = reservationRepository.findByUser(user);
        reservationRepository.deleteAll(userReservations);
        
        // Then delete the user
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of("message", "User and their reservations deleted successfully"));
    }

    // Delete reservation
    @DeleteMapping("/reservations/{reservationId}")
    public ResponseEntity<?> deleteReservation(@PathVariable Long reservationId, Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        Optional<Reservation> resOpt = reservationRepository.findById(reservationId);
        if (resOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Reservation not found"));
        }

        Reservation reservation = resOpt.get();
        
        // Mark the stall as available again
        reservation.getStall().setReserved(false);
        stallRepository.save(reservation.getStall());
        
        // Delete the reservation
        reservationRepository.delete(reservation);

        return ResponseEntity.ok(Map.of("message", "Reservation deleted successfully"));
    }

    // Get statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        long totalUsers = userRepository.count();
        long totalReservations = reservationRepository.count();
        long adminUsers = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .count();
        long regularUsers = totalUsers - adminUsers;

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "adminUsers", adminUsers,
                "regularUsers", regularUsers,
                "totalReservations", totalReservations
        ));
    }

    // Get map layout
    @GetMapping("/map-layout")
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
            System.out.println("Loading map layout. ID: " + layout.getId());
            System.out.println("Layout data length: " + (layout.getLayoutData() != null ? layout.getLayoutData().length() : 0));
            
            Map<String, Object> layoutData = objectMapper.readValue(
                layout.getLayoutData(),
                Map.class
            );
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> halls = (List<Map<String, Object>>) layoutData.get("halls");
            if (halls != null) {
                System.out.println("Loaded map layout with " + halls.size() + " halls");
                int totalStalls = halls.stream()
                    .mapToInt(hall -> {
                        Object stallsObj = hall.get("stalls");
                        if (stallsObj instanceof List) {
                            return ((List<?>) stallsObj).size();
                        }
                        return 0;
                    })
                    .sum();
                System.out.println("Total stalls: " + totalStalls);
            }
            
            return ResponseEntity.ok(layoutData);
        } catch (Exception e) {
            System.err.println("Failed to parse map layout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to parse map layout: " + e.getMessage()));
        }
    }

    // Save map layout
    @PostMapping("/map-layout")
    public ResponseEntity<?> saveMapLayout(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        try {
            // Validate request has halls
            if (!request.containsKey("halls") || !(request.get("halls") instanceof List)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid request: 'halls' array is required"));
            }
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> halls = (List<Map<String, Object>>) request.get("halls");
            
            // Validate at least one hall with stalls
            boolean hasStalls = halls.stream()
                .anyMatch(hall -> {
                    Object stallsObj = hall.get("stalls");
                    if (stallsObj instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<?> stalls = (List<?>) stallsObj;
                        return !stalls.isEmpty();
                    }
                    return false;
                });
            
            if (!hasStalls) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "At least one hall with stalls is required"));
            }
            
            // Create/update stalls in database from map layout
            int createdStalls = 0;
            int updatedStalls = 0;
            int errorStalls = 0;
            
            for (Map<String, Object> hall : halls) {
                Object stallsObj = hall.get("stalls");
                if (stallsObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> stalls = (List<Map<String, Object>>) stallsObj;
                    
                    for (Map<String, Object> stallData : stalls) {
                        try {
                            String stallId = (String) stallData.get("stallId");
                            if (stallId == null || stallId.isEmpty()) {
                                stallId = (String) stallData.get("id");
                            }
                            if (stallId == null || stallId.isEmpty()) {
                                System.out.println("Warning: Skipping stall without ID: " + stallData);
                                continue; // Skip stalls without ID
                            }
                            
                            // Find existing stall by name (use final variable for lambda)
                            final String finalStallId = stallId;
                            Optional<com.example.bookfair.user.model.Stall> existingStallOpt = 
                                stallRepository.findAll().stream()
                                    .filter(s -> finalStallId.equals(s.getName()))
                                    .findFirst();
                            
                            com.example.bookfair.user.model.Stall stall;
                            if (existingStallOpt.isPresent()) {
                                stall = existingStallOpt.get();
                                updatedStalls++;
                            } else {
                                stall = new com.example.bookfair.user.model.Stall();
                                createdStalls++;
                            }
                            
                            // Update stall properties
                            stall.setName(stallId);
                            
                            // Get size from stallData or default to SMALL
                            String size = (String) stallData.get("size");
                            if (size == null || size.isEmpty()) {
                                size = "SMALL";
                            }
                            stall.setSize(size.toUpperCase());
                            
                            // Get coordinates
                            Object xObj = stallData.get("x");
                            Object yObj = stallData.get("y");
                            if (xObj instanceof Number) {
                                stall.setX(((Number) xObj).intValue());
                            } else {
                                stall.setX(0);
                            }
                            if (yObj instanceof Number) {
                                stall.setY(((Number) yObj).intValue());
                            } else {
                                stall.setY(0);
                            }
                            
                            // Preserve reserved status if stall already exists
                            if (existingStallOpt.isEmpty()) {
                                stall.setReserved(false);
                            }
                            
                            stallRepository.save(stall);
                        } catch (Exception e) {
                            errorStalls++;
                            System.err.println("Error saving stall: " + stallData + " - " + e.getMessage());
                            e.printStackTrace();
                        }
                    }
                }
            }
            
            if (errorStalls > 0) {
                System.err.println("Warning: " + errorStalls + " stalls failed to save");
            }
            
            // Convert to JSON string
            String layoutJson = objectMapper.writeValueAsString(request);
            
            // Create and save map layout
            MapLayout layout = new MapLayout();
            layout.setLayoutData(layoutJson);
            
            // Save to database
            MapLayout savedLayout = mapLayoutRepository.save(layout);
            
            // Verify it was saved by reading it back
            Optional<MapLayout> verifyLayout = mapLayoutRepository.findById(savedLayout.getId());
            if (verifyLayout.isEmpty()) {
                System.err.println("WARNING: Map layout was not saved to database!");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to save map layout to database"));
            }
            
            int totalStalls = halls.stream()
                .mapToInt(hall -> {
                    Object stallsObj = hall.get("stalls");
                    if (stallsObj instanceof List) {
                        return ((List<?>) stallsObj).size();
                    }
                    return 0;
                })
                .sum();
            
            System.out.println("✓ Map layout saved successfully to database!");
            System.out.println("  - ID: " + savedLayout.getId());
            System.out.println("  - Total halls: " + halls.size());
            System.out.println("  - Total stalls: " + totalStalls);
            System.out.println("  - Created stalls: " + createdStalls);
            System.out.println("  - Updated stalls: " + updatedStalls);
            if (errorStalls > 0) {
                System.out.println("  - Error stalls: " + errorStalls);
            }
            System.out.println("  - Data size: " + layoutJson.length() + " characters");
            System.out.println("  - Created at: " + savedLayout.getCreatedAt());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Map layout saved successfully");
            response.put("id", savedLayout.getId());
            response.put("hallsCount", halls.size());
            response.put("totalStalls", totalStalls);
            response.put("createdStalls", createdStalls);
            response.put("updatedStalls", updatedStalls);
            if (errorStalls > 0) {
                response.put("errorStalls", errorStalls);
                response.put("warning", errorStalls + " stalls failed to save");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Failed to save map layout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save map layout: " + e.getMessage()));
        }
    }

    // Clear all reservations and reset stall statuses
    @DeleteMapping("/clear-reservations")
    public ResponseEntity<?> clearAllReservations(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Admin access required"));
        }

        try {
            // Get all reservations
            List<Reservation> allReservations = reservationRepository.findAll();
            long count = allReservations.size();

            // Delete all reservations
            reservationRepository.deleteAll();

            // Reset all stalls to unreserved status
            List<com.example.bookfair.user.model.Stall> allStalls = stallRepository.findAll();
            for (com.example.bookfair.user.model.Stall stall : allStalls) {
                stall.setReserved(false);
                stallRepository.save(stall);
            }

            return ResponseEntity.ok(Map.of(
                "message", "All reservations cleared successfully",
                "deletedReservations", count,
                "resetStalls", allStalls.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to clear reservations: " + e.getMessage()));
        }
    }

    // Clear all data (reservations, map layouts, and optionally users)
    @DeleteMapping("/clear-all-data")
    public ResponseEntity<?> clearAllData(
            Authentication authentication,
            @RequestParam(defaultValue = "false") boolean includeUsers) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Admin access required"));
        }

        try {
            // Delete all reservations
            long reservationCount = reservationRepository.count();
            reservationRepository.deleteAll();

            // Reset all stalls to unreserved status
            List<com.example.bookfair.user.model.Stall> allStalls = stallRepository.findAll();
            for (com.example.bookfair.user.model.Stall stall : allStalls) {
                stall.setReserved(false);
                stallRepository.save(stall);
            }

            // Delete all map layouts
            long mapLayoutCount = mapLayoutRepository.count();
            mapLayoutRepository.deleteAll();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "All data cleared successfully");
            response.put("deletedReservations", reservationCount);
            response.put("resetStalls", allStalls.size());
            response.put("deletedMapLayouts", mapLayoutCount);

            // Optionally delete users (except admins)
            if (includeUsers) {
                List<User> nonAdminUsers = userRepository.findAll().stream()
                    .filter(u -> !"ADMIN".equals(u.getRole()))
                    .collect(Collectors.toList());
                long userCount = nonAdminUsers.size();
                userRepository.deleteAll(nonAdminUsers);
                response.put("deletedUsers", userCount);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to clear data: " + e.getMessage()));
        }
    }

    // Delete all stalls (stalls are now created when map is saved)
    @DeleteMapping("/delete-all-stalls")
    public ResponseEntity<?> deleteAllStalls(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Admin access required"));
        }

        try {
            // Delete all reservations first (they reference stalls)
            long reservationCount = reservationRepository.count();
            reservationRepository.deleteAll();
            
            // Delete all existing stalls
            long existingCount = stallRepository.count();
            stallRepository.deleteAll();
            
            return ResponseEntity.ok(Map.of(
                "message", "All stalls and reservations deleted successfully",
                "deletedStalls", existingCount,
                "deletedReservations", reservationCount,
                "note", "Stalls will be created automatically when you save a map layout."
            ));
        } catch (Exception e) {
            System.err.println("Failed to delete stalls: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete stalls: " + e.getMessage()));
        }
    }
}

