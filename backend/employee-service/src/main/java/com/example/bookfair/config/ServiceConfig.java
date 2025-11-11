package com.example.bookfair.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ServiceConfig {

    @Value("${user.service.url:http://localhost:8081}")
    private String userServiceUrl;

    public String getUserServiceUrl() {
        return userServiceUrl;
    }
}

