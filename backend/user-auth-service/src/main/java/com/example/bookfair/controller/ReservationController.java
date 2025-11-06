package com.example.bookfair.user.controller;

import com.example.bookfair.user.model.*;
import com.example.bookfair.user.repository.*;
import com.example.bookfair.util.EmailService;
import com.example.bookfair.util.QrUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "http://localhost:3000")
public class ReservationController {

    @Autowired
    private StallRepository stallRepo;

    @Autowired
    private ReservationRepository resRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private MapLayoutRepository mapLayoutRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Value("${qr.code.directory:./qr-codes}")
    private String qrDirectory;

    @GetMapping("/available")
    public List<Stall> availableStalls() {
        return stallRepo.findByReservedFalse();
    }

    @GetMapping("/all")
    public List<Stall> allStalls() {
        // Return stalls sorted by ID to maintain polygon order (stalls are created in polygon index order)
        return stallRepo.findAll().stream()
            .sorted((a, b) -> Long.compare(a.getId(), b.getId()))
            .collect(Collectors.toList());
    }

    @PostMapping("/reserve")
    public ResponseEntity<Map<String, Object>> reserve(@RequestBody Map<String, Long> request, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Long stallId = request.get("stallId");

            Optional<User> userOpt = userRepo.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            Long userId = user.getId();

            // Check if user already has 3 reservations
            long count = resRepo.countByUserId(userId);
            if (count >= 3) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Maximum 3 stalls allowed per user"));
            }

            Optional<Stall> stallOpt = stallRepo.findById(stallId);
            if (stallOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Stall not found"));
            }

            Stall stall = stallOpt.get();
            if (stall.isReserved()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Stall already reserved"));
            }

            // Reserve the stall
            stall.setReserved(true);
            stallRepo.save(stall);

            // Create reservation
            Reservation reservation = new Reservation();
            reservation.setUser(user);
            reservation.setStall(stall);
            reservation = resRepo.save(reservation);

            // Send reservation request email (immediately after creation)
            try {
                emailService.sendReservationRequestEmail(user, stall, reservation);
            } catch (Exception e) {
                // Log error but don't fail the reservation
                System.err.println("Failed to send reservation request email: " + e.getMessage());
            }

            // Generate QR code
            String qrText = String.format("Bookfair-%d-%d-%s", reservation.getId(), stallId, userEmail);
            Path qrDir = Paths.get(qrDirectory);
            if (!Files.exists(qrDir)) {
                Files.createDirectories(qrDir);
            }
            String qrFilename = "qr_" + reservation.getId() + ".png";
            Path qrPath = qrDir.resolve(qrFilename);
            QrUtil.generateQRCodeImage(qrText, qrPath.toString());
            reservation.setQrCodeFilename(qrFilename);
            resRepo.save(reservation);

            // Send confirmation email with QR code (after QR code is generated)
            // Use absolute path so email-service can access the file
            try {
                String absoluteQrPath = qrPath.toAbsolutePath().toString();
                emailService.sendReservationConfirmation(user, stall, reservation, absoluteQrPath);
            } catch (Exception e) {
                // Log error but don't fail the reservation
                System.err.println("Failed to send confirmation email: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Reservation confirmed successfully",
                    "reservationId", reservation.getId(),
                    "stallName", stall.getName(),
                    "qrCodeFilename", qrFilename
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create reservation: " + e.getMessage()));
        }
    }

    @GetMapping("/my-reservations")
    public List<Map<String, Object>> myReservations(Authentication authentication) {
        String userEmail = authentication.getName();
        Optional<User> userOpt = userRepo.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return Collections.emptyList();
        }

        List<Reservation> reservations = resRepo.findByUser(userOpt.get());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Reservation r : reservations) {
            Map<String, Object> res = new HashMap<>();
            res.put("id", r.getId());
            res.put("stallName", r.getStall().getName());
            res.put("stallSize", r.getStall().getSize());
            res.put("createdAt", r.getCreatedAt());
            res.put("qrCodeFilename", r.getQrCodeFilename());
            result.add(res);
        }
        return result;
    }

    // Get map layout (public endpoint for viewing the map)
    @GetMapping("/map-layout")
    public ResponseEntity<?> getMapLayout() {
        try {
            Optional<MapLayout> layoutOpt = mapLayoutRepository.findTopByOrderByIdDesc();
            if (layoutOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of("halls", new ArrayList<>()));
            }

            MapLayout layout = layoutOpt.get();
            Map<String, Object> layoutData = objectMapper.readValue(
                layout.getLayoutData(),
                Map.class
            );
            return ResponseEntity.ok(layoutData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to parse map layout: " + e.getMessage()));
        }
    }
}
