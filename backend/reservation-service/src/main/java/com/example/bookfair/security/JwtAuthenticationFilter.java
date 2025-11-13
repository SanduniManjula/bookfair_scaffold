package com.example.bookfair.security;

import com.example.bookfair.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        
        // Skip JWT processing for public endpoints
        if (path.startsWith("/api/reservations/available") || 
            path.startsWith("/api/reservations/all") ||
            path.startsWith("/api/reservations/map-layout") ||
            path.equals("/api/admin/stats-internal") ||
            path.equals("/api/admin/user-counts-internal")) {
            chain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                logger.debug("Extracted username from JWT: {} for path: {}", username, path);
            } catch (Exception e) {
                logger.warn("Failed to extract username from JWT for path {}: {}", path, e.getMessage());
                // Invalid token - continue without authentication
            }
        } else {
            logger.debug("No Authorization header found for path: {}", path);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                if (jwtUtil.validateToken(jwt, username)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            new ArrayList<>()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication set for user: {} on path: {}", username, path);
                } else {
                    logger.warn("JWT token validation failed for user: {} on path: {}", username, path);
                }
            } catch (Exception e) {
                logger.error("Error validating JWT token for user: {} on path: {}: {}", username, path, e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }
}

