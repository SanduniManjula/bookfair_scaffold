package com.example.bookfair.controller;

import com.example.bookfair.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;



@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "http://localhost:3000")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/welcome")
    public ResponseEntity<?> sendWelcomeEmail(@RequestBody Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            String username = (String) request.get("username");
            
            emailService.sendWelcomeEmail(email, username);
            
            return ResponseEntity.ok(Map.of("message", "Welcome email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send welcome email: " + e.getMessage()));
        }
    }

    @PostMapping("/reservation-request")
    public ResponseEntity<?> sendReservationRequestEmail(@RequestBody Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            String username = (String) request.get("username");
            String stallName = (String) request.get("stallName");
            String stallSize = (String) request.get("stallSize");
            Long reservationId = ((Number) request.get("reservationId")).longValue();
            String createdAt = (String) request.get("createdAt");
            
            emailService.sendReservationRequestEmail(email, username, stallName, stallSize, reservationId, createdAt);
            
            return ResponseEntity.ok(Map.of("message", "Reservation request email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send reservation request email: " + e.getMessage()));
        }
    }

    @PostMapping("/reservation-confirmation")
    public ResponseEntity<?> sendReservationConfirmation(@RequestBody Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            String username = (String) request.get("username");
            String stallName = (String) request.get("stallName");
            String stallSize = (String) request.get("stallSize");
            Long reservationId = ((Number) request.get("reservationId")).longValue();
            String createdAt = (String) request.get("createdAt");
            String qrCodePath = (String) request.get("qrCodePath");
            
            emailService.sendReservationConfirmation(email, username, stallName, stallSize, reservationId, createdAt, qrCodePath);
            
            return ResponseEntity.ok(Map.of("message", "Reservation confirmation email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send confirmation email: " + e.getMessage()));
        }
    }
}

