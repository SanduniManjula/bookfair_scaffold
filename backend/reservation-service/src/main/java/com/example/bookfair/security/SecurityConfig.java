package com.example.bookfair.security;

import com.example.bookfair.config.CorsConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private CorsConfig corsConfig;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/reservations/available").permitAll()
                        .requestMatchers("/api/reservations/all").permitAll()
                        .requestMatchers("/api/reservations/map-layout").permitAll()
                        .requestMatchers("/api/admin/stats-internal").permitAll()
                        .requestMatchers("/api/admin/user-counts-internal").permitAll()
                        .requestMatchers("/api/reservations/my-reservations").authenticated()
                        .requestMatchers("/api/reservations/reserve").authenticated()
                        .requestMatchers("/api/admin/reservations/**").authenticated()
                        .requestMatchers("/api/admin/stalls/**").authenticated()
                        .requestMatchers("/api/admin/map-layout/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

