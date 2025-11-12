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

    @Value("${gateway.services.user:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${gateway.services.reservation:http://localhost:8082}")
    private String reservationServiceUrl;

    @Value("${gateway.services.email:http://localhost:8083}")
    private String emailServiceUrl;

    @Value("${gateway.services.employee:http://localhost:8084}")
    private String employeeServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        logger.info("Configuring API Gateway routes:");
        logger.info("  - User Service: {}", userServiceUrl);
        logger.info("  - Reservation Service: {}", reservationServiceUrl);
        logger.info("  - Email Service: {}", emailServiceUrl);
        logger.info("  - Employee Service: {}", employeeServiceUrl);

        return builder.routes()
                // User Service routes (authentication and user management)
                .route("user-service", r -> r
                        .path("/api/auth/**", "/api/user/**", "/api/admin/users/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_FIRST")
                                // Authorization header is forwarded by default in Spring Cloud Gateway
                        )
                        .uri(userServiceUrl)
                )
                // Reservation Service routes (reservations, stalls, map layouts)
                .route("reservation-service", r -> r
                        .path("/api/reservations/**", "/api/admin/reservations/**", "/api/admin/stalls/**", "/api/admin/map-layout/**", "/api/admin/debug-auth", "/api/admin/clear-reservations", "/api/admin/clear-all-data", "/api/admin/delete-all-stalls")
                        .filters(f -> f
                                .preserveHostHeader()
                                .dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_FIRST")
                                // Authorization header is forwarded by default in Spring Cloud Gateway
                        )
                        .uri(reservationServiceUrl)
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

