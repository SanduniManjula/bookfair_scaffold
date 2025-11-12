package com.example.bookfair.util;

import com.example.bookfair.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

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
            System.out.println("Welcome email request sent to email service for: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send welcome email via email service: " + e.getMessage());
            // Don't throw exception for welcome email - registration should succeed even if email fails
        }
    }

}
