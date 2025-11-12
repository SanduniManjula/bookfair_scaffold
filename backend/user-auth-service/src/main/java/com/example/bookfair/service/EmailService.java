package com.example.bookfair.service;

import com.example.bookfair.user.model.Reservation;
import com.example.bookfair.user.model.Stall;
import com.example.bookfair.user.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired(required = false)
    private RestTemplate restTemplate;

    @Value("${email.service.url:http://localhost:8083}")
    private String emailServiceUrl;
    
    private RestTemplate getRestTemplate() {
        if (restTemplate == null) {
            restTemplate = new RestTemplate();
        }
        return restTemplate;
    }

    public void sendReservationConfirmation(User user, Stall stall, Reservation reservation, String qrCodePath) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("email", user.getEmail());
            request.put("username", user.getUsername());
            request.put("stallName", stall.getName());
            request.put("stallSize", stall.getSize());
            request.put("reservationId", reservation.getId());
            request.put("createdAt", reservation.getCreatedAt().toString());
            request.put("qrCodePath", qrCodePath);

            getRestTemplate().postForObject(
                    emailServiceUrl + "/api/email/reservation-confirmation",
                    request,
                    Map.class
            );
            logger.info("Confirmation email request sent to email service for: {}", user.getEmail());
        } catch (Exception e) {
            logger.warn("Failed to send confirmation email via email service for {}: {}", 
                    user.getEmail(), e.getMessage());
            // Don't throw exception - reservation should succeed even if email fails
        }
    }

    // Send welcome email on user registration
    public void sendWelcomeEmail(User user) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("email", user.getEmail());
            request.put("username", user.getUsername());

            getRestTemplate().postForObject(
                    emailServiceUrl + "/api/email/welcome",
                    request,
                    Map.class
            );
            logger.info("Welcome email request sent to email service for: {}", user.getEmail());
        } catch (Exception e) {
            logger.warn("Failed to send welcome email via email service for {}: {}", 
                    user.getEmail(), e.getMessage());
            // Don't throw exception for welcome email - registration should succeed even if email fails
        }
    }

    // Send reservation request email (when reservation is created)
    public void sendReservationRequestEmail(User user, Stall stall, Reservation reservation) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("email", user.getEmail());
            request.put("username", user.getUsername());
            request.put("stallName", stall.getName());
            request.put("stallSize", stall.getSize());
            request.put("reservationId", reservation.getId());
            request.put("createdAt", reservation.getCreatedAt().toString());

            getRestTemplate().postForObject(
                    emailServiceUrl + "/api/email/reservation-request",
                    request,
                    Map.class
            );
            logger.info("Reservation request email sent to email service for: {}", user.getEmail());
        } catch (Exception e) {
            logger.warn("Failed to send reservation request email via email service for {}: {}", 
                    user.getEmail(), e.getMessage());
            // Don't throw exception - reservation should succeed even if email fails
        }
    }

}

