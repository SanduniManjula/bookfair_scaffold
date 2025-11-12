package com.example.bookfair.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class EmailClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${email.service.url}")
    private String emailServiceUrl;

    public void sendReservationRequestEmail(String userEmail, String stallName, Long reservationId) {
        String url = emailServiceUrl + "/sendReservationRequest";

        Map<String, Object> body = new HashMap<>();
        body.put("userEmail", userEmail);
        body.put("stallName", stallName);
        body.put("reservationId", reservationId);

        restTemplate.postForEntity(url, body, Void.class);
    }

    public void sendReservationConfirmationEmail(String userEmail, String stallName, Long reservationId, String qrCodePath) {
        String url = emailServiceUrl + "/sendReservationConfirmation";

        Map<String, Object> body = new HashMap<>();
        body.put("userEmail", userEmail);
        body.put("stallName", stallName);
        body.put("reservationId", reservationId);
        body.put("qrCodePath", qrCodePath);

        restTemplate.postForEntity(url, body, Void.class);
    }
}
