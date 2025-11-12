package com.example.bookfair.integration;

import com.example.bookfair.dto.LoginRequest;
import com.example.bookfair.dto.UserRegistrationRequest;
import com.example.bookfair.user.model.User;
import com.example.bookfair.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void testRegisterAndLogin_EndToEnd() throws Exception {
        // Register a new user
        UserRegistrationRequest registrationRequest = new UserRegistrationRequest();
        registrationRequest.setUsername("Integration Test User");
        registrationRequest.setEmail("integration@test.com");
        registrationRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registrationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registered successfully"));

        // Verify user was created
        assert userRepository.findByEmail("integration@test.com").isPresent();

        // Login with the registered user
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("integration@test.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("integration@test.com"));
    }

    @Test
    void testRegister_DuplicateEmail() throws Exception {
        // Create existing user
        User existingUser = new User();
        existingUser.setEmail("existing@test.com");
        existingUser.setUsername("Existing User");
        existingUser.setPassword(encoder.encode("password123"));
        userRepository.save(existingUser);

        // Try to register with same email
        UserRegistrationRequest request = new UserRegistrationRequest();
        request.setUsername("New User");
        request.setEmail("existing@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}

