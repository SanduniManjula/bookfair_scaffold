package com.example.bookfair.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Feign configuration to pass Authorization header to downstream services
 */
@Configuration
public class FeignConfig {

    private static final Logger logger = LoggerFactory.getLogger(FeignConfig.class);

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                // Try to get Authorization header from current request
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    String authorizationHeader = request.getHeader("Authorization");
                    if (authorizationHeader != null) {
                        template.header("Authorization", authorizationHeader);
                        logger.debug("Forwarded Authorization header to Feign client");
                    } else {
                        logger.debug("No Authorization header found in request");
                    }
                } else {
                    logger.debug("RequestContextHolder has no request attributes");
                }
            }
        };
    }
}

