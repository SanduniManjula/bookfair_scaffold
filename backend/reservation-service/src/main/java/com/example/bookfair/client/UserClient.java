package com.example.bookfair.client;

import com.example.bookfair.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for communicating with user-service
 */
@FeignClient(name = "user-service", url = "${user.service.url:http://localhost:8081}")
public interface UserClient {
    
    @GetMapping("/api/users/{id}")
    UserResponse getUserById(@PathVariable Long id);
    
    @GetMapping("/api/users/email/{email}")
    UserResponse getUserByEmail(@PathVariable String email);
}

