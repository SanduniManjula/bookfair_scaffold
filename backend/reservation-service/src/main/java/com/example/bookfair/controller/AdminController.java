package com.example.bookfair.controller;

import com.example.bookfair.client.UserClient;
import com.example.bookfair.dto.UserResponse;
import com.example.bookfair.exception.ResourceNotFoundException;
import com.example.bookfair.model.MapLayout;
import com.example.bookfair.model.Reservation;
import com.example.bookfair.model.Stall;
import com.example.bookfair.repository.MapLayoutRepository;
import com.example.bookfair.repository.ReservationRepository;
import com.example.bookfair.repository.StallRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private StallRepository stallRepository;

    @Autowired
    private MapLayoutRepository mapLayoutRepository;

    @Autowired
    private UserClient userClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.example.bookfair.security.JwtUtil jwtUtil;

    // Helper method to check if user is admin
    // First tries to get role from JWT token (faster, more reliable)
    // Falls back to user-service call if token doesn't have role
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) {
            logger.warn("Authentication is null - cannot check admin status");
            return false;
        }
        String email = authentication.getName();
        logger.debug("Checking admin status for user: {}", email);
        
        // Try to get role from JWT token first (from request header)
        try {
            jakarta.servlet.http.HttpServletRequest request = 
                ((org.springframework.web.context.request.ServletRequestAttributes) 
                    org.springframework.web.context.request.RequestContextHolder.getRequestAttributes())
                    .getRequest();
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String role = jwtUtil.extractRole(token);
                if (role != null) {
                    boolean isAdmin = "ADMIN".equals(role);
                    logger.debug("User {} has role from token: {}, isAdmin: {}", email, role, isAdmin);
                    return isAdmin;
                }
            }
        } catch (Exception e) {
            logger.debug("Could not extract role from token, falling back to user-service: {}", e.getMessage());
        }
        
        // Fallback: get role from user-service
        try {
            UserResponse user = userClient.getUserByEmail(email);
            if (user == null) {
                logger.warn("User not found for email: {}", email);
                return false;
            }
            boolean isAdmin = "ADMIN".equals(user.getRole());
            logger.debug("User {} has role from user-service: {}, isAdmin: {}", email, user.getRole(), isAdmin);
            return isAdmin;
        } catch (Exception e) {
            logger.error("Failed to check admin status for user {}: {}", email, e.getMessage(), e);
            return false;
        }
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
                    resMap.put("userId", reservation.getUserId());
                    resMap.put("userEmail", reservation.getUserEmail());
                    
                    // Fetch user details from user-service
                    try {
                        UserResponse user = userClient.getUserById(reservation.getUserId());
                        if (user != null) {
                            resMap.put("username", user.getUsername());
                        }
                    } catch (Exception e) {
                        logger.warn("Failed to fetch user details for userId {}: {}", reservation.getUserId(), e.getMessage());
                    }
                    
                    resMap.put("stallId", reservation.getStall().getId());
                    resMap.put("stallName", reservation.getStall().getName());
                    resMap.put("stallSize", reservation.getStall().getSize());
                    resMap.put("stallGenres", reservation.getStall().getGenres() != null ? reservation.getStall().getGenres() : "");
                    resMap.put("createdAt", reservation.getCreatedAt());
                    resMap.put("qrCodeFilename", reservation.getQrCodeFilename());
                    return resMap;
                })
                .sorted((a, b) -> {
                    // Sort by created date, newest first
                    java.time.LocalDateTime dateA = (java.time.LocalDateTime) a.get("createdAt");
                    java.time.LocalDateTime dateB = (java.time.LocalDateTime) b.get("createdAt");
                    return dateB.compareTo(dateA);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("reservations", reservationList, "total", reservationList.size()));
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

    // Debug endpoint to check authentication status
    @GetMapping("/debug-auth")
    public ResponseEntity<?> debugAuth(Authentication authentication) {
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("authenticationPresent", authentication != null);
        if (authentication != null) {
            debugInfo.put("username", authentication.getName());
            debugInfo.put("authorities", authentication.getAuthorities().toString());
            debugInfo.put("details", authentication.getDetails() != null ? authentication.getDetails().toString() : "null");
        }
        debugInfo.put("isAdmin", isAdmin(authentication));
        return ResponseEntity.ok(debugInfo);
    }

    // Get map layout
    @GetMapping("/map-layout")
    public ResponseEntity<?> getMapLayout(Authentication authentication) {
        logger.info("GET /api/admin/map-layout - Authentication: {}", authentication != null ? authentication.getName() : "null");
        if (!isAdmin(authentication)) {
            logger.warn("GET /api/admin/map-layout - Access denied for user: {}", 
                    authentication != null ? authentication.getName() : "null");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        Optional<MapLayout> layoutOpt = mapLayoutRepository.findTopByOrderByIdDesc();
        if (layoutOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("halls", new ArrayList<>()));
        }

        try {
            MapLayout layout = layoutOpt.get();
            logger.debug("Loading map layout. ID: {}, Data length: {}", 
                    layout.getId(), 
                    layout.getLayoutData() != null ? layout.getLayoutData().length() : 0);
            
            Map<String, Object> layoutData = objectMapper.readValue(
                layout.getLayoutData(),
                Map.class
            );
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> halls = (List<Map<String, Object>>) layoutData.get("halls");
            if (halls != null) {
                int totalStalls = halls.stream()
                    .mapToInt(hall -> {
                        Object stallsObj = hall.get("stalls");
                        if (stallsObj instanceof List) {
                            return ((List<?>) stallsObj).size();
                        }
                        return 0;
                    })
                    .sum();
                logger.info("Loaded map layout with {} halls and {} total stalls", halls.size(), totalStalls);
            }
            
            return ResponseEntity.ok(layoutData);
        } catch (Exception e) {
            logger.error("Failed to parse map layout: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to parse map layout: " + e.getMessage()));
        }
    }

    // Save map layout
    @PostMapping("/map-layout")
    public ResponseEntity<?> saveMapLayout(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        logger.info("POST /api/admin/map-layout - Authentication: {}", authentication != null ? authentication.getName() : "null");
        if (!isAdmin(authentication)) {
            logger.warn("POST /api/admin/map-layout - Access denied for user: {}", 
                    authentication != null ? authentication.getName() : "null");
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
                                logger.warn("Skipping stall without ID: {}", stallData);
                                continue;
                            }
                            
                            final String finalStallId = stallId;
                            Optional<Stall> existingStallOpt = 
                                stallRepository.findAll().stream()
                                    .filter(s -> finalStallId.equals(s.getName()))
                                    .findFirst();
                            
                            Stall stall;
                            if (existingStallOpt.isPresent()) {
                                stall = existingStallOpt.get();
                                updatedStalls++;
                            } else {
                                stall = new Stall();
                                createdStalls++;
                            }
                            
                            stall.setName(stallId);
                            
                            String size = (String) stallData.get("size");
                            if (size == null || size.isEmpty()) {
                                size = "SMALL";
                            }
                            stall.setSize(size.toUpperCase());
                            
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
                            
                            if (existingStallOpt.isEmpty()) {
                                stall.setReserved(false);
                            }
                            
                            stallRepository.save(stall);
                        } catch (Exception e) {
                            errorStalls++;
                            logger.error("Error saving stall: {} - {}", stallData, e.getMessage(), e);
                        }
                    }
                }
            }
            
            if (errorStalls > 0) {
                logger.warn("{} stalls failed to save", errorStalls);
            }
            
            String layoutJson = objectMapper.writeValueAsString(request);
            
            MapLayout layout = new MapLayout();
            layout.setLayoutData(layoutJson);
            
            MapLayout savedLayout = mapLayoutRepository.save(layout);
            
            Optional<MapLayout> verifyLayout = mapLayoutRepository.findById(savedLayout.getId());
            if (verifyLayout.isEmpty()) {
                logger.error("Map layout was not saved to database! ID: {}", savedLayout.getId());
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
            
            logger.info("Map layout saved successfully - ID: {}, Halls: {}, Total stalls: {}, Created: {}, Updated: {}, Errors: {}", 
                    savedLayout.getId(), halls.size(), totalStalls, createdStalls, updatedStalls, errorStalls);

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
            logger.error("Failed to save map layout: {}", e.getMessage(), e);
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
            List<Reservation> allReservations = reservationRepository.findAll();
            long count = allReservations.size();

            reservationRepository.deleteAll();

            List<Stall> allStalls = stallRepository.findAll();
            for (Stall stall : allStalls) {
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

    // Clear all data (reservations, map layouts, and stalls)
    @DeleteMapping("/clear-all-data")
    public ResponseEntity<?> clearAllData(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Admin access required"));
        }

        try {
            long reservationCount = reservationRepository.count();
            reservationRepository.deleteAll();

            List<Stall> allStalls = stallRepository.findAll();
            for (Stall stall : allStalls) {
                stall.setReserved(false);
                stallRepository.save(stall);
            }

            long mapLayoutCount = mapLayoutRepository.count();
            mapLayoutRepository.deleteAll();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "All data cleared successfully");
            response.put("deletedReservations", reservationCount);
            response.put("resetStalls", allStalls.size());
            response.put("deletedMapLayouts", mapLayoutCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to clear data: " + e.getMessage()));
        }
    }

    // Delete all stalls
    @DeleteMapping("/delete-all-stalls")
    public ResponseEntity<?> deleteAllStalls(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Admin access required"));
        }

        try {
            long reservationCount = reservationRepository.count();
            reservationRepository.deleteAll();
            
            long existingCount = stallRepository.count();
            stallRepository.deleteAll();
            
            logger.info("Deleted all stalls and reservations - Stalls: {}, Reservations: {}", existingCount, reservationCount);
            return ResponseEntity.ok(Map.of(
                "message", "All stalls and reservations deleted successfully",
                "deletedStalls", existingCount,
                "deletedReservations", reservationCount,
                "note", "Stalls will be created automatically when you save a map layout."
            ));
        } catch (Exception e) {
            logger.error("Failed to delete stalls: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete stalls: " + e.getMessage()));
        }
    }

    // Get reservation statistics (internal endpoint for user-service)
    @GetMapping("/stats-internal")
    public ResponseEntity<?> getReservationStats() {
        try {
            long totalReservations = reservationRepository.count();
            long totalStalls = stallRepository.count();
            long reservedStalls = stallRepository.findAll().stream()
                    .filter(Stall::isReserved)
                    .count();
            long availableStalls = totalStalls - reservedStalls;

            return ResponseEntity.ok(Map.of(
                    "totalReservations", totalReservations,
                    "totalStalls", totalStalls,
                    "reservedStalls", reservedStalls,
                    "availableStalls", availableStalls
            ));
        } catch (Exception e) {
            logger.error("Failed to get reservation stats: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get reservation stats: " + e.getMessage()));
        }
    }

    // Get reservation counts per user (internal endpoint for user-service)
    @GetMapping("/user-counts-internal")
    public ResponseEntity<?> getReservationCountsByUser() {
        try {
            List<Reservation> allReservations = reservationRepository.findAll();
            
            // Group reservations by userId and count them
            Map<Long, Long> userReservationCounts = allReservations.stream()
                    .filter(r -> r.getUserId() != null)
                    .collect(java.util.stream.Collectors.groupingBy(
                            Reservation::getUserId,
                            java.util.stream.Collectors.counting()
                    ));

            return ResponseEntity.ok(userReservationCounts);
        } catch (Exception e) {
            logger.error("Failed to get user reservation counts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get user reservation counts: " + e.getMessage()));
        }
    }
}

