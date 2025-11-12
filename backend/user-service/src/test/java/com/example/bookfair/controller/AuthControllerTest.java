package com.example.bookfair.controller;

import com.example.bookfair.dto.LoginRequest;
import com.example.bookfair.dto.LoginResponse;
import com.example.bookfair.dto.UserRegistrationRequest;
import com.example.bookfair.service.AuthService;
import com.example.bookfair.user.controller.AuthController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegister_Success() throws Exception {
        // Given
        UserRegistrationRequest request = new UserRegistrationRequest();
        request.setUsername("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(authService.register(any(UserRegistrationRequest.class)))
                .thenReturn(Map.of("message", "Registered successfully"));

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registered successfully"));
    }

    @Test
    void testRegister_ValidationFailure() throws Exception {
        // Given - missing required fields
        UserRegistrationRequest request = new UserRegistrationRequest();
        request.setEmail("invalid-email"); // Invalid email format

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testLogin_Success() throws Exception {
        // Given
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        LoginResponse response = new LoginResponse();
        response.setMessage("Login successful");
        response.setToken("jwt-token");

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    void testLogin_ValidationFailure() throws Exception {
        // Given - missing password
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        // password is null

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}

