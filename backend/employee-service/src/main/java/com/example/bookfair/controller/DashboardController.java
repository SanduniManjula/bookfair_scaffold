package com.example.bookfair.controller;

import com.example.bookfair.config.ServiceConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/employee/dashboard")
public class DashboardController {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ServiceConfig serviceConfig;

    @GetMapping("/stalls")
    public ResponseEntity<?> getAllStalls(Authentication authentication) {
        try {
            String url = serviceConfig.getUserServiceUrl() + "/api/reservations/all";
            ResponseEntity<Object[]> response = restTemplate.getForEntity(url, Object[].class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch stalls: " + e.getMessage()));
        }
    }

    @GetMapping("/reservations")
    public ResponseEntity<?> getAllReservations(Authentication authentication) {
        try {
            // This would need to be implemented in user-auth-service
            // For now, return a placeholder
            return ResponseEntity.ok(Collections.emptyList());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch reservations: " + e.getMessage()));
        }
    }
}

