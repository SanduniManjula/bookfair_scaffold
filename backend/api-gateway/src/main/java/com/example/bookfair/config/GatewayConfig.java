package com.example.bookfair.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Gateway routing configuration
 */
@Configuration
public class GatewayConfig {

    private static final Logger logger = LoggerFactory.getLogger(GatewayConfig.class);

    @Value("${gateway.services.user-auth:http://localhost:8081}")
    private String userAuthServiceUrl;

    @Value("${gateway.services.email:http://localhost:8083}")
    private String emailServiceUrl;

    @Value("${gateway.services.employee:http://localhost:8085}")
    private String employeeServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        logger.info("Configuring API Gateway routes:");
        logger.info("  - User Auth Service: {}", userAuthServiceUrl);
        logger.info("  - Email Service: {}", emailServiceUrl);
        logger.info("  - Employee Service: {}", employeeServiceUrl);

        return builder.routes()
                // User Auth Service routes
                .route("user-auth-service", r -> r
                        .path("/api/auth/**", "/api/user/**", "/api/reservations/**", "/api/admin/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_FIRST")
                        )
                        .uri(userAuthServiceUrl)
                )
                // Email Service routes
                .route("email-service", r -> r
                        .path("/api/email/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_FIRST")
                        )
                        .uri(emailServiceUrl)
                )
                // Employee Service routes
                .route("employee-service", r -> r
                        .path("/api/employee/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_FIRST")
                        )
                        .uri(employeeServiceUrl)
                )
                .build();
    }
}

