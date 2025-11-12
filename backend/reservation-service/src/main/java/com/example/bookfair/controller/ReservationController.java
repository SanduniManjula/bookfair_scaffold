package com.example.bookfair.controller;

import com.example.bookfair.dto.*;
import com.example.bookfair.model.MapLayout;
import com.example.bookfair.repository.MapLayoutRepository;
import com.example.bookfair.service.ReservationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private MapLayoutRepository mapLayoutRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/available")
    public ResponseEntity<List<StallResponse>> availableStalls() {
        List<StallResponse> responses = reservationService.getAvailableStalls();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/all")
    public ResponseEntity<List<StallResponse>> allStalls() {
        List<StallResponse> responses = reservationService.getAllStalls();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/reserve")
    public ResponseEntity<ReservationCreateResponse> reserve(@Valid @RequestBody ReservationRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        ReservationCreateResponse response = reservationService.createReservation(request.getStallId(), userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<List<ReservationResponse>> myReservations(Authentication authentication) {
        String userEmail = authentication.getName();
        List<ReservationResponse> responses = reservationService.getUserReservations(userEmail);
        return ResponseEntity.ok(responses);
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

