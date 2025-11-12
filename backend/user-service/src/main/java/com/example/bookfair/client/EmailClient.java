package com.example.bookfair.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

/**
 * Feign client for communicating with email-service
 */
@FeignClient(name = "email-service", url = "${email.service.url:http://localhost:8083}")
public interface EmailClient {
    
    @PostMapping("/api/email/welcome")
    Map<String, Object> sendWelcomeEmail(@RequestBody Map<String, Object> request);
}

